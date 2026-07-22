import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/tokens';
import { saveUsageEvents, getUserProfileAndEntitlements } from '@/lib/auth/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Missing or invalid Authorization header. Expected Bearer token.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Access token is invalid or has expired.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const events = Array.isArray(body?.events) ? body.events : [];

    // Save usage events to database
    const acceptedCount = await saveUsageEvents(payload.sub, events);

    // Fetch user's current credits balance
    const { entitlements } = await getUserProfileAndEntitlements(payload.sub);

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
