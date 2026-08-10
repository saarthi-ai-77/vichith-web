/**
 * src/lib/ai/router.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Capability → provider dispatch.
 *
 * The router is the ONLY place that knows a request became a Gemini call or a
 * Sarvam call. Everything above it speaks capabilities; everything below it is an
 * adapter. That boundary is what lets providers change without Chithra changing.
 *
 * What it owns:
 *   • enforcing the declared route (and failing loudly on a mis-declared one)
 *   • the per-attempt timeout — nothing runs unbounded
 *   • per-capability fallback, only where a fallback genuinely exists
 *   • turning any provider failure into a message a user can read
 *
 * What it deliberately does NOT own — deferred until traffic justifies it, per
 * `AI_RUNTIME_V1.md` §2: a queue, multi-layer rate limiting, health-based routing,
 * cost-based routing, deduplication. Each plugs in here later without touching a
 * route handler.
 */

import {
    CAPABILITY_ROUTES,
    aiError,
    type AIRequest,
    type AIResult,
    type Capability,
    type ProviderAdapter,
    type ProviderId,
} from './provider';
import type { ModelSelection } from './modelRouter';

export class AIRouter {
    private readonly adapters = new Map<ProviderId, ProviderAdapter>();

    register(adapter: ProviderAdapter): void {
        this.adapters.set(adapter.id, adapter);
    }

    /** The route for a capability, so callers can read timeouts, attribution and
     *  whether the request will carry media — without dispatching. */
    routeFor(capability: Capability) {
        return CAPABILITY_ROUTES[capability];
    }

    /**
     * Dispatch a request.
     *
     * With NO selection this is the legacy path: the capability route decides the
     * provider, then a declared fallback may catch transport-shaped failures.
     *
     * With a `selection` (the Model Router's provider+model answer) the provider
     * is the selection's — the route still supplies timeout/media/attribution —
     * and fallback is DISABLED. Silent provider substitution is forbidden: if a
     * user chose a model, another model answering in its place is worse than an
     * error. A failed selected call returns its failure.
     */
    async dispatch<T = unknown>(
        request: AIRequest,
        selection?: ModelSelection,
    ): Promise<AIResult<T>> {
        const route = CAPABILITY_ROUTES[request.capability];
        if (!route) {
            return aiError('CAPABILITY_UNSUPPORTED', `Unknown capability "${request.capability}".`, request.requestId);
        }

        const resolvedProvider = selection ? selection.provider : route.primary;
        const primary = this.adapters.get(resolvedProvider);
        if (!primary) {
            return aiError(
                'PROVIDER_UNAVAILABLE',
                'That capability is temporarily unavailable.',
                request.requestId,
                true
            );
        }

        // A route pointing at a provider that cannot serve the capability is a
        // configuration bug — or the router handed back a selection its chosen
        // adapter cannot honour. Fail immediately and unmistakably.
        if (!primary.supports(request.capability)) {
            return aiError(
                'CAPABILITY_UNSUPPORTED',
                `Provider "${resolvedProvider}" is routed for "${request.capability}" but does not support it.`,
                request.requestId
            );
        }

        const requestWithSelection = selection ? { ...request, model: selection.modelId } : request;
        const first = await this.attempt<T>(primary, requestWithSelection, route.timeoutMs);
        if (first.ok || selection) return first;

        if (!route.fallback || !isWorthFallingBackOver(first.code)) return first;

        const backup = this.adapters.get(route.fallback);
        if (!backup || !backup.supports(request.capability)) return first;

        const second = await this.attempt<T>(backup, request, route.timeoutMs);
        // If the fallback also fails, report the PRIMARY's failure: it is the more
        // meaningful one, and surfacing the backup's error would describe a provider
        // the user never asked for.
        return second.ok ? second : first;
    }

    /** One attempt, hard-bounded by the route's timeout. */
    private async attempt<T>(
        adapter: ProviderAdapter,
        request: AIRequest,
        timeoutMs: number
    ): Promise<AIResult<T>> {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            return await adapter.execute<T>(request, controller.signal);
        } catch (err) {
            // An adapter is contracted not to throw. If one does, it is a defect in
            // the adapter — contain it here so a single bad adapter cannot take the
            // request pipeline down with it.
            const aborted = controller.signal.aborted;
            return aiError(
                aborted ? 'PROVIDER_TIMEOUT' : 'PROVIDER_ERROR',
                aborted
                    ? 'That took longer than expected. Please try again.'
                    : 'Something went wrong on our side. Please try again.',
                request.requestId,
                true
            );
        } finally {
            clearTimeout(timer);
        }
    }
}

/**
 * Whether a different provider could plausibly have succeeded.
 *
 * Payload and capability errors are deterministic — the fallback would fail
 * identically, for twice the latency and twice the cost. Only transport-shaped
 * failures are worth a second provider.
 */
function isWorthFallingBackOver(code: string): boolean {
    return code === 'PROVIDER_ERROR' || code === 'PROVIDER_TIMEOUT' || code === 'PROVIDER_UNAVAILABLE';
}

/** The process-wide router. Adapters register at module load in `runtime.ts`. */
export const aiRouter = new AIRouter();
