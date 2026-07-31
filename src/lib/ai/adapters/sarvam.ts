/**
 * src/lib/ai/adapters/sarvam.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Sarvam adapter — speech, translation and Indic language capabilities.
 *
 * The ONLY file that knows Sarvam's wire format. Everything above speaks
 * capabilities.
 *
 * WHY SARVAM IS MORE THAN "STT" HERE
 * ----------------------------------
 * Saaras v3 exposes output MODES, not just transcription:
 *
 *   transcribe    — words in the spoken language
 *   translate     — speech straight to English, no second round trip
 *   verbatim      — exact, including disfluencies (correct for subtitles)
 *   transliterate — Indic speech in Latin script
 *   codemix       — Hinglish/Tanglish, which every Western tool gets wrong
 *
 * Codemix and diarization are the reason this adapter matters: they are what make
 * Indic captions a wedge rather than a checkbox (see `V1_PRODUCT_DEFINITION.md`).
 *
 * ⚠ Request/response SHAPES here follow Sarvam's published API and must be
 * confirmed against the live docs before this is enabled in production. The
 * capability boundary is what is being fixed now; field names are cheap to correct
 * and are contained entirely within this file.
 */

import {
    aiError,
    type AIRequest,
    type AIResult,
    type Capability,
    type ProviderAdapter,
} from '../provider';
import { requireEnv } from '../../env';

const SARVAM_BASE = 'https://api.sarvam.ai';

const SUPPORTED: Capability[] = [
    'speech.transcribe',
    'speech.translate',
    'speech.synthesize',
    'text.translate',
    'document.ocr',
    'understand.text',
];

/** Saaras output modes. Exposed as a capability parameter, never as a model name. */
export type SpeechMode = 'transcribe' | 'translate' | 'verbatim' | 'transliterate' | 'codemix';

export class SarvamAdapter implements ProviderAdapter {
    readonly id = 'sarvam' as const;

    supports(capability: Capability): boolean {
        return SUPPORTED.includes(capability);
    }

    async execute<T = unknown>(request: AIRequest, signal: AbortSignal): Promise<AIResult<T>> {
        let apiKey: string;
        try {
            apiKey = requireEnv('SARVAM_API_KEY');
        } catch {
            console.error('[ai] SARVAM_API_KEY is not configured');
            return aiError('PROVIDER_UNAVAILABLE', 'That capability is temporarily unavailable.', request.requestId, true);
        }

        const call = this.buildCall(request);
        if ('error' in call) return aiError('INVALID_PAYLOAD', call.error, request.requestId);

        const started = Date.now();
        let res: Response;
        try {
            res = await fetch(`${SARVAM_BASE}${call.path}`, {
                method: 'POST',
                signal,
                headers: { 'Content-Type': 'application/json', 'api-subscription-key': apiKey },
                body: JSON.stringify(call.body),
            });
        } catch {
            const aborted = signal.aborted;
            return aiError(
                aborted ? 'PROVIDER_TIMEOUT' : 'PROVIDER_ERROR',
                aborted
                    ? 'That took longer than expected. Please try again.'
                    : 'Could not reach the speech service. Please try again.',
                request.requestId,
                true
            );
        }

        if (!res.ok) {
            const detail = await res.text().catch(() => '');
            console.error(`[ai] sarvam ${res.status} for ${request.requestId}: ${detail.slice(0, 500)}`);
            return aiError(
                res.status === 429 ? 'QUOTA_EXCEEDED' : 'PROVIDER_ERROR',
                res.status === 429
                    ? 'The speech service is busy right now. Please try again shortly.'
                    : 'Something went wrong on our side. Please try again.',
                request.requestId,
                res.status === 429 || res.status >= 500
            );
        }

        const body = await res.json().catch(() => null);
        if (body == null || typeof body !== 'object') {
            return aiError('RESPONSE_INVALID', 'The speech service returned an unreadable response.', request.requestId, true);
        }

        return {
            ok: true,
            data: body as T,
            provider: this.id,
            // Rendered verbatim by the UI wherever Sarvam actually ran.
            attribution: 'Powered by Sarvam',
            usage: {
                audioSeconds: typeof request.payload.durationSecs === 'number'
                    ? request.payload.durationSecs
                    : undefined,
            },
            latencyMs: Date.now() - started,
            requestId: request.requestId,
        };
    }

    /** Map a capability + payload onto a Sarvam endpoint and body. */
    private buildCall(request: AIRequest): { path: string; body: Record<string, unknown> } | { error: string } {
        const p = request.payload;

        switch (request.capability) {
            case 'speech.transcribe':
            case 'speech.translate': {
                if (typeof p.audio !== 'string' || !p.audio) {
                    return { error: 'audio (base64) is required' };
                }
                const translating = request.capability === 'speech.translate';
                const mode = (p.mode as SpeechMode | undefined) ?? (translating ? 'translate' : 'transcribe');
                return {
                    // Direct speech→English is a distinct endpoint; using it avoids a
                    // transcribe-then-translate round trip and the drift that introduces.
                    path: translating ? '/speech-to-text-translate' : '/speech-to-text',
                    body: {
                        audio: p.audio,
                        model: 'saaras:v3',
                        mode,
                        // Word timestamps are non-negotiable: the caption pipeline is
                        // per-word, and without them captions cannot be built at all.
                        with_timestamps: true,
                        // Per-speaker caption styling falls out of diarization for free,
                        // because CaptionWord already carries per-word style overrides.
                        with_diarization: p.diarize === true,
                        ...(typeof p.language === 'string' ? { language_code: p.language } : {}),
                    },
                };
            }

            case 'speech.synthesize': {
                if (typeof p.text !== 'string' || !p.text.trim()) return { error: 'text is required' };
                return {
                    path: '/text-to-speech',
                    body: {
                        inputs: [p.text],
                        // v4 shipped 2026-07-30 with richer emotion, expression and
                        // vocal range. Overridable by env so a regression can be
                        // rolled back to v3 with a redeploy rather than a code change
                        // — the model is the one thing here most likely to need
                        // reverting in a hurry.
                        model: process.env.SARVAM_TTS_MODEL || 'bulbul:v4',
                        ...(typeof p.language === 'string' ? { target_language_code: p.language } : {}),
                        ...(typeof p.speaker === 'string' ? { speaker: p.speaker } : {}),
                        ...(typeof p.pace === 'number' ? { pace: p.pace } : {}),
                    },
                };
            }

            case 'text.translate':
            case 'understand.text': {
                if (typeof p.text !== 'string' || !p.text.trim()) return { error: 'text is required' };
                if (typeof p.targetLanguage !== 'string') return { error: 'targetLanguage is required' };
                return {
                    path: '/translate',
                    body: {
                        input: p.text,
                        target_language_code: p.targetLanguage,
                        ...(typeof p.sourceLanguage === 'string'
                            ? { source_language_code: p.sourceLanguage }
                            : { source_language_code: 'auto' }),
                    },
                };
            }

            case 'document.ocr': {
                if (typeof p.document !== 'string' || !p.document) {
                    return { error: 'document (base64) is required' };
                }
                return { path: '/parse/parsepdf', body: { pdf: p.document } };
            }

            default:
                return { error: `Sarvam does not serve "${request.capability}".` };
        }
    }
}
