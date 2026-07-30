import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/tokens';
import { getUserProfileAndEntitlements, saveUsageEvents } from '@/lib/auth/db';
import { initAIRuntime, CAPABILITY_ROUTES, type AIResult, type Capability } from '@/lib/ai/runtime';
import { checkQuota } from '@/lib/ai/quota';

export const dynamic = 'force-dynamic';

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
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return json(401, { error: 'unauthorized', message: 'Sign in to use AI features.', requestId });
        }
        const payload = verifyAccessToken(authHeader.substring(7).trim());
        if (!payload) {
            return json(401, { error: 'invalid_token', message: 'Your session has expired. Please sign in again.', requestId });
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
        const { entitlements } = await getUserProfileAndEntitlements(payload.sub);
        const plan = entitlements?.plan ?? 'free';
        if (plan === 'anonymous') {
            return json(403, { error: 'plan_required', message: 'Sign in to use AI features.', requestId });
        }

        // ── 3b. Rate limit + monthly ceiling (SECURITY S-3) ──────────────────
        // Entitlements answer "may this plan use AI"; this answers "how much, how
        // fast". Our own provider keys sit behind this endpoint, so without it one
        // account can drain the Sarvam balance or run up the Gemini bill.
        const quota = await checkQuota(payload.sub, plan);
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
        void recordUsage(payload.sub, capability, result, requestId);

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

function json(status: number, body: Record<string, unknown>) {
    return NextResponse.json(body, { status });
}

/** Best-effort telemetry — never fails the user's request. */
async function recordUsage(
    userId: string,
    capability: string,
    result: AIResult,
    requestId: string
): Promise<void> {
    try {
        await saveUsageEvents(userId, [
            {
                id: requestId,
                user_id: userId,
                type: 'ai_request',
                runtime: 'cloud',
                units: 1,
                ts: Date.now(),
                meta: {
                    capability,
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
