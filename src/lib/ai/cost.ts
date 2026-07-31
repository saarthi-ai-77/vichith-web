/**
 * src/lib/ai/cost.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * The COST ledger — what we actually spent. INTERNAL ONLY.
 *
 * Nothing here is ever shown to a user, and nothing here may influence a quota, an
 * allowance, or the usage meter. Those are the effort ledger's job (`effort.ts`),
 * and the separation is the entire point of the design:
 *
 *   • The effort ledger answers "how much AI assistance have I used?"
 *     — stable for years, provider-independent, quotable before execution.
 *   • The cost ledger answers "what did we spend?"
 *     — moves whenever a provider changes its price list.
 *
 * The first version of this file conflated them, so a Gemini price change would
 * have silently repriced every customer in both directions. Keeping the ledgers
 * apart means a price DROP improves margin rather than leaking away, and a price
 * RISE is absorbed rather than taken out of users who did nothing.
 *
 * What this ledger IS for:
 *   • margin analysis — realised cost per effort unit
 *   • deciding WHEN to revisit allowances (a deliberate, periodic product call)
 *   • cost alarms, and catching a capability that is quietly expensive
 *
 * Native and local execution produce ZERO cost entries, because no provider was
 * paid. That is not a special case; it falls out of there being no usage to report.
 */

import type { AIUsage, ProviderId } from './provider';

/**
 * Provider rates in micro-USD. Approximate, and expected to drift.
 *
 * Drift is fine HERE — that is what this ledger is for. It would not have been
 * fine in the effort ledger, which is exactly why they are separate files.
 */
const RATES = {
    gemini: {
        inputPerMTok: 300_000,
        outputPerMTok: 2_500_000,
    },
    sarvam: {
        perAudioSecond: 100,
        perKChar: 20_000,
        // Sarvam-105B chat, from the published INR rates (Rs.4 / Rs.16 per Mtok)
        // converted at ~Rs.83/USD. Roughly 6x and 13x cheaper than Gemini Flash
        // on input and output respectively — which is why V1 can afford to have
        // AI on by default rather than rationed.
        inputPerMTok: 48_000,
        outputPerMTok: 193_000,
    },
} as const;

/**
 * Real spend for one request, in micro-USD.
 *
 * Derived from what the provider actually reported, not from what we predicted —
 * a prediction that drifts from the invoice is worse than no prediction, because
 * it looks authoritative.
 */
export function costMicroUsd(provider: ProviderId, usage: AIUsage): number {
    let micro = 0;

    // Sarvam serves BOTH token-metered chat and unit-metered speech, so its branch
    // has to handle tokens as well. Missing this would have silently reported zero
    // cost for every reasoning request now that planning runs on Sarvam.
    if (provider === 'sarvam') {
        if (usage.inputTokens) micro += (usage.inputTokens / 1_000_000) * RATES.sarvam.inputPerMTok;
        if (usage.outputTokens) micro += (usage.outputTokens / 1_000_000) * RATES.sarvam.outputPerMTok;
    }

    if (provider === 'gemini') {
        if (usage.inputTokens) micro += (usage.inputTokens / 1_000_000) * RATES.gemini.inputPerMTok;
        if (usage.outputTokens) micro += (usage.outputTokens / 1_000_000) * RATES.gemini.outputPerMTok;
    }

    if (provider === 'sarvam') {
        if (usage.audioSeconds) micro += usage.audioSeconds * RATES.sarvam.perAudioSecond;
    }

    // An adapter that reports cost directly wins over our estimate.
    if (usage.estimatedCostUsd) micro = usage.estimatedCostUsd * 1_000_000;

    return Math.round(micro);
}
