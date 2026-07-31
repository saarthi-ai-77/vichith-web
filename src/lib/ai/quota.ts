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
import { allowanceFor } from './effort';

export interface PlanLimits {
    /** Requests allowed in any 60-second window. Burst protection.
     *  Counted as REQUESTS, not units — burst abuse is about frequency, and a
     *  cheap request hammered 1000×/second is still an attack. */
    readonly perMinute: number;
}

/**
 * Limits by plan.
 *
 * Free is deliberately tight: it is the tier an attacker gets for the price of an
 * email address, so it is the one that has to be survivable in bulk. Paid tiers
 * are generous enough that a real creator never notices them.
 */
export const PLAN_LIMITS: Record<string, PlanLimits> = {
    anonymous: { perMinute: 0 },
    // 5/min could not complete a single legitimate action.
    //
    // Sarvam's speech endpoint caps at 30 seconds, so captioning is inherently
    // chunked: a four-minute track is eleven requests, and a five-per-minute
    // ceiling rejected it at chunk six — then rejected the NEXT clip too, because
    // the budget was already spent. The user experienced "too many requests" for
    // pressing one button once.
    //
    // Burst protection is still the point; the number just has to exceed what one
    // honest action costs. Thirty covers roughly fourteen minutes of audio in a
    // single job, and the MONTHLY effort ceiling remains the real cost control —
    // this limit exists to stop hammering, not to meter spend.
    free: { perMinute: 30 },
    paid: { perMinute: 120 },
};

export function limitsForPlan(plan: string): PlanLimits {
    return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

export type QuotaVerdict =
    | { allowed: true; remainingThisMonth: number; usedUnits: number }
    | { allowed: false; reason: 'rate' | 'monthly' | 'plan'; message: string; retryAfterSecs?: number; usedUnits: number };

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
        return { allowed: false, reason: 'plan', message: 'Sign in to use AI features.', usedUnits: 0 };
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
                usedUnits: 0,
            };
        }

        // ── Monthly ceiling, in COST UNITS ──
        // Summed over `credits_cost` rather than counted as rows, because a frame
        // analysis and a one-line chat are not the same spend. Counting requests
        // would let 50 video analyses cost the same as 50 chat messages, which is
        // wrong in both directions: it over-charges light users and under-charges
        // the expensive ones we actually need to bound.
        //
        // Calendar month, not a rolling 30 days: it matches how a user reads their
        // plan and resets predictably.
        const startOfMonth = new Date();
        startOfMonth.setUTCDate(1);
        startOfMonth.setUTCHours(0, 0, 0, 0);

        const { data: rows, error: monthlyErr } = await supabase
            .from('usage_events')
            .select('credits_cost')
            .eq('user_id', userId)
            .eq('type', 'ai_request')
            .gte('ts', startOfMonth.getTime());

        if (monthlyErr) throw monthlyErr;

        const usedUnits = (rows ?? []).reduce(
            (sum: number, r: { credits_cost: number | null }) => sum + (r.credits_cost ?? 0),
            0
        );
        const allowance = allowanceFor(plan);

        if (usedUnits >= allowance) {
            return {
                allowed: false,
                reason: 'monthly',
                message: `You have used your AI allowance for this month.`,
                usedUnits,
            };
        }

        return { allowed: true, remainingThisMonth: Math.max(0, allowance - usedUnits), usedUnits };
    } catch (err) {
        console.error('[ai] quota check failed, allowing request:', err);
        return { allowed: true, remainingThisMonth: -1, usedUnits: 0 };
    }
}
