import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/identity';
import { getUserProfileAndEntitlements } from '@/lib/auth/db';
import { listLlmModelCatalog } from '@/lib/compute/registry';
import type { LlmModelCatalogEntry } from '@/lib/compute/types';
import { availabilityFor, providerHealth, type ModelAvailability } from '@/lib/ai/modelRouter';
import type { ProviderId } from '@/lib/ai/provider';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/ai/models — the model selector contract for the web generation UI.
 *
 * NOT the GPU catalog (`/api/v1/compute/models` is that). This is the LLM lane
 * the Model Router runs on, seen through the CALLER's entitlements. It is the
 * single place a client learns "which models may I actually run", and the answer
 * is honest by construction: a model is presented as usable only when all five
 * availability gates are open for this user in this environment.
 *
 * Free users get the models plus an upgrade message for every paid one — the
 * feature is EXPLAINED, never hidden. A free user can never change the model;
 * the selector endpoint is the only shape that stays truthful about that.
 *
 * The response is what Agent 2's generation UI renders. Contract stability
 * matters more than convenience: additive only, and every locked model carries a
 * `locked_reason` field so the UI never has to guess why a row is greyed out.
 */
export async function GET(request: NextRequest) {
    const identity = await authenticate(request);
    if (!identity) {
        return NextResponse.json(
            { error: 'unauthorized', message: 'Sign in to choose an AI model.', requestId: null },
            { status: 401 },
        );
    }

    const { entitlements } = await getUserProfileAndEntitlements(identity.userId);
    const plan = entitlements?.plan ?? 'free';

    const catalog = listLlmModelCatalog();
    const availability = catalog.map((entry) => availabilityFor(entry, plan));

    return NextResponse.json({
        status: 'success',
        request_id: request.headers.get('x-request-id'),
        entitlements: {
            plan,
            // A free user genuinely cannot pick a model; the request is the
            // answer to "why is the selector dead?" asked as a boolean.
            can_change_model: plan !== 'free',
        },
        providers: providerNames(availability),
        models: catalog.map((entry, i) => ({
            model_id: entry.modelId,
            name: entry.name,
            provider: entry.provider,
            capabilities: entry.capabilities,
            max_output_tokens: entry.maxOutputTokens,
            credit_cost: entry.creditCost,
            supports_tools: entry.supportsTools,
            supports_streaming: entry.supportsStreaming,
            supports_json_mode: entry.supportsJsonMode,
            attribution: entry.attribution,
            usable: availability[i].usable,
            ...(availability[i].usable
                ? {}
                : { locked_reason: lockedReason(entry.status, availability[i]) }),
        })),
    });
}

function providerNames(availability: ModelAvailability[]): ProviderId[] {
    return Array.from(new Set(availability.map((a) => a.provider)));
}

/** One human sentence for WHY a model is not usable in this caller's world. */
function lockedReason(
    status: LlmModelCatalogEntry['status'],
    av: ModelAvailability,
): string {
    if (status === 'coming_soon') return 'This model is coming soon.';
    if (status === 'retired') return 'This model is no longer offered.';
    // Entitlement before configuration on purpose: a free user must read "upgrade
    // to enable it" rather than "not configured", which would read as a broken
    // product instead of a decision they can make.
    if (!av.entitled) return `This model is for paid plans — upgrade to enable it.`;
    if (!av.configured) return 'This provider is not configured on the server yet.';
    if (!av.healthy) return 'This provider is having trouble right now. Try again shortly.';
    if (!av.usable) return 'This model is not usable right now.';
    return 'Unavailable.';
}