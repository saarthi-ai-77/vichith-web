/**
 * src/lib/ai/adapters/openrouter.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OpenRouter adapter — the paid-tier lane behind the Model Router.
 *
 * Implements the EXACT `ProviderAdapter` contract Sarvam implements (`provider.ts`).
 * OpenRouter is an OpenAI-compatible aggregator, so everything here is the
 * `/chat/completions` shape: chat, tool-calling, JSON mode and streaming all use
 * one endpoint. There is no unit-metered speech path.
 *
 * THE MODEL IS ALWAYS GIVEN. This adapter serves an arbitrary model id from the
 * router's selection (`request.model`). Unlike Sarvam — which has one hardcoded
 * chat model — OpenRouter is a gateway, so there is no safe default: a missing
 * model id is a router bug and returns INVALID_PAYLOAD rather than improvising.
 * The same rule forbids a model the user did not choose from ever running here.
 *
 * Adapters never throw; they return a typed `AIError` (§ provider.ts). A
 * provider failure surfaces as a failure, never as a successful generation.
 */

import {
    aiError,
    type AIError,
    type AIRequest,
    type AIResult,
    type Capability,
    type ProviderAdapter,
} from '../provider';
import { requireEnv } from '../../env';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

const SUPPORTED: Capability[] = [
    // Chat/reasoning only. OpenRouter does not meter speech the way Sarvam's
    // unit endpoints do, and routing transcription through it would be silent
    // scope creep — the selector must never offer a model that cannot do the
    // job, so the adapter only claims what it genuinely serves.
    'plan.edit',
    'plan.research',
    'understand.text',
];

/** Whether the request asks for a stream — mirrors `execute` vs `streamChat`. */
const CHAT_CAPABILITIES = new Set<Capability>(SUPPORTED);

export class OpenRouterAdapter implements ProviderAdapter {
    readonly id = 'openrouter' as const;

    supports(capability: Capability): boolean {
        return SUPPORTED.includes(capability);
    }

