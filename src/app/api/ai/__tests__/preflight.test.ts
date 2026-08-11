/**
 * src/app/api/ai/__tests__/preflight.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * The cost pre-flight on POST /api/ai.
 *
 * Named requirement: the user is told, BEFORE anything runs, that this will cost
 * an estimated N credits and that their balance is M, and a request that would
 * spend more than the balance (M < N) is refused — reusing the existing
 * reservation rather than inventing a second credit path.
 *
 * The observable invariants under test:
 *   • a short balance refuses with 402 and BOTH numbers in the payload
 *   • the refusal happens BEFORE reserveCredits (the reservation is untouched —
 *     the route must not have reached the atomic reserve on a request it can
 *     already know it cannot afford)
 *   • the estimate number quoted to the user equals the effort for THIS request,
 *     never a floor or a different shape than the reservation would take
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as identityModule from '../../../../lib/auth/identity';
import * as dbModule from '../../../../lib/auth/db';
import * as quotaModule from '../../../../lib/ai/quota';

vi.mock('../../../../lib/auth/identity', () => ({
    authenticate: vi.fn(),
}));

vi.mock('../../../../lib/auth/db', () => ({
    getUserProfileAndEntitlements: vi.fn(),
    saveUsageEvents: vi.fn(),
}));

vi.mock('../../../../lib/ai/quota', () => ({
    checkQuota: vi.fn(),
    chargeForCall: vi.fn(),
    getWalletBalance: vi.fn(),
    hasDevelopmentUsageBypass: vi.fn(),
    reserveCredits: vi.fn(),
    settleCredits: vi.fn(),
}));

// The route resolves its runtime through initAIRuntime(). Stub dispatch so these
// tests never reach a real provider — they exercise the pre-flight and the
// LLM-vs-unit-metered gate, not Sarvam's network.
vi.mock('../../../../lib/ai/runtime', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../../lib/ai/runtime')>();
    return {
        ...actual,
        initAIRuntime: () => ({
            dispatch: async () => ({
                ok: true,
                data: 'ok',
                provider: 'sarvam',
                attribution: 'Powered by Sarvam',
                latencyMs: 1,
                requestId: 'req_test',
                usage: { inputTokens: 10, outputTokens: 5 },
            }),
        }),
    };
});

// Keep the REAL effort model, router and estimate: the quoted number must be the
// same one `effortFor` computes, and the router must genuinely be able to build
// a selection for a free user (Sarvam is free-entitled).

function createMockRequest(body: Record<string, unknown>): NextRequest {
    const req = new NextRequest('http://localhost/api/ai', { method: 'POST' });
    req.json = vi.fn().mockResolvedValue(body);
    return req;
}

describe('POST /api/ai cost pre-flight', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        process.env.SARVAM_API_KEY = 'test-sarvam-key';

        (identityModule.authenticate as any).mockResolvedValue({
            userId: 'user-1',
            issuer: 'supabase',
            email: 'a@b.c',
        });
        (dbModule.getUserProfileAndEntitlements as any).mockResolvedValue({
            entitlements: { plan: 'free', autonomy_runs_remaining: 10, renews_at: null },
        });
        (quotaModule.checkQuota as any).mockResolvedValue({
            allowed: true,
            remainingThisMonth: 100,
            usedUnits: 10,
        });
        (quotaModule.hasDevelopmentUsageBypass as any).mockReturnValue(false);
        (quotaModule.reserveCredits as any).mockResolvedValue({
            allowed: true,
            reservationId: 'res_123',
        });
    });

    afterEach(() => {
        delete process.env.SARVAM_API_KEY;
    });

    it('refuses with 402 and a stated credit estimate when the balance is short', async () => {
        (quotaModule.getWalletBalance as any).mockResolvedValue(0);

        const res = await POST(
            createMockRequest({ capability: 'plan.edit', payload: {} }),
        );
        const json = await res.json();

        expect(res.status).toBe(402);
        expect(json.error).toBe('insufficient_funds');
        // Human sentence carries both sides of the M < N comparison.
        expect(json.message).toMatch(/estimated at \d+ credit/);
        expect(json.message).toMatch(/balance is 0/);
        // The machine-readable half matches the effort the reservation would hold.
        expect(json.estimate).toMatchObject({ currentBalance: 0 });
        expect(json.estimate.credits).toBeGreaterThan(0);
    });

    it('quotes exactly the effort units for this request — never a different number', async () => {
        (quotaModule.getWalletBalance as any).mockResolvedValue(0);

        // A 3-clip plan edit costs exactly effortFor('plan.edit', {clips:3}, 'cloud').
        const res = await POST(
            createMockRequest({
                capability: 'plan.edit',
                payload: { clipCount: 3 },
            }),
        );
        const json = await res.json();
        // baseEffort(plan.edit)=2, perClip basis × 3 clips = 6, cloud multiplier 1.
        expect(json.estimate.credits).toBe(6);
    });

    it('does NOT touch the reservation on a refused request — M < N is decided before', async () => {
        (quotaModule.getWalletBalance as any).mockResolvedValue(0);

        const res = await POST(
            createMockRequest({ capability: 'plan.edit', payload: {} }),
        );
        expect(res.status).toBe(402);
        // The atomic reserve is the boundary that CAN enforce the shortfall; the
        // route must not call it for a request the pre-flight already knows it
        // cannot afford. A second credit path would have been invented here.
        expect(quotaModule.reserveCredits).not.toHaveBeenCalled();
    });

    it('passes through to the reservation when the balance covers the estimate', async () => {
        (quotaModule.getWalletBalance as any).mockResolvedValue(1000);

        const res = await POST(
            createMockRequest({ capability: 'plan.edit', payload: {} }),
        );
        expect(quotaModule.reserveCredits).toHaveBeenCalled();
        // A short path with a mocked reserve returning allowed still reaches
        // dispatch, which is where a short balance should NOT take us; status is
        // not 402, which is the assertion that matters here.
        expect(res.status).not.toBe(402);
    });

    it('does NOT route unit-metered Sarvam capabilities through the LLM catalog', async () => {
        (quotaModule.getWalletBalance as any).mockResolvedValue(1000);

        // Captions are speech.transcribe — a unit-metered Sarvam lane with no
        // model choice. Routing it through the LLM catalog would refuse a valid
        // caption request with "CAPABILITY_UNSERVED"; the correct behaviour is to
        // reach the reservation and dispatch on the legacy Sarvam route.
        const res = await POST(
            createMockRequest({
                capability: 'speech.transcribe',
                payload: { durationSecs: 120 },
                mediaApproved: true,
            }),
        );

        // Never a catalog refusal (the error values the model router returns).
        expect(res.status).not.toBe(400);
        const json = await res.json();
        expect(json.error).not.toBe('unserved_capability');
        expect(json.error).not.toBe('model_unavailable');
        expect(quotaModule.reserveCredits).toHaveBeenCalled();
    });

    it('refuses a free user who tries to name a paid model — no silent substitution', async () => {
        (quotaModule.getWalletBalance as any).mockResolvedValue(1000);

        const res = await POST(
            createMockRequest({
                capability: 'plan.edit',
                payload: {},
                modelId: 'gemini-1.5-pro',
            }),
        );
        const json = await res.json();

        // The router NAMES the gate that shut the model out — for a free user
        // picking a paid model that gate is the entitlement, and the answer is
        // an honest refusal, never a silent fallback to Sarvam.
        expect(res.status).toBe(503);
        expect(json.error).toBe('model_unavailable');
        expect(json.message).toMatch(/paid plan/i);
        // The forbidden model must not have been reserved against.
        expect(quotaModule.reserveCredits).not.toHaveBeenCalled();
    });
});