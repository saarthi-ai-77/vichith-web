import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/tokens';
import { findUserById, getUserProfileAndEntitlements } from '@/lib/auth/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    const user = await findUserById(payload.sub);
    if (!user) {
      return NextResponse.json(
        { error: 'user_not_found', message: 'User profile not found.' },
        { status: 401 }
      );
    }

    const { profile, entitlements } = await getUserProfileAndEntitlements(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
      },
      profile: {
        roles: profile?.roles || ['user'],
        avatar_url: profile?.avatar_url || null,
      },
      entitlements: {
        plan: entitlements?.plan || 'free',
        credits_balance: entitlements?.credits_balance ?? 0,
        autonomy_runs_remaining: entitlements?.autonomy_runs_remaining ?? 10,
        renews_at: entitlements?.renews_at || null,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/me:', err);
    return NextResponse.json(
      { error: 'server_error', message: err.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
