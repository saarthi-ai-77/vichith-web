import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/identity';
import { saveUsageEvents, getUserProfileAndEntitlements } from '@/lib/auth/db';

export const dynamic = 'force-dynamic';

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
