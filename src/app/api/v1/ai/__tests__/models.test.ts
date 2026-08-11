/**
 * src/app/api/v1/ai/__tests__/models.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/v1/ai/models — the published selector contract for the web
 * generation UI (Agent 2).
 *
 * The contract's honesty invariants: usable means all five availability gates
 * open for THIS viewer; every locked model carries a `locked_reason`; a free
 * user cannot change the model and must be told why (explained, not hidden); a
 * paid user may. No server-side config gap is ever presented as usable.
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { GET } from '../models/route';
import { NextRequest } from 'next/server';
import * as identityModule from '../../../../../lib/auth/identity';
import * as dbModule from '../../../../../lib/auth/db';

vi.mock('../../../../../lib/auth/identity', () => ({
    authenticate: vi.fn(),
}));

vi.mock('../../../../../lib/auth/db', () => ({
    getUserProfileAndEntitlements: vi.fn(),
}));

function createMockRequest(): NextRequest {
    const req = new NextRequest('http://localhost/api/v1/ai/models');
    return req;
}

describe('GET /api/v1/ai/models — the selector contract', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        process.env.SARVAM_API_KEY = 'test-sarvam-key';
        process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
        process.env.GEMINI_API_KEY = 'test-gemini-key';

        (identityModule.authenticate as any).mockResolvedValue({
            userId: 'user-1',
            issuer: 'supabase',
            email: 'a@b.c',
        });
    });

    afterAll(() => {
        delete process.env.SARVAM_API_KEY;
        delete process.env.OPENROUTER_API_KEY;
    });

    it('requires authentication', async () => {
        (identityModule.authenticate as any).mockResolvedValue(null);
        const res = await GET(createMockRequest());
        expect(res.status).toBe(401);
    });

    it('lets a PAID user change the model and reveals the usable models', async () => {
        (dbModule.getUserProfileAndEntitlements as any).mockResolvedValue({
            entitlements: { plan: 'paid', autonomy_runs_remaining: 10, renews_at: null },
        });

        const res = await GET(createMockRequest());
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.entitlements).toMatchObject({ plan: 'paid', can_change_model: true });

        const sarvam = json.models.find((m: any) => m.model_id === 'sarvam-105b');
        expect(sarvam.usable).toBe(true);

        // A paid-configured environment: the mini lane is usable too.
        const mini = json.models.find((m: any) => m.model_id === 'gemini-1.5-pro');
        expect(mini.usable).toBe(true);
    });

    it('tells a FREE user they cannot change the model, locked with a reason, not hidden', async () => {
        (dbModule.getUserProfileAndEntitlements as any).mockResolvedValue({
            entitlements: { plan: 'free', autonomy_runs_remaining: 10, renews_at: null },
        });

        const res = await GET(createMockRequest());
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.entitlements).toMatchObject({ plan: 'free', can_change_model: false });

        const sarvam = json.models.find((m: any) => m.model_id === 'sarvam-105b');
        expect(sarvam.usable).toBe(true); // free lane still honest

        // The paid models are PRESENT (not hidden) and locked with an upgrade reason.
        const mini = json.models.find((m: any) => m.model_id === 'gemini-1.5-pro');
        expect(mini).toBeDefined();
        expect(mini.usable).toBe(false);
        expect(mini.locked_reason).toMatch(/paid plans/i);
    });

    it('never presents a server-configuration gap as usable', async () => {
        delete process.env.GEMINI_API_KEY;
        (dbModule.getUserProfileAndEntitlements as any).mockResolvedValue({
            entitlements: { plan: 'paid', autonomy_runs_remaining: 10, renews_at: null },
        });

        const res = await GET(createMockRequest());
        const json = await res.json();

        const mini = json.models.find((m: any) => m.model_id === 'gemini-1.5-pro');
        expect(mini.usable).toBe(false);
        expect(mini.locked_reason).toMatch(/configured/i);
    });

    it('never presents a coming-soon entry as usable, even to a paid user', async () => {
        (dbModule.getUserProfileAndEntitlements as any).mockResolvedValue({
            entitlements: { plan: 'paid', autonomy_runs_remaining: 10, renews_at: null },
        });

        const res = await GET(createMockRequest());
        const json = await res.json();

        const plus = json.models.find((m: any) => m.model_id === 'sarvam-105b-plus');
        expect(plus).toBeDefined();
        expect(plus.usable).toBe(false);
        expect(plus.locked_reason).toMatch(/coming soon/i);
    });
});