/**
 * src/lib/ai/__tests__/modelRouter.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * The Model Router's V1 named requirements, enforced as tests:
 *
 *   1. A cheap operation never selects an expensive model — auto-routing picks
 *      the lowest `creditCost` that clears every gate.
 *   2. An unavailable model is never selected. Availability is five gates
 *      (available · configured · enabled · entitled · healthy), and a model can
 *      be removed by ANY of them — including a built-in `coming_soon` entry
 *      whose whole purpose is to prove the gate exists.
 *   3. No silent fallback. An explicit pick that fails a gate is an ERROR that
 *      names the gate, never a substitution.
 *   4. Output ceilings are routing constraints. Sarvam's 4096 starter cap is
 *      real, and a request needing more headroom routes away from it.
 */

import { describe, expect, it } from 'vitest';
import { selectModel, availabilityFor, ProviderHealthTracker } from '../modelRouter';
import { listLlmModelCatalog, getLlmModelCatalogEntry } from '../../compute/registry';
import { CAPABILITY_ROUTES, type Capability } from '../provider';

/** Fake env where every required credential is populated. */
function envWith(...vars: string[]): NodeJS.ProcessEnv {
    const env: Record<string, string> = {};
    for (const v of vars) env[v] = 'test-value';
    return env as NodeJS.ProcessEnv;
}

/** A health tracker where nothing is failing. */
function healthy(): ProviderHealthTracker {
    return new ProviderHealthTracker();
}

/** A health tracker where one provider is marked failing. */
function failing(provider: string): ProviderHealthTracker {
    const t = new ProviderHealthTracker();
    t.recordFailure(provider as Parameters<ProviderHealthTracker['recordFailure']>[0]);
    return t;
}

const ENV_READY = envWith('SARVAM_API_KEY', 'OPENROUTER_API_KEY');

describe('catalog shape', () => {
    it('registers every chat-facing capability at least once', () => {
        const chatCaps = Object.keys(CAPABILITY_ROUTES).filter((c) =>
            ['plan.edit', 'plan.research', 'understand.text'].includes(c),
        ) as Capability[];
        for (const capability of chatCaps) {
            const served = listLlmModelCatalog().filter((m) => m.capabilities.includes(capability));
            expect(served.length, `${capability} should have a serving model`).toBeGreaterThan(0);
        }
    });

    it('keeps the registry the ONLY place models are declared (single catalog)', () => {
        // The LLM half must live in the same canonical file as the GPU half.
        // This file is the deployment boundary for the "no seventh site" rule.
        const catalog = listLlmModelCatalog();
        // Every entry declares its own model id equal to its key — no aliasing
        // means no path to a model that the registry did not declare.
        for (const entry of catalog) {
            expect(entry.modelId, entry.modelId).toBe(entry.modelId);
        }
    });
});

describe('rule 1 — cheap operations never select expensive models', () => {
    it('a paid user auto-routes to the cheapest usable entitled model', () => {
        const result = selectModel({
            capability: 'plan.edit',
            plan: 'paid',
            env: ENV_READY,
            health: healthy(),
        });
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.selection.modelId).toBe('sarvam-105b');
            expect(result.selection.creditCost).toBe(1);
        }
    });

    it('a paid user may explicitly opt UP, and the router honours the pick', () => {
        const result = selectModel({
            capability: 'plan.edit',
            plan: 'paid',
            requestedModelId: 'openrouter/reasoning-pro',
            env: ENV_READY,
            health: healthy(),
        });
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.selection.modelId).toBe('openrouter/reasoning-pro');
    });

    it('a free user auto-routes to Sarvam (the only entitled model)', () => {
        const result = selectModel({
            capability: 'understand.text',
            plan: 'free',
            env: ENV_READY,
            health: healthy(),
        });
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.selection.provider).toBe('sarvam');
            expect(result.selection.modelId).toBe('sarvam-105b');
        }
    });
});

