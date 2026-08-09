import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPack } from '../../../../lib/billing/packs';
import { getSupabaseClient } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
            console.error('Razorpay webhook secret not configured.');
            return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
        }

        const rawBody = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature.' }, { status: 401 });
        }

        // Verify signature securely with timingSafeEqual to prevent timing attacks
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');

        const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
        const signatureBuffer = Buffer.from(signature, 'utf8');

        if (
            expectedBuffer.length !== signatureBuffer.length ||
            !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
        ) {
            console.error('Webhook signature mismatch.');
            return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
        }

        const event = JSON.parse(rawBody);
        const eventId = event.event_id || event.id; // Usually event.id for the webhook payload ID itself

        const supabase = getSupabaseClient(); // Service role client to bypass RLS

        // Handle order.paid
        if (event.event === 'order.paid') {
            const paymentEntity = event.payload.payment.entity;
            const orderEntity = event.payload.order.entity;

            // Notes are copied from order to payment. We check order first, fallback to payment.
            const notes = orderEntity.notes || paymentEntity.notes;
            const userId = notes.userId;
            const packId = notes.packId;

            if (!userId || !packId) {
                console.error(`Received order.paid but missing notes for event ${eventId}`);
                return NextResponse.json({ error: 'Missing notes.' }, { status: 400 });
            }

            let pack;
            try {
                pack = getPack(packId);
            } catch (e) {
                console.error(`Received order.paid with invalid packId ${packId} for event ${eventId}`);
                return NextResponse.json({ error: 'Invalid pack.' }, { status: 400 });
            }

            // Grant credits idempotently via our RPC
            const { data, error } = await supabase.rpc('grant_purchased_credits', {
                p_user_id: userId,
                p_amount: pack.credits,
                p_reference_id: eventId,
            });

            if (error) {
                console.error(`RPC grant_purchased_credits failed for event ${eventId}:`, error);
                return NextResponse.json({ error: 'Database error.' }, { status: 500 });
            }

            if (!data) {
                // Returns false if unique constraint fired, meaning we already processed it.
                // We acknowledge a 200 OK so Razorpay stops retrying.
                console.log(`Event ${eventId} was already processed. Ignoring duplicate.`);
            } else {
                console.log(`Granted ${pack.credits} credits to user ${userId} for event ${eventId}`);
            }

            return NextResponse.json({ success: true });
        }

        // Handle payment.refunded or refund.created
        // We will listen for 'payment.refunded' which means a refund was successfully processed.
        if (event.event === 'payment.refunded') {
            const refundEntity = event.payload.refund.entity;
            const paymentEntity = event.payload.payment.entity;
            
            // Notes from the payment that was refunded
            const notes = paymentEntity.notes;
            const userId = notes?.userId;
            const packId = notes?.packId;

            if (!userId || !packId) {
                console.warn(`Received payment.refunded without valid notes for event ${eventId}`);
                return NextResponse.json({ success: true }); // Acknowledge to prevent retries
            }

            let pack;
            try {
                pack = getPack(packId);
            } catch (e) {
                console.warn(`Invalid pack on refund for event ${eventId}`);
                return NextResponse.json({ success: true });
            }

            // Since multiple partial refunds can happen, we use the specific refund entity ID 
            // as the reference, not the parent event ID, if we want to be safe.
            // But the webhook payload `event.id` is unique per webhook delivery.
            const { data, error } = await supabase.rpc('reverse_purchased_credits', {
                p_user_id: userId,
                p_amount: pack.credits,
                p_reference_id: eventId,
            });

            if (error) {
                console.error(`RPC reverse_purchased_credits failed for event ${eventId}:`, error);
                return NextResponse.json({ error: 'Database error.' }, { status: 500 });
            }

            console.log(`Reversed ${pack.credits} credits for user ${userId} for refund event ${eventId}`);
            return NextResponse.json({ success: true });
        }

        // Acknowledge unhandled events gracefully
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Webhook processing error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