    async execute<T = unknown>(request: AIRequest, signal: AbortSignal): Promise<AIResult<T>> {
        const base = this.prepare(request);
        if ('error' in base) return base.error;

        const started = Date.now();
        let res: Response;
        try {
            res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
                method: 'POST',
                signal,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${base.apiKey}`,
                },
                body: JSON.stringify(base.body),
            });
        } catch {
            const aborted = signal.aborted;
            return aiError(
                aborted ? 'PROVIDER_TIMEOUT' : 'PROVIDER_ERROR',
                aborted
                    ? 'That took longer than expected. Please try again.'
                    : 'Could not reach the AI service. Please try again.',
                request.requestId,
                true
            );
        }

        if (!res.ok) {
            const detail = await res.text().catch(() => '');
            console.error(`[ai] openrouter ${res.status} for ${request.requestId}: ${detail.slice(0, 500)}`);
            return aiError(
                res.status === 429 ? 'QUOTA_EXCEEDED' : 'PROVIDER_ERROR',
                res.status === 429
                    ? 'The AI service is busy right now. Please try again shortly.'
                    : `The AI service rejected that request (HTTP ${res.status}). Please try again.`,
                request.requestId,
                res.status === 429 || res.status >= 500
            );
        }

        const body = await res.json().catch(() => null);
        if (body == null || typeof body !== 'object') {
            return aiError('RESPONSE_INVALID', 'The AI service returned an unreadable response.', request.requestId, true);
        }

        // Same relay rule as Sarvam: tool calls pass through verbatim, text is
        // unwrapped from the OpenAI envelope. The runtime forwards; it does not
        // interpret.
        const toolCalls = extractToolCalls(body);
        if (toolCalls) {
            return {
                ok: true,
                data: {
                    content: extractChatText(body),
                    tool_calls: toolCalls,
                    finish_reason: 'tool_calls',
                } as T,
                provider: this.id,
                attribution: 'Powered by OpenRouter',
                usage: usageFrom(body),
                latencyMs: Date.now() - started,
                requestId: request.requestId,
            };
        }

        const text = extractChatText(body);
        if (text == null) {
            console.error(`[ai] openrouter returned no usable message for ${request.requestId}`);
            return aiError('RESPONSE_INVALID', 'The AI could not complete that request.', request.requestId, true);
        }

        return {
            ok: true,
            data: text as T,
            provider: this.id,
            attribution: 'Powered by OpenRouter',
            usage: usageFrom(body),
            latencyMs: Date.now() - started,
            requestId: request.requestId,
        };
    }

    /**
     * The same chat call, streamed — the sibling of Sarvam's `streamChat`.
     *
     * Returns the raw upstream body; the route owns shaping it into Vichith
     * stream events, exactly as the Sarvam path does. OpenRouter's SSE is
     * OpenAI-compatible, which `toVichithStream` already parses.
     */
    async streamChat(
        request: AIRequest,
        signal: AbortSignal,
    ): Promise<{ ok: true; body: ReadableStream<Uint8Array> } | { ok: false; error: AIError }> {
        if (!CHAT_CAPABILITIES.has(request.capability)) {
            return { ok: false, error: aiError('CAPABILITY_UNSUPPORTED', 'That capability cannot be streamed.', request.requestId) };
        }

        const base = this.prepare(request);
        if ('error' in base) return { ok: false, error: base.error };

        let res: Response;
        try {
            res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
                method: 'POST',
                signal,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${base.apiKey}`,
                },
                body: JSON.stringify({ ...base.body, stream: true }),
            });
        } catch {
            const aborted = signal.aborted;
            return {
                ok: false,
                error: aiError(
                    aborted ? 'PROVIDER_TIMEOUT' : 'PROVIDER_ERROR',
                    aborted ? 'That took longer than expected. Please try again.' : 'Could not reach the AI service. Please try again.',
                    request.requestId,
                    true,
                ),
            };
        }

        if (!res.ok || !res.body) {
            const detail = await res.text().catch(() => '');
            console.error(`[ai] openrouter stream ${res.status} for ${request.requestId}: ${detail.slice(0, 500)}`);
            const ourFault = res.status >= 400 && res.status < 500 && res.status !== 429;
            return {
                ok: false,
                error: aiError(
                    res.status === 429 ? 'QUOTA_EXCEEDED' : 'PROVIDER_ERROR',
                    res.status === 429
                        ? 'The AI service is busy right now. Please try again shortly.'
                        : ourFault
                            ? `The AI service rejected this request (${res.status}). This is a configuration problem on our side, not something retrying will fix — it has been logged.`
                            : `The AI service returned an error (${res.status}). Please try again.`,
                    request.requestId,
                    res.status >= 500 || res.status === 429,
                ),
            };
        }

        return { ok: true, body: res.body };
    }

    /** Shared by `execute` and `streamChat`: key, endpoint, OpenAI-shaped body. */
    private prepare(request: AIRequest): { apiKey: string; body: Record<string, unknown> } | { error: AIError } {
        let apiKey: string;
        try {
            apiKey = requireEnv('OPENROUTER_API_KEY');
        } catch {
            console.error('[ai] OPENROUTER_API_KEY is not configured');
            return { error: aiError('PROVIDER_UNAVAILABLE', 'That capability is temporarily unavailable.', request.requestId, true) };
        }

        const model = request.model;
        if (!model) {
            // The router must have decided the model. A bare request here means a
            // routing gap — never improvise a model, or a model the user did not
            // choose could answer in place of the one they did.
            return { error: aiError('INVALID_PAYLOAD', 'No model was selected for this request.', request.requestId) };
        }

        const prompt = typeof request.payload.prompt === 'string' ? request.payload.prompt : '';
        const hasMessages = Array.isArray(request.payload.messages) && request.payload.messages.length > 0;
        if (!prompt.trim() && !hasMessages) {
            return { error: aiError('INVALID_PAYLOAD', 'prompt or messages is required', request.requestId) };
        }

        const systemContent =
            typeof request.payload.systemPrompt === 'string' && request.payload.systemPrompt.trim()
                ? request.payload.systemPrompt
                : (hasMessages ? prompt : '');

        const messages: { role: string; content: string }[] = [];
        if (systemContent.trim()) messages.push({ role: 'system', content: systemContent });

        if (hasMessages) {
            for (const raw of request.payload.messages as Record<string, unknown>[]) {
                const role = raw?.role;
                if (role !== 'system' && role !== 'user' && role !== 'assistant' && role !== 'tool') continue;
                const msg: Record<string, unknown> = { role };
                if (typeof raw.content === 'string') msg.content = raw.content;
                else if (raw.content === null) msg.content = null;
                if (Array.isArray(raw.tool_calls) && raw.tool_calls.length) msg.tool_calls = raw.tool_calls;
                if (typeof raw.tool_call_id === 'string') msg.tool_call_id = raw.tool_call_id;
                if (msg.content == null && !msg.tool_calls) continue;
                messages.push(msg as { role: string; content: string });
            }
        } else {
            messages.push({ role: 'user', content: prompt });
        }

        return {
            apiKey,
            body: {
                model,
                messages,
                temperature: typeof request.payload.temperature === 'number' ? request.payload.temperature : 0.2,
                max_tokens: typeof request.payload.maxOutputTokens === 'number' ? request.payload.maxOutputTokens : 4096,
                ...(request.payload.jsonMode === true ? { response_format: { type: 'json_object' } } : {}),
                ...(Array.isArray(request.payload.tools) && request.payload.tools.length
                    ? { tools: request.payload.tools, tool_choice: 'auto' }
                    : {}),
            },
        };
    }
}

/** OpenAI-compatible usage → the runtime's `AIUsage`. */
function usageFrom(body: unknown): { inputTokens?: number; outputTokens?: number } {
    const usage = (body as { usage?: { prompt_tokens?: number; completion_tokens?: number } })?.usage;
    return {
        inputTokens: typeof usage?.prompt_tokens === 'number' ? usage.prompt_tokens : undefined,
        outputTokens: typeof usage?.completion_tokens === 'number' ? usage.completion_tokens : undefined,
    };
}

function extractChatText(body: unknown): string | null {
    const choices = (body as { choices?: unknown[] } | null)?.choices;
    if (!Array.isArray(choices) || choices.length === 0) return null;
    const msg = (choices[0] as { message?: { content?: unknown } })?.message;
    const content = msg?.content;
    return typeof content === 'string' && content.length > 0 ? content : null;
}

function extractToolCalls(body: unknown): unknown[] | null {
    const choices = (body as { choices?: unknown[] } | null)?.choices;
    if (!Array.isArray(choices) || choices.length === 0) return null;
    const msg = (choices[0] as { message?: { tool_calls?: unknown } })?.message;
    const calls = msg?.tool_calls;
    return Array.isArray(calls) && calls.length > 0 ? calls : null;
}
