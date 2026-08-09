import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import * as identityModule from '../../../../lib/auth/identity';
import * as dbModule from '../../../../lib/auth/db';
import * as supabaseModule from '../../../../lib/supabase';

vi.mock('../../../../lib/auth/identity', () => ({
    authenticate: vi.fn(),
}));

vi.mock('../../../../lib/auth/db', () => ({
    findUserById: vi.fn(),
    getUserProfileAndEntitlements: vi.fn(),
}));

vi.mock('../../../../lib/supabase', () => ({
    getSupabaseClient: vi.fn(),
}));

function createMockRequest(url: string, method: string = 'GET', body?: any) {
    const req = new NextRequest(url, { method });
    if (body) {
        req.json = vi.fn().mockResolvedValue(body);
    }
    return req;
}

describe('/api/me route', () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();

        (identityModule.authenticate as any).mockResolvedValue({ userId: 'user-1' });
        (dbModule.findUserById as any).mockResolvedValue({
            id: 'user-1',
            email: 'test@example.com',
            display_name: 'Test User'
        });
        (dbModule.getUserProfileAndEntitlements as any).mockResolvedValue({
            profile: { roles: ['user'], avatar_url: null },
            entitlements: { plan: 'free', autonomy_runs_remaining: 10, renews_at: null },
        });

        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: { balance: 42 }, error: null }),
        };
        (supabaseModule.getSupabaseClient as any).mockReturnValue(mockSupabase);
    });

    it('returns credits_balance sourced from wallet for backwards compatibility', async () => {
        const req = createMockRequest('http://localhost/api/me');
        const res = await GET(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        // Assert the returned credits_balance matches the wallet mock of 42
        expect(json.entitlements.credits_balance).toBe(42);
    });

    it('returns credits_balance 0 when wallet does not exist', async () => {
        mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

        const req = createMockRequest('http://localhost/api/me');
        const res = await GET(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.entitlements.credits_balance).toBe(0);
    });
});
