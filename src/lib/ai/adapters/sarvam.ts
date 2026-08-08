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
    type AIError,
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

/**
 * The output ceiling for one turn, and the plan's cap is the real limit.
 *
 * Sarvam caps `max_tokens` per subscription tier — starter allows 4096 for
 * sarvam-105b and rejects anything higher with a 400. An env var because
 * upgrading the plan should be a deploy setting rather than a code change.
 */
const MAX_OUTPUT_TOKENS = Number(process.env.SARVAM_MAX_TOKENS) || 4096;

/** Saaras output modes. Exposed as a capability parameter, never as a model name. */
export type SpeechMode = 'transcribe' | 'translate' | 'verbatim' | 'transliterate' | 'codemix';


/**
 * Sarvam's accepted `language_code` values. This is a CLOSED set — anything else
 * is rejected with a 400, which is exactly how captions were failing: the picker
 * sends "te", Sarvam wants "te-IN", and the mismatch surfaced four layers away as
 * "something went wrong on our side".
 *
 * Auto-detect is the literal string 'unknown', NOT an omitted field.
 */
const SARVAM_LANGS = new Set([
    'unknown', 'hi-IN', 'bn-IN', 'kn-IN', 'ml-IN', 'mr-IN', 'od-IN', 'pa-IN',
    'ta-IN', 'te-IN', 'en-IN', 'gu-IN', 'as-IN', 'ur-IN', 'ne-IN', 'kok-IN',
    'ks-IN', 'sd-IN', 'sa-IN', 'sat-IN', 'mni-IN', 'brx-IN', 'mai-IN', 'doi-IN',
]);

/** Two-letter and common aliases -> Sarvam's code. */
const LANG_ALIAS: Record<string, string> = {
    hi: 'hi-IN', bn: 'bn-IN', kn: 'kn-IN', ml: 'ml-IN', mr: 'mr-IN',
    or: 'od-IN', od: 'od-IN', pa: 'pa-IN', ta: 'ta-IN', te: 'te-IN',
    en: 'en-IN', gu: 'gu-IN', as: 'as-IN', ur: 'ur-IN', ne: 'ne-IN',
    kok: 'kok-IN', ks: 'ks-IN', sd: 'sd-IN', sa: 'sa-IN', sat: 'sat-IN',
    mni: 'mni-IN', brx: 'brx-IN', mai: 'mai-IN', doi: 'doi-IN',
    hindi: 'hi-IN', bengali: 'bn-IN', kannada: 'kn-IN', malayalam: 'ml-IN',
    marathi: 'mr-IN', odia: 'od-IN', punjabi: 'pa-IN', tamil: 'ta-IN',
    telugu: 'te-IN', english: 'en-IN', gujarati: 'gu-IN',
};

/**
 * Normalise any language the app might send into something Sarvam accepts.
 *
 * Falls back to 'unknown' rather than passing an unrecognised value through:
 * auto-detect on a language we could not map is a worse transcript, but a
 * REJECTED REQUEST is no transcript at all.
 */
