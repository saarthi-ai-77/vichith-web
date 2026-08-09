import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../webhook/route';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import * as supabaseModule from '../../../../lib/supabase';

vi.mock('../../../../lib/supabase', () => ({
    getSupabaseClient: vi.fn(),
}));

function createSignedRequest(bodyObj: any, secret: string, modifySignature = false) {
    const rawBody = JSON.stringify(bodyObj);
    let signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    
    if (modifySignature) {
        signature = 'invalid_signature_string';
    }

    const req = new NextRequest('http://localhost/api/billing/webhook', {
        method: 'POST',
        headers: {
            'x-razorpay-signature': signature
        },
        body: rawBody
    });
    
    // next/server NextRequest in vitest environment sometimes struggles with .text() mocking
    req.text = vi.fn().mockResolvedValue(rawBody);
    return req;
}

describe('Razorpay Webhook', () => {
    let mockSupabase: any;
    const SECRET = 'test_secret';

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;

        mockSupabase = {
            rpc: vi.fn(),
        };
        (supabaseModule.getSupabaseClient as any).mockReturnValue(mockSupabase);
    });

    it('rejects unsigned or mis-signed payloads', async () => {
        const payload = { event: 'order.paid' };
        
        // Missing signature
        let req = new NextRequest('http://localhost/api/billing/webhook', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        req.text = vi.fn().mockResolvedValue(JSON.stringify(payload));
        
        let res = await POST(req);
        expect(res.status).toBe(401);

        // Invalid signature
        req = createSignedRequest(payload, SECRET, true);
        res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('processes order.paid and calls idempotent RPC', async () => {
        const payload = {
            event: 'order.paid',
            id: 'evt_123',
            payload: {
                order: {
                    entity: {
                        notes: { userId: 'user-1', packId: 'starter' }
                    }
                },
                payment: { entity: {} }
            }
        };

        mockSupabase.rpc.mockResolvedValueOnce({ data: true, error: null });

        const req = createSignedRequest(payload, SECRET);
        const res = await POST(req);
        
        expect(res.status).toBe(200);
        expect(mockSupabase.rpc).toHaveBeenCalledWith('grant_purchased_credits', {
            p_user_id: 'user-1',
            p_amount: 500, // starter pack credits
            p_reference_id: 'evt_123'
        });
    });

    it('handles idempotent replay explicitly by returning 200 without failure', async () => {
        const payload = {
            event: 'order.paid',
            id: 'evt_123',
            payload: {
                order: { entity: { notes: { userId: 'user-1', packId: 'starter' } } },
                payment: { entity: {} }
            }
        };

        // First delivery: data = true (inserted)
        mockSupabase.rpc.mockResolvedValueOnce({ data: true, error: null });
        let req = createSignedRequest(payload, SECRET);
        await POST(req);

        // Second delivery: data = false (violated constraint, nothing inserted)
        mockSupabase.rpc.mockResolvedValueOnce({ data: false, error: null });
        req = createSignedRequest(payload, SECRET);
        const res = await POST(req);
        
        // Even though it was already processed, it returns 200 OK so Razorpay stops retrying
        expect(res.status).toBe(200);
        expect(mockSupabase.rpc).toHaveBeenCalledTimes(2);
    });

    it('reverses a refunded payment via RPC', async () => {
        const payload = {
            event: 'payment.refunded',
            id: 'evt_refund_456',
            payload: {
                refund: { entity: {} },
                payment: { entity: { notes: { userId: 'user-1', packId: 'starter' } } }
            }
        };

        mockSupabase.rpc.mockResolvedValueOnce({ data: true, error: null });

        const req = createSignedRequest(payload, SECRET);
        const res = await POST(req);
        
        expect(res.status).toBe(200);
        expect(mockSupabase.rpc).toHaveBeenCalledWith('reverse_purchased_credits', {
            p_user_id: 'user-1',
            p_amount: 500, // matches starter exactly
            p_reference_id: 'evt_refund_456'
        });
    });
});
