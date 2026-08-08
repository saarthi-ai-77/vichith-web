import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/identity';
import { saveUsageEvents, getUserProfileAndEntitlements } from '@/lib/auth/db';
import { checkQuota } from '@/lib/ai/quota';
import { buildMeter } from '@/lib/ai/effort';

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
    const quota = await checkQuota(identity.userId, plan);

    return NextResponse.json({
      plan,
      // A user who is OVER the ceiling still gets a meter: that is exactly when
      // the number matters most, so this reports usage rather than refusing
      // because the gate would have said no.
      meter: buildMeter(quota.usedUnits, plan),
      remainingThisMonth: quota.allowed ? quota.remainingThisMonth : 0,
      credits_balance: entitlements?.credits_balance ?? 0,
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

    // Fetch user's current credits balance
    const { entitlements } = await getUserProfileAndEntitlements(identity.userId);

    return NextResponse.json({
      accepted: acceptedCount,
      credits_balance: entitlements?.credits_balance ?? 0,
    });
  } catch (err: any) {
    console.error('Error in /api/usage:', err);
    return NextResponse.json(
      { error: 'server_error', message: err.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
