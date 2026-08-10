/**
 * src/lib/ai/modelRouter.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * THE MODEL ROUTER — capability + entitlement + estimated cost → provider+model.
 *
 * Where this sits: `compute/registry.ts` declares every model. The adapters
 * (`adapters/*`) execute one call. THIS file is the thing between them: it reads
 * the catalog and decides, for a given capability, plan and cost, WHICH model
 * runs. It never makes a provider call, and it never executes anything.
 *
 * The rules this enforces are the V1 named requirements:
 *
 *   1. A cheap operation must never select an expensive model. Given several
 *      eligible models for the same capability, the router picks the cheapest
 *      that can do the job. Opting up is a PAID user's explicit choice, never
 *      the router's default.
 *   2. An unavailable model must never be selected. "Available" is a runtime
 *      verdict across five gates — available · configured · enabled · entitled
 *      · healthy. Missing credentials, a disabled flag, a coming-soon status or
 *      a currently-failing provider each remove the model, and the refusal says
 *      which gate shut it out.
 *   3. No silent fallback. If a user asked for a specific model and it is not
 *      usable, the answer is an ERROR that says so — never a different model
 *      answering in its place. A confident answer from a model the user did not
 *      choose is worse than an error.
 *   4. Output ceilings are routing constraints. Sarvam's starter tier caps
 *      `max_tokens` at 4096; a request that needs more room must route to a
 *      model that can hold it, or refuse. It is never silently truncated.
 *
 * The router SELECTS; the adapters EXECUTE. Nothing here imports an adapter.
 */

import { listLlmModelCatalog, getLlmModelCatalogEntry } from '../compute/registry';
import type { LlmModelCatalogEntry } from '../compute/types';
import type { Capability, ProviderId } from './provider';

// ── Entitlement ──────────────────────────────────────────────────────────────

export type PlanId = 'free' | 'paid';

/** Whether a plan clears a model's `minPlan` floor. */
function isEntitled(plan: string, minPlan: LlmModelCatalogEntry['minPlan']): boolean {
    if (minPlan === 'free') return plan === 'free' || plan === 'paid';
    return plan === 'paid';
}

// ── Health ───────────────────────────────────────────────────────────────────

/** Runtime provider health, so "healthy" is evidence, not a registry field. */
export interface ProviderHealth {
    /** True while a provider is known to be failing (e.g. repeated 5xx). */
    failing(provider: ProviderId): boolean;
}

/** In-memory health tracker. Adaptors/route record outcomes; the router consults. */
export class ProviderHealthTracker implements ProviderHealth {
    private readonly failingSince = new Map<ProviderId, number>();

    recordSuccess(provider: ProviderId): void {
        this.failingSince.delete(provider);
    }

    recordFailure(provider: ProviderId): void {
        this.failingSince.set(provider, Date.now());
    }

    failing(provider: ProviderId): boolean {
        return this.failingSince.has(provider);
    }
}

/** Process-wide health state, fed by the route after every attempt. */
export const providerHealth = new ProviderHealthTracker();

// ── Availability ─────────────────────────────────────────────────────────────

/**
 * The five gates, resolved for one model in the caller's world.
 *
 * `available` (shipped vs coming-soon/retired) and `enabled` (operator switch)
 * come from the catalog. `configured` is "does the credential env var exist".
 * `entitled` is the plan check. `healthy` is runtime evidence. The model is
 * USABLE only when all five are true — this is the shape the selector UI gets,
 * so a free user sees exactly why the paid models are locked, and a paid user
 * sees exactly why a credential-less model is greyed out.
 */
export interface ModelAvailability {
    readonly modelId: string;
    readonly name: string;
    readonly provider: ProviderId;
    readonly available: boolean;
    readonly configured: boolean;
    readonly enabled: boolean;
    readonly entitled: boolean;
    readonly healthy: boolean;
    /** True iff every gate is open — this model may be presented as usable. */
    readonly usable: boolean;
}

export function availabilityFor(
    entry: LlmModelCatalogEntry,
    plan: string,
    env: NodeJS.ProcessEnv = process.env,
    health: ProviderHealth = providerHealth,
): ModelAvailability {
    const available = entry.status === 'available';
    const configured = Boolean((env[entry.requiredEnv] ?? '').trim());
    const entitled = isEntitled(plan, entry.minPlan);
    const healthy = !health.failing(entry.provider);
    return {
        modelId: entry.modelId,
        name: entry.name,
        provider: entry.provider,
        available,
        configured,
        enabled: entry.enabled,
        entitled,
        healthy,
        usable: available && configured && entry.enabled && entitled && healthy,
    };
}

// ── The selection ────────────────────────────────────────────────────────────

/** What the route passes down to the adapter layer. Never a capability string. */
export interface ModelSelection {
    readonly provider: ProviderId;
    readonly modelId: string;
    readonly maxOutputTokens: number;
    readonly attribution: string | null;
    /** Normalised ordering cost — informs "cheap op, cheap model". */
    readonly creditCost: number;
}

export type SelectionRefusalCode =
    | 'CAPABILITY_UNSERVED'   // no catalog model serves this capability at all
    | 'ENTITLEMENT_REQUIRED'  // the only models for it are paid-only
    | 'MODEL_UNAVAILABLE'     // requested model exists but fails a gate
    | 'OUTPUT_TOO_LONG';      // no entitled model can hold the requested length

