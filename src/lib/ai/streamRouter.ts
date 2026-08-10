/**
 * src/lib/ai/streamRouter.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Routing for the streaming path.
 *
 * WHY THIS IS NOT `router.dispatch`. `dispatch` returns `AIResult` — a union
 * whose whole meaning is "this finished, here is the outcome". Telemetry,
 * metering and error mapping all consume it as a completed thing. A stream is
 * the opposite shape: it starts before an outcome exists. Threading one through
 * that union would have reshaped every consumer of it on a deployed service, so
 * the streaming path routes separately and the non-streaming path is untouched.
 *
 * It is deliberately thin. It answers one question — which adapter can stream
 * this capability, and can it stream at all — and hands back a raw body. All the
 * shaping, tool-call reassembly and settlement live in `stream.ts`, and every
 * gate (auth, entitlements, burst, monthly ceiling, media approval) has already
 * run in the route before this is reached.
 */

import { CAPABILITY_ROUTES, type Capability, type ModelSelection } from './runtime';
import { SarvamAdapter } from './adapters/sarvam';
import { OpenRouterAdapter } from './adapters/openrouter';
import { aiError, type AIError, type AIRequest } from './provider';

/**
 * Capabilities that may be streamed.
 *
 * A deliberate allowlist rather than "anything the adapter accepts". Streaming
 * only makes sense where the answer is prose or tool calls produced over time;
 * transcription returns one document at the end, and pretending to stream it
 * would show the user a progress illusion with no progress behind it.
 */
const STREAMABLE: ReadonlySet<Capability> = new Set<Capability>([
    'plan.edit',
    'plan.research',
    'understand.text',
] as Capability[]);

/** One adapter instance per provider, matching how the runtime holds its own. */
const adapters = new Map<'sarvam' | 'openrouter', SarvamAdapter | OpenRouterAdapter>();
function adapterFor(provider: 'sarvam' | 'openrouter'): SarvamAdapter | OpenRouterAdapter {
    const existing = adapters.get(provider);
    if (existing) return existing;
    const created = provider === 'openrouter' ? new OpenRouterAdapter() : new SarvamAdapter();
    adapters.set(provider, created);
    return created;
}

export type StreamStart =
    | { ok: true; body: ReadableStream<Uint8Array>; request: AIRequest }
    | { ok: false; error: AIError };

/**
 * Begin a streamed call, or explain why it cannot be streamed.
 *
 * WITH a router selection, the stream runs on the selected provider's own
 * streamChat — never silently on Sarvam. WITHOUT one (legacy callers), Sarvam is
 * the default, matching the capability route.
 *
 * A capability that cannot stream returns an ERROR rather than silently falling
 * back to the buffered path. A silent fallback would present a stream that never
 * streams — the caller would wait for tokens that are never coming and have no
 * way to tell that from a slow model.
 */
export async function beginStream(
    request: AIRequest,
    selection?: ModelSelection,
): Promise<StreamStart> {
    if (!STREAMABLE.has(request.capability)) {
        return {
            ok: false,
            error: aiError(
                'CAPABILITY_UNSUPPORTED',
                'That capability cannot be streamed. Request it without stream to get the full result.',
                request.requestId,
            ),
        };
    }

    const route = CAPABILITY_ROUTES[request.capability];
    if (!route) {
        return {
            ok: false,
            error: aiError('CAPABILITY_UNSUPPORTED', 'Unknown capability.', request.requestId),
        };
    }

    const provider = selection ? selection.provider : route.primary;
    // A selected provider that can stream is the only other lane OpenRouter
    // needs; everything not explicitly routed to Sarvam's unit endpoints stays
    // out. The no-silent-fallback rule applies to streaming exactly as to
    // dispatch: if the selected provider cannot stream, say so.
    if (provider !== 'sarvam' && provider !== 'openrouter') {
        return {
            ok: false,
            error: aiError(
                'PROVIDER_UNAVAILABLE',
                'Streaming is not available for that capability right now.',
                request.requestId,
                true,
            ),
        };
    }

    const adapter = adapterFor(provider);
    const requestWithModel = selection ? { ...request, model: selection.modelId } : request;

    // The upstream call gets its own timeout. Without one, a provider that
    // accepts the connection and then goes quiet holds a serverless function
    // open until the platform kills it, and the user sees nothing at all.
    const controller = new AbortController();
    const timeoutMs = route.timeoutMs ?? 120_000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const started = await adapter.streamChat(requestWithModel, controller.signal);
        if (!started.ok) return { ok: false, error: started.error };
        return { ok: true, body: started.body, request: requestWithModel };
    } finally {
        // Cleared as soon as the stream is HANDED OVER, not when it finishes:
        // from here the body is read by `toVichithStream`, and leaving this armed
        // would abort a healthy stream mid-flight at the timeout.
        clearTimeout(timer);
    }
}
