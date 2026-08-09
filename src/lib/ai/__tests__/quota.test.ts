import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reserveCredits, settleCredits, grantSignupCreditsIdempotent, checkQuota } from '../quota';
import * as supabaseModule from '../../supabase';
import * as effortModule from '../effort';

vi.mock('../../supabase', () => ({
    getSupabaseClient: vi.fn(),
}));

vi.mock('../effort', () => ({
    allowanceFor: vi.fn().mockReturnValue(100),
}));

describe('Credit Ledger State Machine', () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            insert: vi.fn().mockResolvedValue({ error: null }),
            update: vi.fn().mockResolvedValue({ error: null }),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { balance: 100 }, error: null }),
            rpc: vi.fn(),
        };
        (supabaseModule.getSupabaseClient as any).mockReturnValue(mockSupabase);
    });

    it('grants signup credits idempotently', async () => {
        await grantSignupCreditsIdempotent('user-1');
        
        expect(mockSupabase.from).toHaveBeenCalledWith('wallets');
        expect(mockSupabase.insert).toHaveBeenCalledWith({ user_id: 'user-1', balance: 100 });
        expect(mockSupabase.from).toHaveBeenCalledWith('credit_transactions');
        expect(mockSupabase.insert).toHaveBeenCalledWith({
            user_id: 'user-1',
            amount: 100,
            reason: 'signup_grant',
            status: 'completed'
        });
    });

    it('does not duplicate signup grant if it fails with conflict', async () => {
        mockSupabase.insert.mockResolvedValueOnce({ error: { code: '23505' } });
        
        await grantSignupCreditsIdempotent('user-1');
        
        expect(mockSupabase.from).toHaveBeenCalledWith('wallets');
        expect(mockSupabase.insert).toHaveBeenCalledTimes(1);
    });

    it('reserves credits and transitions state', async () => {
        mockSupabase.rpc.mockResolvedValueOnce({
            data: { success: true, reservation_id: 'res-1' },
            error: null
        });

        const result = await reserveCredits('user-1', 'job-1', 10);
        
        expect(result).toEqual({ allowed: true, reservationId: 'res-1' });
        expect(mockSupabase.rpc).toHaveBeenCalledWith('reserve_credits', {
            p_user_id: 'user-1',
            p_amount: 10,
            p_job_id: 'job-1'
        });
    });

    it('refuses reservation if insufficient balance', async () => {
        mockSupabase.rpc.mockResolvedValueOnce({
            data: { success: false },
            error: null
        });

        const result = await reserveCredits('user-1', 'job-1', 500);
        
        expect(result.allowed).toBe(false);
    });
    
    it('propagates database errors explicitly', async () => {
        mockSupabase.rpc.mockResolvedValueOnce({
            data: { success: false, error: 'database_error', message: 'Wallet not found.' },
            error: null
        });

        const result = await reserveCredits('user-1', 'job-1', 10);
        
        expect(result).toEqual({ allowed: false, reason: 'error', message: 'Wallet not found.' });
    });

    it('settles a completed reservation', async () => {
        mockSupabase.rpc.mockResolvedValueOnce({ error: null });

        await settleCredits('res-1', 10);
        
        expect(mockSupabase.rpc).toHaveBeenCalledWith('settle_credits', {
            p_reservation_id: 'res-1',
            p_actual_amount: 10
        });
    });

    it('refunds when settling a failed reservation', async () => {
        mockSupabase.rpc.mockResolvedValueOnce({ error: null });

        await settleCredits('res-1', 0);
        
        expect(mockSupabase.rpc).toHaveBeenCalledWith('settle_credits', {
            p_reservation_id: 'res-1',
            p_actual_amount: 0
        });
    });
    
    it('handles overspend when settling a reservation', async () => {
        mockSupabase.rpc.mockResolvedValueOnce({ error: null });

        await settleCredits('res-1', 20); // Reserved was implicitly less than 20
        
        expect(mockSupabase.rpc).toHaveBeenCalledWith('settle_credits', {
            p_reservation_id: 'res-1',
            p_actual_amount: 20
        });
    });
    
    it('enforces monthly ceiling alongside wallet in checkQuota', async () => {
        // burst check ends in .gte()
        mockSupabase.gte.mockResolvedValueOnce({ count: 0, error: null });
        
        // monthly check ends in .gte()
        mockSupabase.gte.mockResolvedValueOnce({ data: [{ credits_cost: 100 }], error: null });
        
        // wallet check ends in .single() (won't be called because it fails earlier, but just in case)
        
        const result = await checkQuota('user-1', 'free');
        
        expect(result).toEqual({
            allowed: false,
            reason: 'monthly',
            message: 'You have used your AI allowance for this month.',
            usedUnits: 100
        });
    });
    
    it('allows request when both monthly ceiling and wallet pass', async () => {
        // burst check ends in .gte()
        mockSupabase.gte.mockResolvedValueOnce({ count: 0, error: null });
        
        // monthly check ends in .gte()
        mockSupabase.gte.mockResolvedValueOnce({ data: [{ credits_cost: 50 }], error: null });
        
        // wallet check ends in .single()
        mockSupabase.single.mockResolvedValueOnce({ data: { balance: 100 }, error: null });
        
        const result = await checkQuota('user-1', 'free');
        
        expect(result).toEqual({
            allowed: true,
            remainingThisMonth: 50,
            usedUnits: 50
        });
    });

    it('enforces wallet balance exhaustion and returns reason: credits', async () => {
        // burst check ends in .gte()
        mockSupabase.gte.mockResolvedValueOnce({ count: 0, error: null });
        
        // monthly check ends in .gte()
        mockSupabase.gte.mockResolvedValueOnce({ data: [{ credits_cost: 50 }], error: null });
        
        // wallet check ends in .single(), returning empty balance
        mockSupabase.single.mockResolvedValueOnce({ data: { balance: 0 }, error: null });
        
        const result = await checkQuota('user-1', 'free');
        
        expect(result).toEqual({
            allowed: false,
            reason: 'credits',
            message: 'You have exhausted your credits.',
            usedUnits: 50
        });
    });
});