export type SelectionResult =
    | { ok: true; selection: ModelSelection }
    | { ok: false; code: SelectionRefusalCode; message: string };

export interface SelectModelParams {
    readonly capability: Capability;
    readonly plan: string;
    /** A paid user's explicit pick. Free users never reach this field. */
    readonly requestedModelId?: string;
    /** Hard output requirement. Models that cannot hold it are ineligible. */
    readonly requiredMaxTokens?: number;
    readonly env?: NodeJS.ProcessEnv;
    readonly health?: ProviderHealth;
}

/** The cheapest eligible model for the capability, in the caller's entitlement. */
export function selectModel(params: SelectModelParams): SelectionResult {
    const env = params.env ?? process.env;
    const health = params.health ?? providerHealth;

    const candidates = listLlmModelCatalog().filter((m) =>
        m.capabilities.includes(params.capability),
    );

    if (candidates.length === 0) {
        return {
            ok: false,
            code: 'CAPABILITY_UNSERVED',
            message: `No model is registered to serve "${params.capability}".`,
        };
    }

    const entitled = candidates.filter((m) => isEntitled(params.plan, m.minPlan));
    if (entitled.length === 0) {
        return {
            ok: false,
            code: 'ENTITLEMENT_REQUIRED',
            message:
                `"${params.capability}" runs on a paid model. ` +
                `Upgrade to choose a model and keep generating.`,
        };
    }

    // An explicit pick must clear EVERY gate; no silent substitution. A free
    // user is refused up front (the route never forwards a free pick), but the
    // router defends the invariant anyway.
    if (params.requestedModelId) {
        const entry = getLlmModelCatalogEntry(params.requestedModelId);
        if (!entry || !entry.capabilities.includes(params.capability)) {
            return {
                ok: false,
                code: 'MODEL_UNAVAILABLE',
                message: `"${params.requestedModelId}" cannot serve "${params.capability}".`,
            };
        }
        const gates = availabilityFor(entry, params.plan, env, health);
        if (!gates.usable) {
            return {
                ok: false,
                code: 'MODEL_UNAVAILABLE',
                message: unavailableMessage(entry, gates),
            };
        }
        if (params.requiredMaxTokens && entry.maxOutputTokens < params.requiredMaxTokens) {
            return {
                ok: false,
                code: 'OUTPUT_TOO_LONG',
                message:
                    `"${entry.name}" tops out at ${entry.maxOutputTokens} output tokens, ` +
                    `which is less than the ${params.requiredMaxTokens} this request needs. ` +
                    `Pick a model with more headroom or shorten the output.`,
            };
        }
        return { ok: true, selection: toSelection(entry) };
    }

    // Auto-routing: the cheapest usable model that can hold the output. Sorting
    // by `creditCost` IS the "cheap operation never selects an expensive model"
    // rule — the default answer is the least creditCost that passes the gates.
    const usable = entitled.filter((m) => availabilityFor(m, params.plan, env, health).usable);
    if (usable.length === 0) {
        const someConfigured = entitled.some((m) => Boolean((env[m.requiredEnv] ?? '').trim()));
        return {
            ok: false,
            code: someConfigured ? 'MODEL_UNAVAILABLE' : 'ENTITLEMENT_REQUIRED',
            message: someConfigured
                ? 'No entitled model for this capability is usable right now. Check provider health and try again.'
                : `No AI provider is configured yet for "${params.capability}". This is a server-side configuration gap.`,
        };
    }

    const sorted = [...usable].sort((a, b) => a.creditCost - b.creditCost);

    if (params.requiredMaxTokens) {
        const required = params.requiredMaxTokens;
        const fitting = sorted.find((m) => m.maxOutputTokens >= required);
        if (!fitting) {
            return {
                ok: false,
                code: 'OUTPUT_TOO_LONG',
                message:
                    `No entitled model can hold ${params.requiredMaxTokens} output tokens ` +
                    `(the largest available holds ${sorted[sorted.length - 1].maxOutputTokens}). ` +
                    `Shorten the output or upgrade for longer-context models.`,
            };
        }
        return { ok: true, selection: toSelection(fitting) };
    }

    return { ok: true, selection: toSelection(sorted[0]) };
}

/** Shape the registry entry into what the adapter layer needs. */
function toSelection(entry: LlmModelCatalogEntry): ModelSelection {
    return {
        provider: entry.provider,
        modelId: entry.modelId,
        maxOutputTokens: entry.maxOutputTokens,
        attribution: entry.attribution,
        creditCost: entry.creditCost,
    };
}

/** Name the gate that shut a requested model out — the honest "why". */
function unavailableMessage(entry: LlmModelCatalogEntry, gates: ModelAvailability): string {
    if (entry.status !== 'available') {
        return `"${entry.name}" is not available yet.`;
    }
    // Entitlement before configuration on purpose: a free user asking to run a
    // paid model must be told the plan answer, even when the server also lacks a
    // key — "upgrade" is the explanation that changes their next decision, where
    // "not configured" would read as a broken product.
    if (!gates.entitled) {
        return `"${entry.name}" requires a paid plan.`;
    }
    if (!gates.configured) {
        return `"${entry.name}" is not configured on the server — its provider has no credentials.`;
    }
    if (!entry.enabled) {
        return `"${entry.name}" is temporarily disabled.`;
    }
    if (!gates.healthy) {
        return `"${entry.name}"'s provider is having trouble right now. Try again shortly.`;
    }
    return `"${entry.name}" is not usable right now.`;
}
