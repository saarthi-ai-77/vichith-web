import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/identity';
import { getUserProfileAndEntitlements, saveUsageEvents } from '@/lib/auth/db';
import { initAIRuntime, CAPABILITY_ROUTES, type AIResult, type Capability } from '@/lib/ai/runtime';
import { checkQuota } from '@/lib/ai/quota';
import { effortFor, buildMeter, type ExecutionClass, type Magnitude } from '@/lib/ai/effort';
import { costMicroUsd } from '@/lib/ai/cost';

export const dynamic = 'force-dynamic';

/**
 * The platform's execution ceiling for this route.
 *
 * WITHOUT THIS LINE THE CAPABILITY TIMEOUTS ARE FICTION. `CAPABILITY_ROUTES`
 * declares up to 300 s for `speech.transcribe` — a legitimate number, since a long
 * interview takes minutes to transcribe — but a Next.js route on Vercel defaults to
 * around 10–15 s. The platform would kill the function long before our own timeout
 * fired, and the caller would get a raw gateway timeout instead of the sanitised
 * message this route works so hard to produce.
 *
 * It is the nastiest shape of bug this codebase keeps producing: the short calls
 * all succeed, so the runtime self-test passes and everything looks connected,
 * while the first real caption run on a real interview fails. Declared, wired,
 * never actually able to finish.
 *
 * 300 matches the longest declared capability timeout, so the two agree by
 * construction. **It requires a Vercel Pro plan** — Hobby caps at 60 s. If the
 * deployment is on Hobby, this must come down to 60 AND the 300 s entries in
 * `CAPABILITY_ROUTES` with it, because a timeout the platform will not honour is
 * worse than a short one: it promises something it cannot deliver.
 */
export const maxDuration = 300;

/**
 * POST /api/ai — the single entry point for every AI request from the desktop.
 *
 * The pipeline, in the order `AI_RUNTIME_V1.md` §4 fixes:
 *
 *   authentication → entitlements → capability resolution → media-approval gate
 *   → provider routing → execution → response validation → telemetry → result
 *
 * No provider is ever called except through this path, and the desktop never
 * learns which provider served it.
 *
 * NOT built yet, deliberately, and pluggable behind this without touching the
 * route: request queue, multi-layer rate limiting, health/cost-based routing,
 * deduplication. At the stated V1 scale (hundreds of concurrent users) they solve
 * problems we do not have — see §2.
 */
