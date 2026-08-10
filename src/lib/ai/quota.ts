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

/**
 * Explicit local-development escape hatch for exercising long agent workflows.
 *
 * This is intentionally server-owned and allow-listed by verified user id. A
 * desktop flag or request header would make the production quota optional for
 * any modified client. `NODE_ENV !== 'production'` ensures the switch cannot
 * become a deployed entitlement by accident.
 */
export function hasDevelopmentUsageBypass(
    userId: string,
    env: NodeJS.ProcessEnv = process.env,
): boolean {
    if (env.NODE_ENV === 'production') return false;
    const allowedUsers = (env.AI_DEV_UNMETERED_USER_IDS ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    return allowedUsers.includes(userId);
}

export type QuotaVerdict =
    | { allowed: true; remainingThisMonth: number; usedUnits: number }
    | { allowed: false; reason: 'rate' | 'monthly' | 'plan' | 'credits'; message: string; retryAfterSecs?: number; usedUnits: number };

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
        // Summed over `credits_cost` rather than counted as rows.
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

        // ── Check Wallet Balance ──
        const { data: wallet, error: walletErr } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', userId)
            .single();

        if (walletErr && walletErr.code !== 'PGRST116') throw walletErr;
        if (wallet && (wallet.balance ?? 0) <= 0) {
            return {
                allowed: false,
                reason: 'credits',
                message: `You have exhausted your credits.`,
                usedUnits,
            };
        }

        return { allowed: true, remainingThisMonth: Math.max(0, allowance - usedUnits), usedUnits };
    } catch (err) {
        console.error('[ai] quota check failed, allowing request:', err);
        return { allowed: true, remainingThisMonth: -1, usedUnits: 0 };
    }
}

/**
 * Idempotently grant 100 signup credits to a user.
 */
export async function grantSignupCreditsIdempotent(userId: string): Promise<void> {
    try {
        const supabase = getSupabaseClient();
        
        const { error: walletErr } = await supabase
            .from('wallets')
            .insert({ user_id: userId, balance: 100 });
            
        if (walletErr && walletErr.code !== '23505') {
            console.error('[ai] Failed to create wallet for user', userId, walletErr);
            return;
        }
        
        if (!walletErr) {
            await supabase.from('credit_transactions').insert({
                user_id: userId,
                amount: 100,
                reason: 'signup_grant',
                status: 'completed'
            });
        }
    } catch (err) {
        console.error('[ai] grantSignupCreditsIdempotent failed:', err);
    }
}

export type ReservationResult = 
    | { allowed: true; reservationId: string }
    | { allowed: false; reason: 'insufficient_balance' | 'error'; message: string };

/**
 * Read the user's current wallet balance — the M side of a "you have M" quote.
 *
 * Read-only; this is NOT a second reservation. The enforcement stays with the
 * single `reserve_credits` RPC, which refuses atomically when M < N. This is the
 * pre-flight honesty layer: the user is shown the numbers BEFORE anything runs.
 */
export async function getWalletBalance(userId: string): Promise<number | null> {
    try {
        const supabase = getSupabaseClient();
        const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', userId)
            .maybeSingle();
        return wallet?.balance ?? 0;
    } catch (err) {
        console.error('[ai] wallet balance read failed:', err);
        // Fail open on a database blip: missing the estimate should not block
        // work. The reservation below still enforces the real boundary.
        return null;
    }
}

/**
 * Reserve credits BEFORE the provider call.
 */
