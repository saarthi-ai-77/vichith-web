/**
 * src/lib/ai/adapters/gemini.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Gemini adapter — reasoning, planning and multimodal understanding.
 *
 * The ONLY file in the runtime that knows Gemini's wire format. Everything above
 * it speaks capabilities (`provider.ts`). Swapping models, or Gemini itself, must
 * not require a change outside this file.
 *
 * Adapters never throw: they return a typed `AIError`. The router contains a throw
 * anyway, but relying on that would mean losing the error's meaning.
 */

import {
    aiError,
    type AIRequest,
    type AIResult,
    type Capability,
    type ProviderAdapter,
} from '../provider';
import { requireEnv } from '../../env';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/** Model per capability. Kept here, never in business logic — the desktop must
 *  never learn a model name (`AI_RUNTIME_V1.md`, frozen principle 6). */
/**
 * FLASH, NOT PRO, FOR PLANNING.
 *
 * Pro is the better reasoner and it is the wrong choice here, because on the free
 * tier it is effectively unavailable — every plan.edit 429'd while understand.text
 * (Flash) succeeded, which produced the worst possible symptom: a diagnostic
 * reporting "everything works" beside a Chithra that never answered. Same account,
 * same key, same route, different model.
 *
 * Editing intents are short, structured and well within Flash's ability. Spending
 * the harder model on them bought nothing and cost the whole feature. Pro stays
 * where its reasoning actually earns its limits: video understanding.
 */
const MODEL_FOR: Partial<Record<Capability, string>> = {
    'plan.edit': 'gemini-2.5-flash',
    'plan.research': 'gemini-2.5-flash',
    'understand.text': 'gemini-2.5-flash',
    'understand.image': 'gemini-2.5-flash',
    'understand.video': 'gemini-2.5-pro',
    // Fallback duty only — Sarvam is primary for both (see CAPABILITY_ROUTES).
    'text.translate': 'gemini-2.5-flash',
    'document.ocr': 'gemini-2.5-flash',
};

interface GeminiPart {
    text?: string;
    inline_data?: { mime_type: string; data: string };
}

export class GeminiAdapter implements ProviderAdapter {
    readonly id = 'gemini' as const;

    supports(capability: Capability): boolean {
        return capability in MODEL_FOR;
    }

    async execute<T = unknown>(request: AIRequest, signal: AbortSignal): Promise<AIResult<T>> {
        const model = MODEL_FOR[request.capability];
        if (!model) {
            return aiError(
                'CAPABILITY_UNSUPPORTED',
                `Gemini does not serve "${request.capability}".`,
                request.requestId
            );
        }

        let apiKey: string;
        try {
            apiKey = requireEnv('GEMINI_API_KEY');
        } catch {
            // Never leak which variable is missing to a client response.
            console.error('[ai] GEMINI_API_KEY is not configured');
            return aiError('PROVIDER_UNAVAILABLE', 'That capability is temporarily unavailable.', request.requestId, true);
        }

        const parts = buildParts(request);
        if ('error' in parts) {
            return aiError('INVALID_PAYLOAD', parts.error, request.requestId);
        }

        const started = Date.now();
        let res: Response;
        try {
            res = await fetch(`${GEMINI_BASE}/models/${model}:generateContent`, {
                method: 'POST',
                signal,
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: parts.value }],
                    generationConfig: {
                        // Planning must be reproducible: the same request should not
                        // produce a different edit plan on a retry.
                        temperature: request.capability.startsWith('plan.') ? 0.2 : 0.7,
                        ...(typeof request.payload.maxOutputTokens === 'number'
                            ? { maxOutputTokens: request.payload.maxOutputTokens }
                            : {}),
                        ...(request.payload.responseSchema
                            ? { responseMimeType: 'application/json', responseSchema: request.payload.responseSchema }
                            : {}),
                    },
                }),
            });
        } catch (err) {
            const aborted = signal.aborted;
            return aiError(
                aborted ? 'PROVIDER_TIMEOUT' : 'PROVIDER_ERROR',
                aborted ? 'That took longer than expected. Please try again.' : 'Could not reach the AI service. Please try again.',
                request.requestId,
                true
            );
        }

        if (!res.ok) {
            // Log the provider's own words for us; never show them to a user (§7).
            const detail = await res.text().catch(() => '');
            console.error(`[ai] gemini ${res.status} for ${request.requestId}: ${detail.slice(0, 500)}`);
            return aiError(
                res.status === 429 ? 'QUOTA_EXCEEDED' : 'PROVIDER_ERROR',
                res.status === 429
                    ? 'The AI service is busy right now. Please try again shortly.'
                    : 'Something went wrong on our side. Please try again.',
                request.requestId,
                res.status === 429 || res.status >= 500
            );
        }

        const body = await res.json().catch(() => null);
        const text = extractText(body);
        if (text == null) {
            // A 200 with no usable candidate is a real Gemini outcome (safety blocks,
            // empty candidates). Treat it as an invalid response rather than pretending
            // the request succeeded with empty content.
            console.error(`[ai] gemini returned no usable text for ${request.requestId}`);
            return aiError('RESPONSE_INVALID', 'The AI could not complete that request.', request.requestId, true);
        }

        const usageMeta = (body?.usageMetadata ?? {}) as Record<string, number>;
        return {
            ok: true,
            data: text as T,
            provider: this.id,
            attribution: null,
            usage: {
                inputTokens: usageMeta.promptTokenCount,
                outputTokens: usageMeta.candidatesTokenCount,
            },
            latencyMs: Date.now() - started,
            requestId: request.requestId,
        };
    }
}

/**
 * Build Gemini parts from the capability payload.
 *
 * Media arrives base64-encoded and is validated here rather than trusted: an
 * unbounded inline blob would be forwarded straight to the provider and billed.
 */
function buildParts(request: AIRequest): { value: GeminiPart[] } | { error: string } {
    const prompt = request.payload.prompt;
    if (typeof prompt !== 'string' || !prompt.trim()) {
        return { error: 'prompt is required' };
    }

    const parts: GeminiPart[] = [{ text: prompt }];

    const media = request.payload.media;
    if (media !== undefined) {
        if (!Array.isArray(media)) return { error: 'media must be an array' };
        // ~20MB of base64 ≈ 15MB of bytes. Beyond this the caller should be sampling
        // frames, not shipping whole files — see the minimal-upload rule in §7.
        const MAX_TOTAL_B64 = 20_000_000;
        let total = 0;
        for (const item of media) {
            const m = (item ?? {}) as Record<string, unknown>;
            if (typeof m.mimeType !== 'string' || typeof m.data !== 'string') {
                return { error: 'each media item needs mimeType and base64 data' };
            }
            total += m.data.length;
            if (total > MAX_TOTAL_B64) return { error: 'media payload is too large; sample fewer frames' };
            parts.push({ inline_data: { mime_type: m.mimeType, data: m.data } });
        }
    }

    return { value: parts };
}

/** Pull the first usable text candidate, or null. */
function extractText(body: unknown): string | null {
    const candidates = (body as { candidates?: unknown[] } | null)?.candidates;
    if (!Array.isArray(candidates) || candidates.length === 0) return null;
    const parts = (candidates[0] as { content?: { parts?: { text?: string }[] } })?.content?.parts;
    if (!Array.isArray(parts)) return null;
    const text = parts.map((p) => p?.text ?? '').join('').trim();
    return text.length > 0 ? text : null;
}
