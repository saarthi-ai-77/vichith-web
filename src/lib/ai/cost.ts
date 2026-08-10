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
    openrouter: {
        // Aggregator lane: roughly the blended rate of a cheap frontier-mini chat
        // model. Coarse by design — the whole point of estimating pre-flight is
        // that the number may drift, and cost.ts exists to absorb exactly that.
        inputPerMTok: 150_000,
        outputPerMTok: 600_000,
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

/**
 * PRE-FLIGHT estimate of real spend for a request that has not run yet.
 *
 * What the user is actually charged is the EFFORT ledger (`effortFor`) — the
 * currency the wallet understands. This function answers a different, internal
 * question BEFORE anything is sent to a provider: "roughly how much of OUR money
 * would this call cost on this provider?" It is the input to the router's rule
 * that a cheap operation must never select an expensive model, and it is what a
 * pre-flight quote uses to say "≈ $0.012" next to "4 credits".
 *
 * Deliberately coarse (`≈` honoured in the shape):
 *   • chat capabilities — estimate tokens from prompt+expected output length
 *   • unit-metered capabilities — audio seconds / characters, exactly like the
 *     post-hoc function, because there is nothing to guess
 *   • a provider with no rate for this shape estimates 0 — recorded, never
 *     compared against, because 0 is "we don't know", not "it is free"
 *
 * `estimatedCostUsd` on usage never feeds this path: pre-flight has no usage.
 */
export function estimateCostMicroUsd(
    provider: ProviderId,
    capability: string,
    magnitude: { characters?: number; audioSeconds?: number; videoSeconds?: number },
): number {
    const rates = RATES[provider];
    if (!rates) return 0;

    const CHAT_CAPABILITIES = new Set(['plan.edit', 'plan.research', 'understand.text']);

    // Unit-metered shapes match the post-hoc function exactly — there is
    // nothing to guess, so the estimate is the price.
    if (provider === 'sarvam') {
        let micro = (magnitude.audioSeconds ?? 0) * RATES.sarvam.perAudioSecond;
        if (!CHAT_CAPABILITIES.has(capability)) {
            // Translation / OCR-style per-k-char work: chars are the meter.
            micro += (magnitude.characters ?? 0) * RATES.sarvam.perKChar;
            return Math.round(micro);
        }
    }

    // Chat estimate: chars ≈ 1/4 tokens. Output assumed half the input size —
    // a coarseness the "≈" in the docblock claims, nothing more.
    const charTok = Math.max(0, (magnitude.characters ?? 0) / 4);
    const micro = (charTok / 1_000_000) * (rates.inputPerMTok + rates.outputPerMTok * 0.5);
    return Math.round(micro);
}