function toSarvamLanguage(raw: unknown): string {
    if (typeof raw !== 'string') return 'unknown';
    const v = raw.trim();
    if (!v || v.toLowerCase() === 'auto') return 'unknown';
    if (SARVAM_LANGS.has(v)) return v;

    const lower = v.toLowerCase();
    if (LANG_ALIAS[lower]) return LANG_ALIAS[lower];

    // "te-in" / "te_IN" / "tel" -> try the leading subtag.
    const base = lower.split(/[-_]/)[0];
    if (LANG_ALIAS[base]) return LANG_ALIAS[base];

    return 'unknown';
}

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

        // One line that settles "did tools reach the provider" without another
        // round trip. Counts only — a manifest in the logs would be noise, and
        // the count is the whole question.
        if (CHAT_CAPABILITIES.has(request.capability)) {
            const body = call.body as Record<string, unknown>;
            const toolCount = Array.isArray(body.tools) ? body.tools.length : 0;
            console.log(
                `[ai] sarvam ${request.capability} for ${request.requestId}: ` +
                `${(body.messages as unknown[] | undefined)?.length ?? 0} messages, ` +
                `${toolCount} tools, tool_choice=${String(body.tool_choice ?? 'unset')}`,
            );
        }

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
                    // The STATUS is included deliberately. "Something went wrong on
                    // our side" is true of every 4xx and 5xx alike, so it cannot
                    // distinguish a malformed request from an outage, and every
                    // report of it has cost a round trip to the server logs to learn
                    // one number. The provider's own text still never leaves the
                    // server — a status code identifies the class of fault without
                    // leaking anything about the request or the account.
                    : `The speech service rejected that request (HTTP ${res.status}). Please try again.`,
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
            // ── TOOL CALLS ARE RELAYED VERBATIM ─────────────────────────
            //
            // Checked BEFORE text, because a message carrying tool_calls has
            // `content: null` — the old code read only content, found null, and
            // reported RESPONSE_INVALID. Tool calling could not have worked at
            // all, and would have failed as "the AI could not complete that
            // request" rather than as anything pointing at the real cause.
            //
            // The runtime does not inspect, rewrite or execute these. It forwards
            // them. Interpreting a tool call here is the first step towards the
            // runtime becoming a second editor, which is the one thing this
            // architecture exists to prevent.
            const toolCalls = extractToolCalls(body);
            if (toolCalls) {
                data = {
                    content: extractChatText(body),
                    tool_calls: toolCalls,
                    finish_reason: 'tool_calls',
                } as unknown;
                return {
                    ok: true,
                    data: data as T,
                    provider: this.id,
                    attribution: 'Powered by Sarvam',
                    usage: {
                        inputTokens: (body as any)?.usage?.prompt_tokens,
                        outputTokens: (body as any)?.usage?.completion_tokens,
                    },
                    latencyMs: Date.now() - started,
                    requestId: request.requestId,
                };
            }

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
    /**
     * The same chat call, streamed.
     *
     * WHY THIS IS A SIBLING OF `execute` AND NOT A FLAG INSIDE IT. `execute`
     * returns `AIResult` — a discriminated union meaning "this finished, here is
     * the outcome" — and telemetry, metering and error mapping all consume it as
     * a completed thing. A stream is the opposite shape: it starts before the
     * outcome exists. Threading one through that union would have reshaped every
     * consumer of it on a deployed service, so the streaming path is additive and
     * the non-streaming path is untouched.
     *
     * Returns the raw upstream body. The route owns turning it into an event
     * stream for the desktop, because the route is what knows about billing,
     * request ids and the response contract; this method's only job is to ask
     * Sarvam for tokens instead of a document.
     *
     * `buildCall` is reused deliberately — the request that streams must be the
     * SAME request that would have been sent unstreamed, or the two paths drift
     * and the streamed answer stops matching the one we test.
     */
    async streamChat(
        request: AIRequest,
        signal: AbortSignal,
    ): Promise<{ ok: true; body: ReadableStream<Uint8Array> } | { ok: false; error: AIError }> {
        let apiKey: string;
        try {
            apiKey = requireEnv('SARVAM_API_KEY');
        } catch {
            console.error('[ai] SARVAM_API_KEY is not configured');
            return { ok: false, error: aiError('PROVIDER_UNAVAILABLE', 'That capability is temporarily unavailable.', request.requestId, true) };
        }

        if (!CHAT_CAPABILITIES.has(request.capability)) {
            return { ok: false, error: aiError('CAPABILITY_UNSUPPORTED', 'That capability cannot be streamed.', request.requestId) };
        }

        const call = this.buildCall(request);
        if ('error' in call) return { ok: false, error: aiError('INVALID_PAYLOAD', call.error, request.requestId) };

        let res: Response;
        try {
            res = await fetch(`${SARVAM_BASE}${call.path}`, {
                method: 'POST',
                signal,
                headers: { 'Content-Type': 'application/json', 'api-subscription-key': apiKey },
                body: JSON.stringify({ ...call.body, stream: true }),
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
            console.error(`[ai] sarvam stream ${res.status} for ${request.requestId}: ${detail.slice(0, 500)}`);

            // A 4xx that is not 429 means WE sent a bad request — a parameter the
            // plan does not allow, a malformed body. Retrying reproduces it exactly.
            //
            // This branch used to say "Please try again" to every status, and it
            // said it for real: `max_tokens (8192) exceeds the maximum allowed for
            // your subscription tier` reached the user as "The AI service returned
            // an error (400). Please try again." — advice that could never work,
            // for a fault on our side, with the one sentence that explained it
            // visible only in the server log. The `retryable` flag was already
            // correct; only the sentence lied.
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
                        // ALWAYS sent, always valid. Omitting it is not the same as
                    // auto-detect to Sarvam, and an unmapped value is a 400.
                    language_code: toSarvamLanguage(p.language),
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
                        ...(typeof p.language === 'string'
                            ? { target_language_code: toSarvamLanguage(p.language) }
                            : {}),
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
                    // ROLES AND TOOL FIELDS ARE PRESERVED VERBATIM.
                    //
                    // This used to collapse every role except `assistant` into
                    // `user` and forward only `content`. In a tool-calling
                    // conversation that is destructive twice over: an assistant
                    // turn carrying tool_calls has content: null and was dropped
                    // entirely, and a `tool` result became a user message with its
                    // tool_call_id gone — so the model was handed a transcript
                    // where its own call had vanished and an unattributed answer
                    // had appeared.
                    //
                    // Given that, it stopped emitting structured calls and started
                    // DESCRIBING them in prose (<tool_call>…</tool_call> as text),
                    // which is a reasonable response to a conversation that showed
                    // structured calls being ignored.
                    for (const raw of p.messages as Record<string, unknown>[]) {
                        const role = raw?.role;
                        if (role !== 'system' && role !== 'user' && role !== 'assistant' && role !== 'tool') {
                            continue;
                        }
                        const msg: Record<string, unknown> = { role };

                        // content may legitimately be null on a tool_calls turn.
                        if (typeof raw.content === 'string') msg.content = raw.content;
                        else if (raw.content === null) msg.content = null;

                        if (Array.isArray(raw.tool_calls) && raw.tool_calls.length) {
                            msg.tool_calls = raw.tool_calls;
                        }
                        if (typeof raw.tool_call_id === 'string') {
                            msg.tool_call_id = raw.tool_call_id;
                        }

                        // A turn with neither content nor tool_calls carries
                        // nothing; forwarding it would only add noise.
                        if (msg.content == null && !msg.tool_calls) continue;

                        messages.push(msg as { role: string; content: string });
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
                        // NEVER LEFT TO THE PROVIDER'S DEFAULT, AND THIS COST US A WEEK.
                        //
                        // Sarvam's `max_tokens` defaults to 2048 and `reasoning_effort`
                        // to medium, and Sarvam CHANGED both defaults in April 2026 with
                        // the note "set them explicitly to lock in previous behavior".
                        // We set neither, so a turn's reasoning, its narration prose and
                        // its tool-call arguments all shared one 2048-token ceiling that
                        // moved underneath us.
                        //
                        // The symptom was not an error. When the ceiling is reached
                        // mid-tool-call the response ends with `finish_reason: 'length'`
                        // and the argument string simply STOPS — cut at whatever token
                        // the budget ran out on. It reaches the desktop as unparseable
                        // JSON, the call is discarded, and the run reports work it never
                        // did. It presented as the model emitting invalid JSON, which is
                        // why it was chased twice as a schema problem and once as a
                        // streaming bug before anyone looked at the request.
                        //
                        // 4096 IS THE CEILING, NOT A PREFERENCE. Sarvam caps
                        // `max_tokens` per subscription tier, and the starter tier's cap
                        // for sarvam-105b is 4096 — 8192 was rejected outright:
                        //
                        //   max_tokens (8192) exceeds the maximum allowed for
                        //   sarvam-105b for your subscription tier (starter): 4096
                        //
                        // So this is the most room the plan allows, and it is still twice
                        // the default that was truncating tool calls. It is an env var
                        // because upgrading the plan should be a deploy setting, not a
                        // code change — and because the cap is a billing fact that can
                        // move without any release note. `reasoning_effort` is pinned at
                        // the documented default rather than tuned: the point is that OUR
                        // value decides, not a provider default. If tool arguments still
                        // get cut at 4096, that is the next lever — reasoning tokens are
                        // spent from this same budget, and Chithra already does its real
                        // reasoning out loud through the cognitive tools.
                        max_tokens: typeof p.maxOutputTokens === 'number' ? p.maxOutputTokens : MAX_OUTPUT_TOKENS,
                        reasoning_effort: typeof p.reasoningEffort === 'string' ? p.reasoningEffort : 'medium',
                        // JSON mode when the caller wants structure. The planner does;
                        // conversational replies deliberately do not, because forcing
                        // JSON is what turned "hi" into an error.
                        ...(p.jsonMode === true ? { response_format: { type: 'json_object' } } : {}),
                        // `tool_choice: 'auto'` is sent WITH the tools, not
                        // instead of relying on a default. Several
                        // OpenAI-compatible endpoints ignore `tools` entirely
                        // unless a choice is stated, and the symptom is exactly
                        // what we saw: the model describes the call it would have
                        // made, in prose, because structured calling was never
                        // actually offered to it.
                        //
                        // Harmless where the default is already auto.
                        ...(Array.isArray(p.tools) && p.tools.length
                            ? { tools: p.tools, tool_choice: 'auto' }
                            : {}),
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

/**
 * Pull tool calls out of an OpenAI-compatible chat response.
 *
 * Returns null when there are none, so the caller can fall through to the text
 * path — a chat reply and a tool call are different outcomes, not a value and its
 * absence.
 *
 * Shape is NOT normalised beyond checking it is a non-empty array. The desktop
 * validates every call against the manifest it sent; re-shaping here would mean
 * the runtime forming an opinion about a contract it does not own.
 */
function extractToolCalls(body: unknown): unknown[] | null {
    const choices = (body as { choices?: unknown[] } | null)?.choices;
    if (!Array.isArray(choices) || choices.length === 0) return null;
    const msg = (choices[0] as { message?: { tool_calls?: unknown } })?.message;
    const calls = msg?.tool_calls;
    return Array.isArray(calls) && calls.length > 0 ? calls : null;
}
