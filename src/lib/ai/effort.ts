/**
 * src/lib/ai/effort.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * The EFFORT ledger — the user-facing usage meter.
 *
 *     effort = base(capability) × magnitude(request) × multiplier(executionClass)
 *
 * This file must never import a provider, read a provider response, or know a
 * price. It is provider-independent BY CONSTRUCTION, which is what keeps the meter
 * meaningful when Gemini's pricing moves, when Sarvam is joined by another
 * provider, or when a capability migrates from cloud to local.
 *
 * The cost ledger lives in `cost.ts` and is entirely separate. The two are never
 * joined: one answers *"how much AI assistance have I used?"*, the other answers
 * *"what did we spend?"*. Conflating them was the flaw in the first design — it
 * meant a provider price change silently repriced every customer.
 *
 * Everything here is computable BEFORE the request runs, which is what lets the UI
 * say "this will use about 4 units" instead of billing a surprise afterwards.
 */

import type { Capability } from './provider';

// ── Execution class ──────────────────────────────────────────────────────────

/**
 * WHERE the work actually happened. The third term in the effort formula, and the
 * one that keeps the meter correct as Vichith gains local models and native
 * capabilities.
 *
 * This mirrors the frozen native → local → cloud execution hierarchy: the runtime
 * already decides where an operation runs, and the meter simply respects that
 * decision instead of pretending everything is a cloud call.
 */
export type ExecutionClass =
    /** Our own deterministic code — U2Net matting, grammar-resolved edits, the
     *  constraint solver. No model inference of any kind. */
    | 'native'
    /** A model on the USER's machine — a downloaded Studio model, bundled llama.cpp. */
    | 'local'
    /** A provider we pay for. Today Gemini and Sarvam. */
    | 'cloud';

/**
 * Effort multiplier per execution class.
 *
 * **Native and local are FREE, and that is a product decision, not an oversight.**
 *
 * Native work is our own code — charging for it would be charging for pressing
 * "split clip". Local work runs on hardware the user bought and powers, so billing
 * it is charging rent on their own GPU.
 *
 * Making them free is also the frozen principle *"choose the best execution path
 * for the user, not the easiest for us"* expressed in pricing. It gives the
 * local-vs-cloud prompt real teeth — "run locally (free)" against "use cloud
 * (~5 units)" is a genuine choice rather than a lateral one — and it aligns the
 * user's incentive with both our margin and the privacy story. No cloud-only
 * competitor can offer unlimited local AI.
 *
 * Kept as a MULTIPLIER rather than a boolean gate so future classes (a Vichith-
 * hosted GPU tier, a premium model tier) slot in without reshaping the formula.
 */
export const EXECUTION_MULTIPLIER: Record<ExecutionClass, number> = {
    native: 0,
    local: 0,
    cloud: 1,
};

// ── Capability effort traits ─────────────────────────────────────────────────

/** How much deliberation the operation represents, independent of output length. */
export type ReasoningClass = 'none' | 'light' | 'moderate' | 'deep';

/** What kind of media the operation must ingest. */
export type MediaClass = 'none' | 'text' | 'audio' | 'image' | 'video';

/** What the request's size is measured in — always something the user can see. */
export type MagnitudeBasis =
    | 'fixed'            // one unit of work regardless of input
    | 'perClip'
    | 'perImage'
    | 'perAudioMinute'
    | 'perVideoSecond'
    | 'perKChar';

/**
 * Effort traits DECLARED on the capability, so adding a capability declares its
 * own cost — the same discipline as the Property Capability Registry, where a
 * property declares its own range instead of a validator remembering it elsewhere.
 *
 * The formula below is deliberately naive for V1. Refining it later against real
 * cost-ledger data changes `baseEffort` only, and touches no capability, no route
 * and no call site.
 */
export interface CapabilityEffort {
    readonly reasoning: ReasoningClass;
    readonly media: MediaClass;
    readonly magnitude: MagnitudeBasis;
    /** Fan-out. A capability that makes several provider calls is proportionally
     *  more work, and declaring it keeps that visible rather than buried. */
    readonly providerCalls: number;
}

export const CAPABILITY_EFFORT: Record<Capability, CapabilityEffort> = {
    'plan.edit':         { reasoning: 'moderate', media: 'none',  magnitude: 'perClip',        providerCalls: 1 },
    'plan.research':     { reasoning: 'deep',     media: 'none',  magnitude: 'fixed',          providerCalls: 1 },
    'understand.text':   { reasoning: 'light',    media: 'text',  magnitude: 'perKChar',       providerCalls: 1 },
    'understand.image':  { reasoning: 'moderate', media: 'image', magnitude: 'perImage',       providerCalls: 1 },
    'understand.video.transcribe': { reasoning: 'none', media: 'audio', magnitude: 'perAudioMinute', providerCalls: 1 },
    'understand.video.scenes':     { reasoning: 'light', media: 'video', magnitude: 'perVideoSecond', providerCalls: 1 },
    'understand.video.summarize':  { reasoning: 'moderate', media: 'video', magnitude: 'fixed', providerCalls: 1 }, // Flat 5 units via effortFor override later if needed, but the formula: reasoning=2, media=8 => 10 base. With magnitude=fixed(1) it is 10. We'll handle this in effortFor.
    'understand.video.deep':       { reasoning: 'moderate', media: 'video', magnitude: 'perVideoSecond', providerCalls: 1 },
    'speech.transcribe': { reasoning: 'none',     media: 'audio', magnitude: 'perAudioMinute', providerCalls: 1 },
    'speech.translate':  { reasoning: 'light',    media: 'audio', magnitude: 'perAudioMinute', providerCalls: 1 },
    'speech.synthesize': { reasoning: 'none',     media: 'text',  magnitude: 'perKChar',       providerCalls: 1 },
    'text.translate':    { reasoning: 'light',    media: 'text',  magnitude: 'perKChar',       providerCalls: 1 },
    'document.ocr':      { reasoning: 'none',     media: 'image', magnitude: 'perImage',       providerCalls: 1 },
};

