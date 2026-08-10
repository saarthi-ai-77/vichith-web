/**
 * src/lib/ai/adapters/openrouter.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OpenRouter adapter — enables paid model selection via OpenRouter.
 */

import {
    aiError,
    type AIRequest,
    type AIResult,
    type Capability,
    type ProviderAdapter,
} from '../provider';
import { requireEnv } from '../../env';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

/** Model mapping for OpenRouter. */
const MODEL_FOR: Partial<Record<Capability, string>> = {
    'plan.edit': 'meta-llama/llama-3.1-8b-instruct',
    'plan.research': 'meta-llama/llama-3.1-8b-instruct',
    'understand.text': 'meta-llama/llama-3.1-8b-instruct',
    'understand.image': 'anthropic/claude-3-haiku',
};

export class OpenRouterAdapter implements ProviderAdapter {
    readonly id = 'openrouter' as const;

    supports(capability: Capability): boolean {
        return capability in MODEL_FOR;
    }

    async execute<T = unknown>(request: AIRequest, signal: AbortSignal): Promise<AIResult<T>> {
        const model = MODEL_FOR[request.capability];
        if (!model) {
            return aiError(
                'CAPABILITY_UNSUPPORTED',
                `OpenRouter adapter does not support capability: ${request.capability}`,
                request.requestId
            );
        }

        const apiKey = requireEnv('OPENROUTER_API_KEY');
        if (!apiKey) {
            return aiError('PROVIDER_UNAVAILABLE', 'OpenRouter API key is missing', request.requestId);
        }

        const payload = request.payload as any;
        const body: any = {
            model,
            messages: payload.messages || [{ role: 'user', content: payload.prompt || '' }],
        };

        if (payload.system) {
            body.messages.unshift({ role: 'system', content: payload.system });
        }
        if (payload.response_format) {
            body.response_format = payload.response_format;
        }
        if (payload.temperature !== undefined) {
            body.temperature = payload.temperature;
        }

        const start = Date.now();

        try {
            const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://app.vichith.in',
                    'X-Title': 'Vichith',
                },
                body: JSON.stringify(body),
                signal,
            });

            const data = await res.json();
            const latencyMs = Date.now() - start;

            if (!res.ok) {
                return aiError(
                    'PROVIDER_ERROR',
                    data.error?.message || `HTTP ${res.status}: ${res.statusText}`,
                    request.requestId
                );
            }

            return {
                ok: true,
                data: data.choices?.[0]?.message?.content as unknown as T,
                provider: this.id,
                attribution: 'Powered by OpenRouter',
                usage: {
                    inputTokens: data.usage?.prompt_tokens,
                    outputTokens: data.usage?.completion_tokens,
                },
                latencyMs,
                requestId: request.requestId,
            };
        } catch (err: unknown) {
            const error = err as Error;
            if (error.name === 'AbortError') {
                return aiError('PROVIDER_TIMEOUT', 'Request was aborted', request.requestId, true);
            }
            return aiError('PROVIDER_ERROR', error.message, request.requestId);
        }
    }
}