export async function POST(request: NextRequest) {
    const router = initAIRuntime();

    // Client-generated id, traced end to end and used as the idempotency key when
    // a queue lands. Generated here if absent so a request is never untraceable.
    const requestId =
        request.headers.get('x-request-id')?.trim() ||
        `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    try {
        // ── 1. Authentication ────────────────────────────────────────────────
        // S-4 Step 1: dual-accept (Supabase or legacy). See lib/auth/identity.ts.
        const identity = await authenticate(request);
        if (!identity) {
            return json(401, { error: 'unauthorized', message: 'Sign in to use AI features.', requestId });
        }

        // ── 2. Request shape ─────────────────────────────────────────────────
        const body = await request.json().catch(() => null);
        const capability = body?.capability as Capability | undefined;
        if (!capability || !(capability in CAPABILITY_ROUTES)) {
            return json(400, { error: 'unknown_capability', message: 'That AI capability is not available.', requestId });
        }
        const route = CAPABILITY_ROUTES[capability];

        // ── 3. Entitlements ──────────────────────────────────────────────────
        // Metering is server-side and attributed to the VERIFIED user id, never to
        // anything the client supplied — a modified desktop build cannot spoof it.
        const { entitlements } = await getUserProfileAndEntitlements(identity.userId);
        const plan = entitlements?.plan ?? 'free';
        if (plan === 'anonymous') {
            return json(403, { error: 'plan_required', message: 'Sign in to use AI features.', requestId });
        }

        // ── 3b. Rate limit + monthly ceiling (SECURITY S-3) ──────────────────
        // Entitlements answer "may this plan use AI"; this answers "how much, how
        // fast". Our own provider keys sit behind this endpoint, so without it one
        // account can drain the Sarvam balance or run up the Gemini bill.
        const quota = await checkQuota(identity.userId, plan);
        if (!quota.allowed) {
            const status = quota.reason === 'rate' ? 429 : 403;
            return NextResponse.json(
                { error: `quota_${quota.reason}`, message: quota.message, requestId },
                {
                    status,
                    // Standard header so a client can back off correctly instead of
                    // hammering and making the situation worse.
                    ...(quota.retryAfterSecs
                        ? { headers: { 'Retry-After': String(quota.retryAfterSecs) } }
                        : {}),
                }
            );
        }

        // ── 4. Media-upload approval ─────────────────────────────────────────
        // Declared on the ROUTE, so a capability cannot quietly begin uploading
        // media later without this gate noticing (AI_RUNTIME_V1.md §5.3).
        if (route.sendsMedia && body?.mediaApproved !== true) {
            return json(403, {
                error: 'media_not_approved',
                message: 'This operation needs to send media to the cloud. Approve it for this project to continue.',
                capability,
                requestId,
            });
        }

        // ── 5. Route + execute ───────────────────────────────────────────────
        const result = await router.dispatch({
            capability,
            requestId,
            payload: (body?.payload ?? {}) as Record<string, unknown>,
            stream: body?.stream === true,
        });

        // ── 6. Telemetry ─────────────────────────────────────────────────────
        // Recorded for successes AND failures: a failure rate that never reaches
        // analytics is the metric we would most want and least have.
        // EFFORT — what the user is charged. Provider-independent, and multiplied by
        // the class the work ACTUALLY ran in: native and local are free, cloud is not.
        // Anything reaching this route is cloud by definition; native and local
        // resolve on the desktop and never arrive here at all, so they cost zero by
        // construction rather than by a lookup returning zero.
        const executionClass: ExecutionClass = 'cloud';
        const magnitude: Magnitude = readMagnitude(body?.payload);
        const units = result.ok ? effortFor(capability, magnitude, executionClass) : 0;

        // COST — what WE spent. Recorded alongside, never joined to the above.
        const microUsd = result.ok ? costMicroUsd(result.provider, result.usage) : 0;

        void recordUsage(identity.userId, capability, result, requestId, identity.issuer, units, microUsd);

        if (!result.ok) {
            const status = result.code === 'QUOTA_EXCEEDED' ? 429 : result.retryable ? 503 : 400;
            return json(status, { error: result.code, message: result.message, requestId });
        }

        return json(200, {
            data: result.data,
            // Attribution travels with the response so the UI renders "Powered by
            // Sarvam" wherever Sarvam actually ran, instead of each call site
            // remembering to. The provider ID itself is NOT exposed.
            attribution: result.attribution,
            latencyMs: result.latencyMs,
            // -1 means the quota check failed open; the client should not render a
            // number it cannot trust.
            remainingThisMonth: quota.remainingThisMonth,
            // The meter the Chithra UI draws. Computed server-side so the client
            // cannot drift from what we actually counted.
            usage: { unitsCharged: units, meter: buildMeter(quota.usedUnits + units, plan) },
            requestId,
        });
    } catch (err: unknown) {
        console.error(`[ai] unhandled error for ${requestId}:`, err);
        return json(500, {
            error: 'server_error',
            message: 'Something went wrong on our side. Please try again.',
            requestId,
        });
    }
}

/**
 * Read the request's magnitude in the terms the effort model uses.
 *
 * Deliberately reads what the CALLER declared rather than inspecting payload sizes:
 * these values are what the UI quoted a price from, so charging against anything
 * else would mean the quote and the charge could disagree.
 */
function readMagnitude(payload: unknown): Magnitude {
    const p = (payload ?? {}) as Record<string, unknown>;
    const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined);
    return {
        clips: num(p.clipCount),
        images: num(p.imageCount),
        audioMinutes: num(p.durationSecs) ? num(p.durationSecs)! / 60 : undefined,
        videoSeconds: num(p.videoSeconds),
        characters: typeof p.text === 'string' ? p.text.length : undefined,
    };
}

function json(status: number, body: Record<string, unknown>) {
    return NextResponse.json(body, { status });
}

/** Best-effort telemetry — never fails the user's request. */
async function recordUsage(
    userId: string,
    capability: string,
    result: AIResult,
    requestId: string,
    /** Which identity system verified this caller. Step 6 of the auth migration —
     *  removing the legacy path — is gated on this reading zero legacy for a
     *  sustained period, so it must be recorded from the moment dual-accept ships. */
    issuer: string,
    /** Cost units charged. Stored in `credits_cost` so the monthly total is a
     *  SUM over a real column rather than a scan of JSON meta. */
    units: number,
    /** Real provider spend in micro-USD. INTERNAL — margin analysis only, and never
     *  an input to any quota or allowance. */
    microUsd: number
): Promise<void> {
    try {
        await saveUsageEvents(userId, [
            {
                id: requestId,
                user_id: userId,
                type: 'ai_request',
                runtime: 'cloud',
                units: 1,
                credits_cost: units,
                ts: Date.now(),
                meta: {
                    capability,
                    issuer,
                    executionClass: 'cloud',
                    costMicroUsd: microUsd,
                    ok: result.ok,
                    ...(result.ok
                        ? { latencyMs: result.latencyMs, usage: result.usage }
                        : { errorCode: result.code }),
                },
            },
        ]);
    } catch (err) {
        console.error(`[ai] telemetry write failed for ${requestId}:`, err);
    }
}
