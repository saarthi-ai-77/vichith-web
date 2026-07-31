/**
 * src/lib/ai/provider.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * The provider abstraction. Everything in the AI Runtime is written against THIS,
 * never against Gemini or Sarvam directly.
 *
 * WHY THIS IS THE FIRST FILE
 * --------------------------
 * Founder decision (`AI_RUNTIME_V1.md`): the runtime is provider-AWARE, never
 * provider-DEPENDENT. Changing or adding a provider must never require a change
 * inside Chithra or Research. That property is only real if business logic can
 * never see a provider type — so the adapter interface goes in before any adapter.
 *
 * Two things deliberately live here and nowhere else:
 *
 *   • The CAPABILITY vocabulary. The desktop asks for a capability ("transcribe
 *     this audio"), never for a model. It never learns which provider served it.
 *   • The per-capability ROUTING table, including fallbacks. Generic failover is
 *     not built, because it mostly cannot work: Sarvam has no video or image
 *     understanding and Gemini is not our Indic speech path. Declaring fallbacks
 *     per capability — several of them honestly `null` — is the accurate model.
 */

/** Everything the runtime can be asked to do. The desktop speaks only in these. */
export type Capability =
    // ── Gemini: reasoning and multimodal ──
    | 'plan.edit'            // natural language → an edit plan
    | 'plan.research'        // research reasoning
    | 'understand.text'      // summarise, classify, extract
    | 'understand.image'     // describe / locate within a still
    | 'understand.video'     // scene and content understanding from frames
    // ── Sarvam: speech and language ──
    | 'speech.transcribe'    // audio → text with word timings
    | 'speech.translate'     // speech → English text, one step
    | 'speech.synthesize'    // text → audio
    | 'text.translate'       // text → text across languages
    | 'document.ocr';        // document → text

/**
 * V1 ships one provider. `gemini` is retained in the type so a V2 multimodal
 * adapter is a routing-table entry rather than a type change rippling through the
 * pipeline — but nothing routes to it today.
 */
export type ProviderId = 'gemini' | 'sarvam';

/** Where a capability may run. Cloud today; the enum exists so the native-first
 *  execution hierarchy has somewhere to record "this one never leaves the machine". */
export type ExecutionLocality = 'cloud' | 'local';

export interface CapabilityRoute {
    readonly primary: ProviderId;
    /**
     * Fallback provider, or `null` when there genuinely is none.
     *
     * `null` is the correct and common answer. Sarvam cannot understand video;
     * Gemini is not our Indic speech path. A generic failover engine would be built,
     * almost never fire correctly, and mislead everyone reading the code.
     */
    readonly fallback: ProviderId | null;
    readonly locality: ExecutionLocality;
    /** Hard ceiling for one attempt. Nothing may run unbounded. */
    readonly timeoutMs: number;
    /** True when the request necessarily carries user media to a provider.
     *  Gates the per-project media-upload approval (`AI_RUNTIME_V1.md` §5.3). */
    readonly sendsMedia: boolean;
    /** Shown in the UI wherever this runs — "Powered by Sarvam". */
    readonly attribution: string | null;
}

/**
 * THE routing table. One place, data not code.
 *
 * Adding a capability is an entry here plus an adapter method — no change to the
 * pipeline, no change to any route handler.
 */
