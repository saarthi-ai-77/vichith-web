import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../../../lib/auth/identity';
import { getPack } from '../../../../lib/billing/packs';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const identity = await authenticate(request);
        if (!identity) {
            return NextResponse.json(
                { error: 'unauthorized', message: 'Sign in to purchase credits.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { packId } = body;

        if (!packId) {
            return NextResponse.json(
                { error: 'bad_request', message: 'Missing packId.' },
                { status: 400 }
            );
        }

        // Validate the pack exists and get exact price from server authority.
        // Client-supplied amounts are never trusted per V1 rules.
        let pack;
        try {
            pack = getPack(packId);
        } catch (e: any) {
            return NextResponse.json(
                { error: 'bad_request', message: e.message },
                { status: 400 }
            );
        }

        // Setup Razorpay client
        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        
        if (!key_id || !key_secret) {
            console.error('Razorpay keys not configured.');
            return NextResponse.json(
                { error: 'server_error', message: 'Payment gateway not configured.' },
                { status: 500 }
            );
        }

        const razorpay = new Razorpay({ key_id, key_secret });

        // Amount must be in the smallest currency unit. INR -> paise.
        const amountInPaise = pack.priceInr * 100;

        // Create the order
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            // Store the context in notes. The webhook will blindly trust these notes
            // because they are signed by Razorpay.
            notes: {
                userId: identity.userId,
                packId: pack.id,
            }
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (err: any) {
        console.error('Error creating billing order:', err);
        return NextResponse.json(
            { error: 'server_error', message: err.message || 'Failed to create order.' },
            { status: 500 }
        );
    }
}
