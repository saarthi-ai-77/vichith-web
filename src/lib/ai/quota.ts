/**
 * src/lib/ai/quota.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Per-user rate limiting and monthly ceilings for the AI Runtime.
 *
 * SECURITY FINDING S-3. `/api/ai` checked entitlements — *may this plan use AI* —
 * but never how much or how fast. Our own Gemini and Sarvam keys sit behind that
 * endpoint, so a single account (scripted, buggy, or hostile) could drain the
 * Sarvam credit balance or run up the Gemini bill. The cost lands on us, not on
 * the user, which is what makes it a security issue rather than a product one.
 *
 * WHY DATABASE-BACKED AND NOT IN-MEMORY
 * -------------------------------------
 * This runs on serverless. Each invocation may be a fresh instance, so an
 * in-memory counter would reset constantly and enforce nothing — the classic way
 * a rate limiter appears to work in development and protects nothing in
 * production. Counting rows in `usage_events`, which `/api/ai` already writes, is
 * correct across instances and needs no new infrastructure.
 *
 * Two DB reads per AI request is entirely acceptable at V1 scale (hundreds of
 * concurrent users). If it ever isn't, cache the monthly count — the per-minute
 * window is the one that must stay exact.
 */

import { getSupabaseClient } from '../supabase';

export interface PlanLimits {
    /** Requests allowed in any 60-second window. Burst protection. */
    readonly perMinute: number;
    /** Requests allowed per calendar month. The cost ceiling. */
    readonly perMonth: number;
}

/**
 * Limits by plan.
 *
 * Free is deliberately tight: it is the tier an attacker gets for the price of an
 * email address, so it is the one that has to be survivable in bulk. Paid tiers
 * are generous enough that a real creator never notices them.
 */
export const PLAN_LIMITS: Record<string, PlanLimits> = {
    anonymous: { perMinute: 0, perMonth: 0 },
    free: { perMinute: 5, perMonth: 50 },
    paid: { perMinute: 20, perMonth: 2000 },
};

export function limitsForPlan(plan: string): PlanLimits {
    return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

export type QuotaVerdict =
    | { allowed: true; remainingThisMonth: number }
    | { allowed: false; reason: 'rate' | 'monthly' | 'plan'; message: string; retryAfterSecs?: number };

/**
 * Check whether this user may make one more AI request.
 *
 * FAILS OPEN on a database error, deliberately. A transient Supabase blip should
 * degrade to "unmetered for a moment", not "nobody can use the product". The
 * monthly ceiling and the provider-side cost alarms are the backstops for the
 * window where that happens — see DEPLOYMENT.md §3.
 */
export async function checkQuota(userId: string, plan: string): Promise<QuotaVerdict> {
    const limits = limitsForPlan(plan);

    if (limits.perMinute === 0) {
        return { allowed: false, reason: 'plan', message: 'Sign in to use AI features.' };
    }

    try {
        const supabase = getSupabaseClient();
        const now = Date.now();

        // ── Burst window ──
        const minuteAgo = now - 60_000;
        const { count: recent, error: recentErr } = await supabase
            .from('usage_events')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'ai_request')
            .gte('ts', minuteAgo);

        if (recentErr) throw recentErr;

        if ((recent ?? 0) >= limits.perMinute) {
            return {
                allowed: false,
                reason: 'rate',
                message: 'You are sending requests too quickly. Please wait a moment and try again.',
                retryAfterSecs: 60,
            };
        }

        // ── Monthly ceiling ──
        // Calendar month, not a rolling 30 days: it matches how a user reads their
        // plan ("50 a month"), and it resets predictably.
        const startOfMonth = new Date();
        startOfMonth.setUTCDate(1);
        startOfMonth.setUTCHours(0, 0, 0, 0);

        const { count: monthly, error: monthlyErr } = await supabase
            .from('usage_events')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'ai_request')
            .gte('ts', startOfMonth.getTime());

        if (monthlyErr) throw monthlyErr;

        const used = monthly ?? 0;
        if (used >= limits.perMonth) {
            return {
                allowed: false,
                reason: 'monthly',
                message: `You have used all ${limits.perMonth} AI requests included this month.`,
            };
        }

        return { allowed: true, remainingThisMonth: Math.max(0, limits.perMonth - used - 1) };
    } catch (err) {
        console.error('[ai] quota check failed, allowing request:', err);
        return { allowed: true, remainingThisMonth: -1 };
    }
}
