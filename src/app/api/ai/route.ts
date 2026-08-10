import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/identity';
import { getUserProfileAndEntitlements, saveUsageEvents } from '@/lib/auth/db';
import { initAIRuntime, CAPABILITY_ROUTES, type AIResult, type Capability } from '@/lib/ai/runtime';
import { checkQuota, chargeForCall, getWalletBalance, hasDevelopmentUsageBypass, reserveCredits, settleCredits } from '@/lib/ai/quota';
import { toVichithStream } from '@/lib/ai/stream';
import { beginStream } from '@/lib/ai/streamRouter';
import { effortFor, buildMeter, type ExecutionClass, type Magnitude } from '@/lib/ai/effort';
import { costMicroUsd, estimateCostMicroUsd } from '@/lib/ai/cost';
import { selectModel, type ModelSelection } from '@/lib/ai/modelRouter';
import { listLlmModelCatalog } from '@/lib/compute/registry';

export const dynamic = 'force-dynamic';

/**
 * Capabilities the LLM catalog serves — the ones the Model Router governs.
 * Everything else is a unit-metered Sarvam lane (transcription, translation,
 * OCR, synthesis) with no model choice, and must never be routed through the
 * catalog. Computed once at module load from the single source of truth.
 */
const LLM_SERVED: ReadonlySet<string> = new Set(
    listLlmModelCatalog().flatMap((entry) => entry.capabilities),
);

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
        // Local development can explicitly allow-list a tester for repeated
        // long-running agent exercises. The bypass is evaluated on the server
        // against the authenticated user id and is disabled in production.
        const developmentBypass = hasDevelopmentUsageBypass(identity.userId);
        const quota = developmentBypass
            ? { allowed: true as const, remainingThisMonth: -1, usedUnits: 0 }
            : await checkQuota(identity.userId, plan);
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

        // ── 3c. Model selection (the Model Router) ──────────────────────────
        // Capability-aware: the router picks the cheapest model entitled for
        // THIS user that can serve THIS capability and hold the requested
        // output. A paid user may name a model explicitly; free users always
        // route to Sarvam, and the router says so out loud if they try to ask
        // for anything else. An unavailable model is an ERROR, never a silent
        // substitution.
        //
        // SCOPE: the router governs the LLM lane (chat/reasoning — the
        // capabilities the catalog declares). Unit-metered Sarvam endpoints
        // (speech.transcribe, text.translate, document.ocr, …) have NO model
        // choice — they are Sarvam lanes by design, and routing them through the
        // catalog would refuse a perfectly valid caption request. They stay on
        // the legacy capability route.
        const servedByLlmCatalog = LLM_SERVED.has(capability);
        const requestedModel =
            servedByLlmCatalog && typeof body?.modelId === 'string' && body.modelId.trim()
                ? body.modelId.trim()
                : undefined;
        const requestedMaxTokens =
            servedByLlmCatalog && typeof body?.payload?.maxOutputTokens === 'number'
                ? body.payload.maxOutputTokens
                : undefined;

        const selection = servedByLlmCatalog
            ? selectModel({
                  capability,
                  plan,
                  requestedModelId: requestedModel,
                  requiredMaxTokens: requestedMaxTokens,
              })
            : null;

        if (selection && !selection.ok) {
            switch (selection.code) {
                case 'ENTITLEMENT_REQUIRED':
                    return json(403, {
                        error: 'plan_required',
                        message: selection.message,
                        capability,
                        requestId,
                    });
                case 'MODEL_UNAVAILABLE':
                    return json(503, {
                        error: 'model_unavailable',
                        message: selection.message,
                        capability,
                        requestId,
                    });
                case 'OUTPUT_TOO_LONG':
                    return json(400, {
                        error: 'output_too_long',
                        message: selection.message,
                        capability,
                        requestId,
                    });
                default:
                    return json(400, {
                        error: 'unserved_capability',
                        message: selection.message,
                        capability,
                        requestId,
                    });
            }
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

        // ── 4a. Reserve Credits (Ledger) ─────────────────────────────────────
        const executionClass: ExecutionClass = 'cloud';
        const magnitude: Magnitude = readMagnitude(body?.payload);
        const rawUnits = effortFor(capability, magnitude, executionClass);
        const jobId = typeof body?.jobId === 'string' && body.jobId.trim() ? body.jobId.trim() : null;

        // COST PRE-FLIGHT — told BEFORE anything runs.
        //
        // The estimate, in CREDITS, is the same `rawUnits` the reservation
        // below holds: one estimate, one number, quoted before the provider is
        // touched. No cheap op gets over-billed, and an expensive one is never a
        // surprise — the reader sees "this is N credits, you have M".
        //
        // The balance is read, never re-architected: `reserve_credits` remains
        // the single atomic reservation and the real enforcement. This read only
        // decides whether to send the request at all, so M < N refuses with the
        // numbers VISIBLE instead of a generic "Insufficient balance." from deep
        // in an RPC.
        if (!developmentBypass) {
            const balance = await getWalletBalance(identity.userId);
            if (balance !== null && balance < rawUnits) {
                // Unit-metered lanes have no model choice; their provider is Sarvam
                // by construction, so the live-cost line always refers to Sarvam.
                const provider = selection?.selection.provider ?? 'sarvam';
                const microUsdSome = estimateCostMicroUsd(provider, capability, magnitude);
                // A zero estimate means "we don't know" (cost.ts), never "it is
                // free" — so it is shown only when it says something real.
                const costLine = microUsdSome > 0
                    ? ` The live provider cost is roughly $${(microUsdSome / 1_000_000).toFixed(3)}.`
                    : '';
                return json(402, {
                    error: 'insufficient_funds',
                    message:
                        `This is estimated at ${rawUnits} credit${rawUnits === 1 ? '' : 's'}, ` +
                        `and your balance is ${Math.max(0, balance)}.` +
                        costLine +
                        ` Add credits and try again.`,
                    estimate: { credits: rawUnits, currentBalance: Math.max(0, balance) },
                    requestId,
                });
            }
        }

        const reservation = developmentBypass
            ? { allowed: true as const, reservationId: 'dev_bypass' }
            : await reserveCredits(identity.userId, jobId, rawUnits);

        if (!reservation.allowed) {
            return json(402, { error: 'insufficient_funds', message: reservation.message, requestId });
        }

        // ── 4b. STREAMING BRANCH ─────────────────────────────────────────────
        //
        // Placed AFTER every gate above, deliberately: auth, entitlements, the
        // burst limit, the monthly ceiling and the media gate all apply to a
        // streamed call exactly as they do to a normal one. A branch that jumped
        // the queue would be a way to bypass all five.
        //
        // Opt-in and additive. Without `stream: true` nothing below changes, so
        // the non-streaming path — which every other capability and every older
        // desktop build uses — cannot regress.
        if (body?.stream === true) {
            const streamed = await beginStream({
                capability,
                requestId,
                payload: (body?.payload ?? {}) as Record<string, unknown>,
                stream: true,
            }, selection?.selection);

            if (!streamed.ok) {
                const status = streamed.error.code === 'QUOTA_EXCEEDED' ? 429 : streamed.error.retryable ? 503 : 400;
                return json(status, { error: streamed.error.code, message: streamed.error.message, requestId });
            }

            const events = toVichithStream(streamed.body, streamed.request, async ({ completed, usage }) => {
                // Settled once, on close, however the stream ended. A cancelled
                // run still pays for what reached the provider — see stream.ts.
                const units = await chargeForCall(identity.userId, jobId, rawUnits);
                
                if (reservation.reservationId && reservation.reservationId !== 'dev_bypass' && reservation.reservationId !== 'free_call') {
                    await settleCredits(reservation.reservationId, completed ? units : 0);
                }
                
                void recordUsage(
                    identity.userId,
                    capability,
                    // Shaped like a completed result so telemetry stays one format
                    // whether the answer arrived as a document or as tokens.
                    // `usage` is whatever the provider reported on the final
                    // frame; typed loosely here because a stream may end before
                    // one arrives, and telemetry must record the run either way.
                    { ok: true, requestId, data: null, provider: selection?.selection.provider ?? 'sarvam', attribution: selection?.selection.attribution ?? 'Sarvam AI', latencyMs: 0, usage: usage as never },
                    requestId,
                    identity.issuer,
                    units,
                    0,
                    jobId,
                );
                if (!completed) {
                    console.warn(`[ai] stream for ${requestId} closed without finishing; charged ${units} units`);
                }
            });

            return new Response(events, {
                headers: {
                    'Content-Type': 'text/event-stream; charset=utf-8',
                    'Cache-Control': 'no-cache, no-transform',
                    Connection: 'keep-alive',
                    // Vercel/nginx will happily buffer an event stream into one
                    // lump, which produces a "stream" that arrives all at once and
                    // looks exactly like the bug this replaces.
                    'X-Accel-Buffering': 'no',
                    'x-request-id': requestId,
                },
            });
        }

        // ── 5. Route + execute ───────────────────────────────────────────────
        // For the LLM lane, the Model Router already decided which model runs;
        // the dispatcher executes it and — because the selection is passed down —
        // an adapter failure is a FAILURE, never a silent hop to another model.
        // Unit-metered capabilities pass no selection and keep the legacy route.
        const result = await router.dispatch({
            capability,
            requestId,
            payload: (body?.payload ?? {}) as Record<string, unknown>,
            stream: body?.stream === true,
        }, selection?.selection);

        // ── 6. Telemetry ─────────────────────────────────────────────────────
        // Recorded for successes AND failures: a failure rate that never reaches
        // analytics is the metric we would most want and least have.
        // EFFORT — what the user is charged. Provider-independent, and multiplied by
        // the class the work ACTUALLY ran in: native and local are free, cloud is not.
        // Anything reaching this route is cloud by definition; native and local
        // resolve on the desktop and never arrive here at all, so they cost zero by
        // construction rather than by a lookup returning zero.
        
        // ── PER-JOB SETTLEMENT ────────────────────────────────────────────────
        // A task is charged for the HEAVIEST capability it touched, not for every
        // round trip the runtime needed. See `chargeForCall` for why this settles
        // incrementally instead of on a "task finished" signal that may never
        // arrive. Without a jobId this is a standalone call and pays for itself.
        const actualRawUnits = result.ok ? rawUnits : 0;
        const units = await chargeForCall(identity.userId, jobId, actualRawUnits);

        if (reservation.reservationId && reservation.reservationId !== 'dev_bypass' && reservation.reservationId !== 'free_call') {
            await settleCredits(reservation.reservationId, result.ok ? units : 0);
        }

        // COST — what WE spent. Recorded alongside, never joined to the above.
        const microUsd = result.ok ? costMicroUsd(result.provider, result.usage) : 0;

        // `jobId` is written into meta so settlement can find this job's prior
        // charges, and so a support question about one task is answerable.
        void recordUsage(identity.userId, capability, result, requestId, identity.issuer, units, microUsd, jobId);

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
            usage: {
                unitsCharged: units,
                // What this call WOULD have cost standalone, so the desktop can
                // show why a step inside a task was free rather than looking broken.
                unitsForCapability: rawUnits,
                meter: buildMeter(quota.usedUnits + units, plan),
            },
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
    microUsd: number,
    /** The Editing Job this call belongs to, when there is one. Settlement reads
     *  it back to find what the task has already been charged, so it must be
     *  written even when `units` is 0 — a free call is still evidence of the job's
     *  running total. Null for standalone calls (captions, one-shot translation). */
    jobId: string | null
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
                    // snake_case because settlement filters on `meta->>job_id`.
                    ...(jobId ? { job_id: jobId } : {}),
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