export const CAPABILITY_ROUTES: Record<Capability, CapabilityRoute> = {
    // V1 IS SARVAM-NATIVE. Reasoning, speech, voice and translation all run on one
    // provider, under the startup credits, with no second vendor to keep alive.
    //
    // `fallback: null` throughout is deliberate and not laziness. A fallback that
    // silently answers from a different provider is how this codebase spent a day
    // believing Chithra was on Gemini while it was on OpenRouter. One provider,
    // honest failure.
    'plan.edit':          { primary: 'sarvam', fallback: null,     locality: 'cloud', timeoutMs: 60_000,  sendsMedia: false, attribution: 'Powered by Sarvam' },
    'plan.research':      { primary: 'sarvam', fallback: null,     locality: 'cloud', timeoutMs: 120_000, sendsMedia: false, attribution: 'Powered by Sarvam' },
    'understand.text':    { primary: 'sarvam', fallback: null,     locality: 'cloud', timeoutMs: 60_000,  sendsMedia: false, attribution: 'Powered by Sarvam' },

    // ── Frame vision: NOT SERVED IN V1 ──────────────────────────────────────
    //
    // Sarvam Vision reads documents, not video frames, so no provider here can
    // answer "what is in this shot". Rather than quietly routing it to a second
    // vendor, these fail with a message that says so.
    //
    // What V1 DOES give you instead, without any cloud vision: scene text via
    // Sarvam Vision on an extracted frame (document.ocr), plus faces, objects,
    // shots, motion and frame captions computed on the user's own machine. See
    // PERCEPTION_REASONING_ARCHITECTURE.md.
    'understand.image':   { primary: 'sarvam', fallback: null,     locality: 'cloud', timeoutMs: 90_000,  sendsMedia: true,  attribution: 'Powered by Sarvam' },
    'understand.video':   { primary: 'sarvam', fallback: null,     locality: 'cloud', timeoutMs: 180_000, sendsMedia: true,  attribution: 'Powered by Sarvam' },

    'speech.transcribe':  { primary: 'sarvam', fallback: null,     locality: 'cloud', timeoutMs: 300_000, sendsMedia: true,  attribution: 'Powered by Sarvam' },
    'speech.translate':   { primary: 'sarvam', fallback: null,     locality: 'cloud', timeoutMs: 300_000, sendsMedia: true,  attribution: 'Powered by Sarvam' },
    'speech.synthesize':  { primary: 'sarvam', fallback: null,     locality: 'cloud', timeoutMs: 120_000, sendsMedia: false, attribution: 'Powered by Sarvam' },
    'text.translate':     { primary: 'sarvam', fallback: 'gemini', locality: 'cloud', timeoutMs: 60_000,  sendsMedia: false, attribution: 'Powered by Sarvam' },
    'document.ocr':       { primary: 'sarvam', fallback: 'gemini', locality: 'cloud', timeoutMs: 120_000, sendsMedia: true,  attribution: 'Powered by Sarvam' },
};

// ── Request / response shapes ────────────────────────────────────────────────

export interface AIRequest {
    readonly capability: Capability;
    /** Client-generated, and the idempotency key. Traced end to end. */
    readonly requestId: string;
    /** Capability-specific payload. Validated by the adapter, never here. */
    readonly payload: Record<string, unknown>;
    /** Caller asked for a streamed response. Adapters may ignore it. */
    readonly stream?: boolean;
}

export interface AIUsage {
    readonly inputTokens?: number;
    readonly outputTokens?: number;
    /** Audio seconds processed — how speech work is actually metered. */
    readonly audioSeconds?: number;
    /** Best-effort cost estimate, for the operating-cost view. */
    readonly estimatedCostUsd?: number;
}

export interface AIResponse<T = unknown> {
    readonly ok: true;
    readonly data: T;
    readonly provider: ProviderId;
    /** Present only for attributed providers; the UI renders it verbatim. */
    readonly attribution: string | null;
    readonly usage: AIUsage;
    readonly latencyMs: number;
    readonly requestId: string;
}

export type AIErrorCode =
    | 'CAPABILITY_UNSUPPORTED'
    | 'INVALID_PAYLOAD'
    | 'PROVIDER_ERROR'
    | 'PROVIDER_TIMEOUT'
    | 'PROVIDER_UNAVAILABLE'
    | 'RESPONSE_INVALID'
    | 'MEDIA_NOT_APPROVED'
    | 'QUOTA_EXCEEDED';

export interface AIError {
    readonly ok: false;
    readonly code: AIErrorCode;
    /** Safe to show a user. Never a raw provider error — §7 of the addendum. */
    readonly message: string;
    readonly requestId: string;
    readonly retryable: boolean;
}

export type AIResult<T = unknown> = AIResponse<T> | AIError;

/**
 * What every provider implements. Adding a provider is a new class here and a row
 * in `CAPABILITY_ROUTES` — nothing else in the runtime changes.
 */
export interface ProviderAdapter {
    readonly id: ProviderId;
    /** Which capabilities this adapter can actually serve. The router checks this
     *  before dispatching, so a mis-declared route fails fast and loudly. */
    supports(capability: Capability): boolean;
    /** Execute. Adapters must not throw — they return a typed AIError. */
    execute<T = unknown>(request: AIRequest, signal: AbortSignal): Promise<AIResult<T>>;
}

/** Build a typed error. Keeps every failure path shaped identically. */
export function aiError(
    code: AIErrorCode,
    message: string,
    requestId: string,
    retryable = false
): AIError {
    return { ok: false, code, message, requestId, retryable };
}
