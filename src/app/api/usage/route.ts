import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../../lib/auth/identity';
import { saveUsageEvents, getUserProfileAndEntitlements } from '../../../lib/auth/db';
import { checkQuota } from '../../../lib/ai/quota';
import { buildMeter } from '../../../lib/ai/effort';
import { getSupabaseClient } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Read the meter without spending anything.
 *
 * This route was POST-only, so the ONLY way to learn a user's usage was to make
 * an AI call and read the meter off its response. The Chithra panel therefore
 * could not draw a truthful meter until you had already used it — and showing 0%
 * beforehand would have been a guess dressed as a fact.
 *
 * Computed from the same `checkQuota` the AI route enforces with, so what the
 * ring shows and what the gate counts cannot drift apart.
 */
export async function GET(request: NextRequest) {
  try {
    const identity = await authenticate(request);
    if (!identity) {
      return NextResponse.json({ error: 'unauthorized', message: 'Sign in to continue.' }, { status: 401 });
    }

    const { entitlements } = await getUserProfileAndEntitlements(identity.userId);
    const plan = entitlements?.plan ?? 'free';
    
    // Check reasoning quota explicitly using a known reasoning capability
    const reasoningQuota = await checkQuota(identity.userId, plan, 'plan.edit');

    const supabase = getSupabaseClient();
    const { data: wallet } = await supabase
        .from('wallets')
        .select('granted_balance, purchased_balance')
        .eq('user_id', identity.userId)
        .maybeSingle();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const { data: transactions } = await supabase
        .from('credit_transactions')
        .select('id, amount, reason, reference_id, status, created_at')
        .eq('user_id', identity.userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    const allowance = plan === 'paid' ? 9999 : 50;
    const percent = allowance > 0 ? Math.min(100, Math.round((reasoningQuota.usedUnits / allowance) * 100)) : 100;

    return NextResponse.json({
      plan,
      meter: {
        usedUnits: reasoningQuota.usedUnits,
        allowanceUnits: allowance,
        percentUsed: percent,
        plan
      },
      remainingThisMonth: reasoningQuota.allowed ? reasoningQuota.remainingThisMonth : 0,
      wallet: {
        exists: !!wallet,
        granted_balance: wallet?.granted_balance ?? 0,
        purchased_balance: wallet?.purchased_balance ?? 0,
        balance: (wallet?.granted_balance ?? 0) + (wallet?.purchased_balance ?? 0),
      },
      transactions: transactions ?? [],
    });
  } catch (err: unknown) {
    console.error('Error in GET /api/usage:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Could not read usage.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // S-4 Step 1: dual-accept. See lib/auth/identity.ts.
    const identity = await authenticate(request);
    if (!identity) {
      return NextResponse.json({ error: 'unauthorized', message: 'Sign in to continue.' }, { status: 401 });
    }

    const body = await request.json();
    const events = Array.isArray(body?.events) ? body.events : [];

    // Save usage events to database
    const acceptedCount = await saveUsageEvents(identity.userId, events);

    // Fetch user's current wallet balance
    const supabase = getSupabaseClient();
    const { data: wallet } = await supabase
        .from('wallets')
        .select('granted_balance, purchased_balance')
        .eq('user_id', identity.userId)
        .maybeSingle();

    return NextResponse.json({
      accepted: acceptedCount,
      wallet: {
        exists: !!wallet,
        granted_balance: wallet?.granted_balance ?? 0,
        purchased_balance: wallet?.purchased_balance ?? 0,
        balance: (wallet?.granted_balance ?? 0) + (wallet?.purchased_balance ?? 0),
      }
    });
  } catch (err: any) {
    console.error('Error in /api/usage:', err);
    return NextResponse.json(
      { error: 'server_error', message: err.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
