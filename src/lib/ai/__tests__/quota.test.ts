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
            in: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { balance: 100 }, error: null }),
            rpc: vi.fn(),
        };
        (supabaseModule.getSupabaseClient as any).mockReturnValue(mockSupabase);
    });

    it('grants signup credits idempotently', async () => {
        await grantSignupCreditsIdempotent('user-1');
        
        expect(mockSupabase.from).toHaveBeenCalledWith('wallets');
        expect(mockSupabase.insert).toHaveBeenCalledWith({ user_id: 'user-1', granted_balance: 100 });
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

    it('allows TWO reservations against the same jobId (idempotency constraint scoped correctly)', async () => {
        mockSupabase.rpc.mockResolvedValue({
            data: { success: true, reservation_id: 'res-n' },
            error: null
        });

        const res1 = await reserveCredits('user-1', 'job-1', 10);
        const res2 = await reserveCredits('user-1', 'job-1', 10);
        
        expect(res1.allowed).toBe(true);
        expect(res2.allowed).toBe(true);
        expect(mockSupabase.rpc).toHaveBeenCalledTimes(2);
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
    
    it('enforces daily ceiling alongside wallet in checkQuota', async () => {
        // burst check
        mockSupabase.gte.mockResolvedValueOnce({ count: 0, error: null });
        
        // daily reasoning check
        mockSupabase.single.mockResolvedValueOnce({ 
            data: { reasoning_tokens_used_today: 500000, reasoning_reset_at: null }, 
            error: null 
        });
        
        const result = await checkQuota('user-1', 'free', 'plan.edit');
        
        expect(result).toEqual({
            allowed: false,
            reason: 'monthly',
            message: 'You have used your daily thinking allowance. Please upgrade to Pro for more reasoning, or wait until tomorrow.',
            usedUnits: 500000,
        });
    });
    
    it('allows request when daily ceiling and wallet pass', async () => {
        // burst check
        mockSupabase.gte.mockResolvedValueOnce({ count: 0, error: null });
        
        // daily reasoning check
        mockSupabase.single.mockResolvedValueOnce({ 
            data: { reasoning_tokens_used_today: 100000, reasoning_reset_at: null }, 
            error: null 
        });
        
        const result = await checkQuota('user-1', 'free', 'plan.edit');
        
        expect(result).toEqual({
            allowed: true,
            remainingThisMonth: 400000,
            usedUnits: 100000,
        });
    });

    it('enforces wallet balance exhaustion and returns reason: credits', async () => {
        // burst check
        mockSupabase.gte.mockResolvedValueOnce({ count: 0, error: null });
        
        // wallet check
        mockSupabase.single.mockResolvedValueOnce({ data: { granted_balance: 0 }, error: null });
        
        const result = await checkQuota('user-1', 'free', 'speech.transcribe');
        
        expect(result).toEqual({
            allowed: false,
            reason: 'credits',
            message: 'This action requires AI credits, and your balance is 0. Add credits to continue.',
            usedUnits: 0,
        });
    });
});
