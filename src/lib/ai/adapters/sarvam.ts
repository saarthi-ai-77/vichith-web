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
    // Reasoning. Sarvam-105B is a 128k-context MoE with native tool calling and
    // JSON mode, which is the whole requirement for producing an edit plan.
    'plan.edit',
    'plan.research',
    // Speech and language.
    'speech.transcribe',
    'speech.translate',
    'speech.synthesize',
    'text.translate',
    'document.ocr',
    'understand.text',
];

/**
 * Capabilities served by the OpenAI-compatible chat endpoint rather than a
 * purpose-built one. They differ in both request shape and response extraction,
 * which is why this set exists rather than a check scattered at each site.
 */
const CHAT_CAPABILITIES = new Set<Capability>(['plan.edit', 'plan.research', 'understand.text']);

/** The reasoning model. One constant, so a migration is one edit. */
const CHAT_MODEL = 'sarvam-105b';

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
            const isMultipart = (call as { multipartAudio?: boolean }).multipartAudio === true;

            let init: RequestInit;
            if (isMultipart) {
                // Content-Type is deliberately NOT set: fetch must generate it so the
                // multipart boundary matches the body it actually wrote. Setting it
                // by hand produces a boundary mismatch and a confusing 4xx.
                const b = call.body as Record<string, unknown>;
                const audioB64 = typeof b.audio === 'string' ? b.audio : '';
                const bytes = Buffer.from(audioB64, 'base64');

                const form = new FormData();
                // Opus in an Ogg container — what the desktop now extracts.
                form.append('file', new Blob([bytes], { type: 'audio/ogg' }), 'audio.ogg');
                for (const [k, v] of Object.entries(b)) {
                    if (k === 'audio' || v === undefined || v === null) continue;
                    form.append(k, typeof v === 'string' ? v : String(v));
                }
                init = { method: 'POST', signal, headers: { 'api-subscription-key': apiKey }, body: form };
            } else {
                init = {
                    method: 'POST',
                    signal,
                    headers: { 'Content-Type': 'application/json', 'api-subscription-key': apiKey },
                    body: JSON.stringify(call.body),
                };
            }

            res = await fetch(`${SARVAM_BASE}${call.path}`, init);
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

        // A chat response is an envelope; the caller wants the message. Returning
        // the envelope would push OpenAI's response shape into every call site and
        // make swapping the reasoning model a change in all of them.
        let data: unknown = body;
        if (CHAT_CAPABILITIES.has(request.capability)) {
            const text = extractChatText(body);
            if (text == null) {
                // A 200 with no usable message is a real outcome (filtered, empty
                // choices). Treat it as invalid rather than returning empty content
                // that a parser downstream will fail on more confusingly.
                console.error(`[ai] sarvam returned no usable message for ${request.requestId}`);
                return aiError('RESPONSE_INVALID', 'The AI could not complete that request.', request.requestId, true);
            }
            data = text;
        }

        return {
            ok: true,
            data: data as T,
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
    private buildCall(request: AIRequest): { path: string; body: Record<string, unknown>; multipartAudio?: boolean } | { error: string } {
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
                    // MULTIPART, NOT JSON. Sarvam's speech endpoints take a real file
                    // upload; sending `{audio: base64}` as JSON returned a 500 that
                    // surfaced to the user as "something went wrong on our side" —
                    // true, and useless, because the fault was the request shape.
                    multipartAudio: true,
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

            case 'plan.edit':
            case 'plan.research': {
                const prompt = typeof p.prompt === 'string' ? p.prompt : '';
                const hasMessages = Array.isArray(p.messages) && p.messages.length > 0;
                if (!prompt.trim() && !hasMessages) {
                    return { error: 'prompt or messages is required' };
                }
                // The planner passes its system prompt as `prompt` alongside
                // `messages`; treat it as system content when no explicit
                // systemPrompt was given, rather than losing it.
                const systemContent =
                    typeof p.systemPrompt === 'string' && p.systemPrompt.trim()
                        ? p.systemPrompt
                        : (hasMessages ? prompt : '');
                // OpenAI-compatible. A system prompt is passed separately when the
                // caller supplies one, because merging it into the user turn loses
                // the priority the model gives system content.
                const messages: { role: string; content: string }[] = [];
                if (systemContent.trim()) {
                    messages.push({ role: 'system', content: systemContent });
                }

                // A caller-supplied conversation wins over the single prompt.
                //
                // This is the bug that made Sarvam look incapable: the planner
                // sends `prompt: systemPrompt` PLUS a `messages` array, and this
                // branch read only `prompt` — so the model received the system
                // prompt as the user's turn and never saw what the user actually
                // typed. It answered every request with a greeting because a
                // greeting is the right answer to "here are your instructions".
                if (Array.isArray(p.messages) && p.messages.length > 0) {
                    for (const m of p.messages as { role?: unknown; content?: unknown }[]) {
                        if (typeof m?.content === 'string' && m.content.trim()) {
                            messages.push({
                                role: m.role === 'assistant' ? 'assistant' : 'user',
                                content: m.content,
                            });
                        }
                    }
                } else {
                    messages.push({ role: 'user', content: prompt });
                }

                return {
                    path: '/v1/chat/completions',
                    body: {
                        model: CHAT_MODEL,
                        messages,
                        // Low but not zero. Edit planning wants near-deterministic
                        // structure; exactly 0 makes some models loop on a bad token
                        // rather than pick the next-best one.
                        temperature: typeof p.temperature === 'number' ? p.temperature : 0.2,
                        ...(typeof p.maxOutputTokens === 'number' ? { max_tokens: p.maxOutputTokens } : {}),
                        // JSON mode when the caller wants structure. The planner does;
                        // conversational replies deliberately do not, because forcing
                        // JSON is what turned "hi" into an error.
                        ...(p.jsonMode === true ? { response_format: { type: 'json_object' } } : {}),
                        ...(Array.isArray(p.tools) && p.tools.length ? { tools: p.tools } : {}),
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

            case 'understand.image':
            case 'understand.video':
                // Named explicitly rather than falling to the generic message,
                // because "unsupported capability" reads like a bug when it is in
                // fact a deliberate V1 boundary. Sarvam Vision reads documents, not
                // scenes; frame understanding is a V2 capability and the user
                // deserves to be told which, not left guessing.
                return {
                    error:
                        'Looking at what is IN a shot is not available yet — that arrives in a later ' +
                        'update. Reading on-screen text works today, and so do faces, objects and scene ' +
                        'detection, which run on your own machine.',
                };

            default:
                return { error: `Sarvam does not serve "${request.capability}".` };
        }
    }
}

/** Pull the assistant message out of an OpenAI-compatible chat response. */
function extractChatText(body: unknown): string | null {
    const choices = (body as { choices?: unknown[] } | null)?.choices;
    if (!Array.isArray(choices) || choices.length === 0) return null;
    const msg = (choices[0] as { message?: { content?: unknown } })?.message;
    const content = msg?.content;
    return typeof content === 'string' && content.length > 0 ? content : null;
}