// ── The formula ──────────────────────────────────────────────────────────────

/**
 * Base effort per unit of magnitude, derived from declared traits.
 *
 * Reasoning is weighted independently of media on purpose: a request that
 * deliberates heavily and returns two words is MORE AI work than one that returns
 * a page of easy prose. A cost-derived meter gets this backwards, because it prices
 * output length.
 */
function baseEffort(traits: CapabilityEffort): number {
    const reasoning = { none: 0, light: 1, moderate: 2, deep: 6 }[traits.reasoning];
    const media = { none: 0, text: 0, audio: 1, image: 4, video: 8 }[traits.media];
    // At least 1 — anything reaching a provider represents some work.
    return Math.max(1, reasoning + media) * Math.max(1, traits.providerCalls);
}

/** What the request's magnitude is, in the basis the capability declares. */
export interface Magnitude {
    readonly clips?: number;
    readonly images?: number;
    readonly audioMinutes?: number;
    readonly videoSeconds?: number;
    readonly characters?: number;
}

function magnitudeFactor(basis: MagnitudeBasis, m: Magnitude): number {
    switch (basis) {
        case 'fixed':           return 1;
        case 'perClip':         return Math.max(1, m.clips ?? 1);
        case 'perImage':        return Math.max(1, m.images ?? 1);
        case 'perAudioMinute':  return Math.max(1, m.audioMinutes ?? 1);
        // Charged per 10 seconds: per-second would make a 3-minute clip cost 180×
        // a chat message, which is punitive for the flagship use case.
        case 'perVideoSecond':  return Math.max(1, (m.videoSeconds ?? 10) / 10);
        case 'perKChar':        return Math.max(1, (m.characters ?? 1000) / 1000);
    }
}

/**
 * Effort for one request. Computable before execution.
 *
 * `executionClass` is resolved by the runtime's native → local → cloud hierarchy
 * BEFORE dispatch, so a quote is available up front. If a request falls back
 * mid-flight (local model fails, cloud takes over), charge the class that ACTUALLY
 * ran — the user should never pay a cloud price for work that stayed on device, and
 * should never get cloud work for free because we intended it to run locally.
 */
export function effortFor(
    capability: Capability,
    magnitude: Magnitude,
    executionClass: ExecutionClass
): number {
    const multiplier = EXECUTION_MULTIPLIER[executionClass];
    if (multiplier === 0) return 0;

    const traits = CAPABILITY_EFFORT[capability];
    if (!traits) return 0;
    
    // Explicit exception for understand.video.summarize flat rate of 5 units.
    if (capability === 'understand.video.summarize') {
        return 5 * multiplier;
    }

    const raw = baseEffort(traits) * magnitudeFactor(traits.magnitude, magnitude) * multiplier;
    return Math.max(1, Math.ceil(raw));
}

/** A pre-flight quote for the UI, so a price can be shown before acting. */
export function quoteEffort(
    capability: Capability,
    magnitude: Magnitude,
    executionClass: ExecutionClass
): { units: number; free: boolean; reason: string } {
    const units = effortFor(capability, magnitude, executionClass);
    if (units === 0) {
        return {
            units: 0,
            free: true,
            reason: executionClass === 'native'
                ? 'Runs on your machine using Vichith’s own engine — free.'
                : 'Runs on your machine using a local model — free.',
        };
    }
    return { units, free: false, reason: `Uses about ${units} unit${units === 1 ? '' : 's'} of your monthly AI.` };
}

// ── Allowances ───────────────────────────────────────────────────────────────

/**
 * Monthly allowance in effort units.
 *
 * Set by US, deliberately, and NOT derived from provider pricing — that is the
 * whole point of the two-ledger split. A provider price change moves the cost
 * ledger and our margin; it does not move this number unless we choose to move it.
 */
export const PLAN_UNITS: Record<string, number> = {
    anonymous: 0,
    free: 300,
    paid: 12_000,
};

export function allowanceFor(plan: string): number {
    return PLAN_UNITS[plan] ?? PLAN_UNITS.free;
}

export interface UsageMeter {
    readonly usedUnits: number;
    readonly allowanceUnits: number;
    /** 0–100, clamped. The ring the Chithra UI draws. */
    readonly percentUsed: number;
    readonly plan: string;
}

export function buildMeter(usedUnits: number, plan: string): UsageMeter {
    const allowance = allowanceFor(plan);
    const percent = allowance > 0 ? Math.min(100, Math.round((usedUnits / allowance) * 100)) : 100;
    return { usedUnits, allowanceUnits: allowance, percentUsed: percent, plan };
}
