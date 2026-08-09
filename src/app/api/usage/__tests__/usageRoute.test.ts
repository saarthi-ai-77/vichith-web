import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import * as identityModule from '../../../../lib/auth/identity';
import * as dbModule from '../../../../lib/auth/db';
import * as quotaModule from '../../../../lib/ai/quota';
import * as supabaseModule from '../../../../lib/supabase';

vi.mock('../../../../lib/auth/identity', () => ({
    authenticate: vi.fn(),
}));

vi.mock('../../../../lib/auth/db', () => ({
    getUserProfileAndEntitlements: vi.fn(),
    saveUsageEvents: vi.fn(),
}));

vi.mock('../../../../lib/ai/quota', () => ({
    checkQuota: vi.fn(),
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

describe('/api/usage route', () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();

        (identityModule.authenticate as any).mockResolvedValue({ userId: 'user-1' });
        (dbModule.getUserProfileAndEntitlements as any).mockResolvedValue({
            entitlements: { plan: 'pro' },
        });
        (quotaModule.checkQuota as any).mockResolvedValue({
            allowed: true,
            remainingThisMonth: 100,
            usedUnits: 20,
        });

        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: { balance: 50 }, error: null }),
        };
        (supabaseModule.getSupabaseClient as any).mockReturnValue(mockSupabase);
    });

    describe('GET', () => {
        it('returns honest wallet shape when wallet exists', async () => {
            // override the last mock in the chain for transactions to return empty array
            mockSupabase.range.mockResolvedValueOnce({ data: [], error: null });

            const req = createMockRequest('http://localhost/api/usage');
            const res = await GET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.wallet).toEqual({ exists: true, balance: 50 });
            expect(json.transactions).toEqual([]);
        });

        it('returns balance 0 and exists false when no wallet row exists', async () => {
            mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // wallet
            mockSupabase.range.mockResolvedValueOnce({ data: [], error: null }); // transactions

            const req = createMockRequest('http://localhost/api/usage');
            const res = await GET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.wallet).toEqual({ exists: false, balance: 0 });
        });
        
        it('fetches paginated transactions', async () => {
            mockSupabase.maybeSingle.mockResolvedValueOnce({ data: { balance: 50 }, error: null });
            mockSupabase.range.mockResolvedValueOnce({ data: [{ id: 'tx-1' }], error: null });

            const req = createMockRequest('http://localhost/api/usage?limit=10&offset=5');
            const res = await GET(req);
            const json = await res.json();

            expect(mockSupabase.range).toHaveBeenCalledWith(5, 14); // 5 + 10 - 1
            expect(json.transactions).toEqual([{ id: 'tx-1' }]);
        });
    });

    describe('POST', () => {
        it('saves usage and fetches wallet balance', async () => {
            (dbModule.saveUsageEvents as any).mockResolvedValue(2);
            mockSupabase.maybeSingle.mockResolvedValueOnce({ data: { balance: 30 }, error: null });

            const req = createMockRequest('http://localhost/api/usage', 'POST', { events: [{}, {}] });
            const res = await POST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(dbModule.saveUsageEvents).toHaveBeenCalledWith('user-1', [{}, {}]);
            expect(json.accepted).toBe(2);
            expect(json.wallet).toEqual({ exists: true, balance: 30 });
        });
    });
});
