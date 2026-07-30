/**
 * src/lib/ai/cost.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * The usage meter's cost model.
 *
 * WHY NOT TOKENS AS THE USER-FACING UNIT
 * --------------------------------------
 * Tokens are the obvious candidate and the wrong one here, for three reasons that
 * are specific to Vichith rather than general squeamishness about jargon:
 *
 * 1. **Our cost drivers are not all tokens.** Gemini bills per token. Sarvam bills
 *    per SECOND OF AUDIO for speech and per character for TTS. There is no honest
 *    token count for a two-minute clip of speech, so a token-denominated meter
 *    would have to invent one — and an invented number is exactly what produces
 *    surprising bills.
 *
 * 2. **Tokens leak the provider through the abstraction.** The whole runtime is
 *    built so the desktop never learns which model served it. If we swap
 *    gemini-flash for gemini-pro, or tune a prompt, the token count for the SAME
 *    user action changes — and the user sees their allowance drain faster for no
 *    reason they can observe. A unit the user can reason about must be stable
 *    against decisions they cannot see.
 *
 * 3. **Nobody can predict a token count before acting.** A meter is only useful if
 *    you can answer "can I afford this?" beforehand.
 *
 * WHAT WE METER INSTEAD
 * --------------------
 * Internally: normalised **cost units**, derived from each provider's OWN metering
 * (tokens for Gemini, audio-seconds for Sarvam). That is what protects margin,
 * because it tracks what we actually pay.
 *
 * Externally: a percentage of the monthly allowance, with a published per-capability
 * weight so a user can see the price of an action before taking it.
 *
 * THE PROPERTY THIS BUYS US
 * -------------------------
 * A request that never reaches a provider costs **ZERO units**. Vichith's
 * grammar-first cognition resolves many edits with no model call at all, and a
 * per-action meter would wrongly charge for those. Metering on measured cost means
 * the architecture's efficiency is passed to the user directly — and the same number
 * is our margin metric.
 */

import type { AIUsage, Capability } from './provider';

/**
 * One unit ≈ one ordinary chat message. Chosen so the numbers a user sees are
 * small integers rather than six-digit token counts.
 *
 * Expressed in micro-USD of underlying provider cost. Retune this constant, not
 * the per-capability weights, if provider pricing moves — the weights describe
 * RELATIVE effort and should stay stable.
 */
export const MICRO_USD_PER_UNIT = 2_000; // $0.002

/** Provider rates in micro-USD. Approximate; used for relative weighting, not billing. */
const RATES = {
    geminiInputPerMTok: 300_000,
    geminiOutputPerMTok: 2_500_000,
    sarvamPerAudioSecond: 100,
    sarvamTtsPerKChar: 20_000,
} as const;

/**
 * Published cost of each capability, for showing a price BEFORE the action.
 *
 * These are typical values, not caps — the charge is always the measured one. They
 * exist so the UI can say "this usually costs about N units" rather than leaving
 * the user to find out afterwards.
 */
export const TYPICAL_UNITS: Record<Capability, number> = {
    'plan.edit': 2,
    'plan.research': 8,
    'understand.text': 1,
    'understand.image': 5,
    'understand.video': 20,
    'speech.transcribe': 3,   // ~1 per minute of audio
    'speech.translate': 3,
    'speech.synthesize': 2,
    'text.translate': 1,
    'document.ocr': 3,
};

/**
 * Convert a provider's reported usage into cost units.
 *
 * Returns 0 when nothing was consumed — a request served without reaching a
 * provider is genuinely free and must not be charged for.
 */
export function unitsFor(usage: AIUsage): number {
    let microUsd = 0;

    if (usage.inputTokens) {
        microUsd += (usage.inputTokens / 1_000_000) * RATES.geminiInputPerMTok;
    }
    if (usage.outputTokens) {
        microUsd += (usage.outputTokens / 1_000_000) * RATES.geminiOutputPerMTok;
    }
    if (usage.audioSeconds) {
        microUsd += usage.audioSeconds * RATES.sarvamPerAudioSecond;
    }
    if (usage.estimatedCostUsd) {
        microUsd += usage.estimatedCostUsd * 1_000_000;
    }

    if (microUsd <= 0) return 0;

    // Round UP so a trickle of tiny requests cannot be free forever, but never
    // below 1 for work that did reach a provider — the user should see that
    // something was spent.
    return Math.max(1, Math.ceil(microUsd / MICRO_USD_PER_UNIT));
}

/** Monthly allowance in units, by plan. */
export const PLAN_UNITS: Record<string, number> = {
    anonymous: 0,
    free: 300,
    paid: 12_000,
};

export function allowanceFor(plan: string): number {
    return PLAN_UNITS[plan] ?? PLAN_UNITS.free;
}

/** Everything the Chithra meter needs to render, computed server-side. */
export interface UsageMeter {
    readonly usedUnits: number;
    readonly allowanceUnits: number;
    /** 0–100, clamped. The number the ring in the UI draws. */
    readonly percentUsed: number;
    readonly plan: string;
}

export function buildMeter(usedUnits: number, plan: string): UsageMeter {
    const allowance = allowanceFor(plan);
    const percent = allowance > 0 ? Math.min(100, Math.round((usedUnits / allowance) * 100)) : 100;
    return { usedUnits, allowanceUnits: allowance, percentUsed: percent, plan };
}