export async function reserveCredits(userId: string, jobId: string | null, unitsToReserve: number): Promise<ReservationResult> {
    if (unitsToReserve <= 0) return { allowed: true, reservationId: 'free_call' };

    try {
        const supabase = getSupabaseClient();
        await grantSignupCreditsIdempotent(userId);

        const { data, error } = await supabase.rpc('reserve_credits', {
            p_user_id: userId,
            p_amount: unitsToReserve,
            p_job_id: jobId
        });

        if (error) {
            return { allowed: false, reason: 'error', message: 'Quota check failed due to a database error.' };
        }
        
        if (!data?.success) {
            const errType = data?.error === 'database_error' ? 'error' : 'insufficient_balance';
            const msg = data?.message || 'Insufficient balance.';
            return { allowed: false, reason: errType, message: msg };
        }

        return { allowed: true, reservationId: data.reservation_id };
    } catch (err) {
        console.error('[ai] reserveCredits failed:', err);
        return { allowed: false, reason: 'error', message: 'Quota check failed.' };
    }
}

export async function settleCredits(reservationId: string, actualUnits: number): Promise<void> {
    try {
        const supabase = getSupabaseClient();
        await supabase.rpc('settle_credits', {
            p_reservation_id: reservationId,
            p_actual_amount: actualUnits
        });
    } catch (err) {
        console.error('[ai] settleCredits failed:', err);
    }
}

/**
 * How much to actually charge for THIS call, given the job it belongs to.
 *
 * THE PROBLEM. `/api/ai` charged effort units on every call. That was right when
 * one prompt meant one request, and became wrong the moment the desktop started
 * tool-calling: a single "generate a background, place it, add a title" is a
 * dozen requests, so one task cost roughly 8% of a free month's allowance and
 * twelve prompts exhausted it.
 *
 * Worse than the number was its direction. Charging per round trip means every
 * improvement that makes Chithra more thorough — reading state before acting,
 * verifying afterwards, repairing a failure — makes the user's bill larger. We
 * would have been charging people for our own architecture.
 *
 * THE RULE (founder decision): a task costs the HEAVIEST capability it touched.
 * Generating video is priced like generating video whether the runtime needed
 * three calls or thirty; trimming a clip stays cheap no matter how carefully the
 * agent checked its work.
 *
 * WHY IT SETTLES INCREMENTALLY RATHER THAN AT THE END. There is no reliable
 * "task finished" signal — a run can be interrupted, crash, or lose the network,
 * and a settlement that only happens on a clean close would silently bill
 * nothing for all three. So each call charges only the DELTA between its own
 * effort and the most expensive thing this job has already been charged for. The
 * running total equals the heaviest capability at every moment, which means an
 * abandoned job is billed correctly for whatever it did reach, and no close
 * event is needed at all.
 *
 * `jobId` lives in `meta` rather than a dedicated column deliberately: it works
 * against the deployed schema with no migration, so the code can ship without a
 * SQL step that has to land first. At real scale this wants a `job_id` column
 * and an index — the query below is the thing that will tell us when.
 */
export async function chargeForCall(
    userId: string,
    jobId: string | null,
    unitsThisCall: number,
): Promise<number> {
    // No job means the old behaviour: a standalone call pays for itself. Captions,
    // a one-shot translation and anything not run under an Editing Job land here.
    if (!jobId || unitsThisCall <= 0) return unitsThisCall;

    try {
        const supabase = getSupabaseClient();
        const { data: rows, error } = await supabase
            .from('usage_events')
            .select('credits_cost')
            .eq('user_id', userId)
            .eq('type', 'ai_request')
            .eq('meta->>job_id', jobId);

        if (error) throw error;

        const alreadyCharged = (rows ?? []).reduce(
            (sum: number, r: { credits_cost: number | null }) => sum + (r.credits_cost ?? 0),
            0,
        );

        // Charge the difference, never a refund. If this call is lighter than
        // something the job already paid for, it is free.
        return Math.max(0, unitsThisCall - alreadyCharged);
    } catch (err) {
        // FAILS TOWARDS THE USER, matching `checkQuota` above: a Supabase blip
        // must not double-bill a task. Charging nothing for one call is a rounding
        // error; charging a full task twice is a support ticket.
        console.error('[ai] job settlement lookup failed, charging nothing for this call:', err);
        return 0;
    }
}