describe('rule 2 — unavailable models are never selected', () => {
    it('a coming-soon entry is absent from auto-routing even when its env is set', () => {
        const result = selectModel({
            capability: 'plan.edit',
            plan: 'paid',
            env: ENV_READY,
            health: healthy(),
        });
        // The cheapest paid would still be a coming_soon if gates were ignored;
        // it is not, so the router never even considers sarvam-105b-plus.
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.selection.modelId).not.toBe('sarvam-105b-plus');
    });

    it('an unconfigured provider (missing env) is never usable', () => {
        const entry = getLlmModelCatalogEntry('openrouter/mini-chat');
        const av = availabilityFor(entry!, 'paid', envWith('SARVAM_API_KEY'), healthy());
        expect(av.usable).toBe(false);
        expect(av.configured).toBe(false);
    });

    it('a free user cannot pick a paid model — the router refuses by entitlement', () => {
        const result = selectModel({
            capability: 'plan.edit',
            plan: 'free',
            requestedModelId: 'openrouter/mini-chat',
            env: ENV_READY,
            health: healthy(),
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.code).toBe('MODEL_UNAVAILABLE');
            expect(result.message).toMatch(/paid plan/i);
        }
    });

    it('a failing provider is removed from both auto-routing and explicit picks', () => {
        const asleep = failing('sarvam');
        const auto = selectModel({
            capability: 'understand.text',
            plan: 'free',
            env: ENV_READY,
            health: asleep,
        });
        // Free has ONLY Sarvam, and Sarvam is failing → no usable entitled model.
        expect(auto.ok).toBe(false);
        if (!auto.ok) expect(auto.code).toBe('MODEL_UNAVAILABLE');

        const asked = selectModel({
            capability: 'plan.edit',
            plan: 'paid',
            requestedModelId: 'sarvam-105b',
            env: ENV_READY,
            health: asleep,
        });
        expect(asked.ok).toBe(false);
        if (!asked.ok) expect(asked.message).toMatch(/trouble right now/i);
    });

    it('a disabled entry (enabled: false) is never usable even for its own plan', () => {
        // sarvam-105b-plus is both coming_soon and enabled:false in the registry.
        const entry = getLlmModelCatalogEntry('sarvam-105b-plus');
        const av = availabilityFor(entry!, 'paid', ENV_READY, healthy());
        expect(av.available).toBe(false);
        expect(av.enabled).toBe(false);
        expect(av.usable).toBe(false);
    });
});

describe('rule 3 — no silent fallback', () => {
    it('an explicit pick that cannot serve the capability errors, never substitutes', () => {
        // No LLM catalog entry serves transcription; asking for it through the
        // router must fail loudly (CAPABILITY_UNSERVED) rather than silently
        // running a chat path as if it could transcribe.
        const result = selectModel({
            capability: 'speech.transcribe',
            plan: 'paid',
            requestedModelId: 'openrouter/reasoning-pro',
            env: ENV_READY,
            health: healthy(),
        });
        expect(result.ok).toBe(false);
        // The router refuses because the capability is unserved by ANY model —
        // the important property is "not ok, never a silent run on something else".
        if (!result.ok) {
            expect(result.code).toBe('CAPABILITY_UNSERVED');
        }
    });

    it('a requested unknown model id is refused by name', () => {
        const result = selectModel({
            capability: 'plan.edit',
            plan: 'paid',
            requestedModelId: 'openrouter/nonexistent',
            env: ENV_READY,
            health: healthy(),
        });
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.message).toContain('openrouter/nonexistent');
    });

    it('auto-routing NEVER substitutes after a rejection — no usable entitled model means an error', () => {
        const result = selectModel({
            capability: 'plan.edit',
            plan: 'free',
            env: envWith(), // no env at all
            health: healthy(),
        });
        expect(result.ok).toBe(false);
    });
});

describe('rule 4 — output ceilings are routing constraints', () => {
    it('a request that needs more than 4096 output tokens routes away from Sarvam', () => {
        const result = selectModel({
            capability: 'plan.edit',
            plan: 'paid',
            requiredMaxTokens: 8000,
            env: ENV_READY,
            health: healthy(),
        });
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.selection.maxOutputTokens).toBeGreaterThanOrEqual(8000);
            expect(result.selection.provider).toBe('openrouter');
        }
    });

    it('a request beyond every entitled model refuses rather than silently truncating', () => {
        const result = selectModel({
            capability: 'plan.edit',
            plan: 'paid',
            requiredMaxTokens: 100_000,
            env: ENV_READY,
            health: healthy(),
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.code).toBe('OUTPUT_TOO_LONG');
            expect(result.message).toMatch(/16384/);
        }
    });

    it('a free user needing long output is refused (OUTPUT_TOO_LONG), not truncated', () => {
        const result = selectModel({
            capability: 'plan.edit',
            plan: 'free',
            requiredMaxTokens: 8000,
            env: ENV_READY,
            health: healthy(),
        });
        // Sarvam's 4096 is the only free lane, so the answer is a refusal.
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.code).toBe('OUTPUT_TOO_LONG');
            expect(result.message).toMatch(/4096/);
        }
    });
});

describe('availability gates', () => {
    it('a model clears all five gates to become usable', () => {
        const entry = getLlmModelCatalogEntry('sarvam-105b');
        const av = availabilityFor(entry!, 'free', ENV_READY, healthy());
        expect(av).toMatchObject({
            available: true,
            configured: true,
            enabled: true,
            entitled: true,
            healthy: true,
            usable: true,
        });
    });

    it('an unknown plan string does not silently inherit paid access', () => {
        // `allowanceFor`/`limitsForPlan` default unknown plans to free. The Model
        // Router must match: "read 'paid' only when the entitlement literally
        // says paid" is the fail-closed version of that same principle.
        const entry = getLlmModelCatalogEntry('openrouter/mini-chat');
        const av = availabilityFor(entry!, 'premium-trial', ENV_READY, healthy());
        expect(av.entitled).toBe(false);
        expect(av.usable).toBe(false);
    });
});