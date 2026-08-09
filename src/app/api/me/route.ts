import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/identity';
import { findUserById, getUserProfileAndEntitlements } from '@/lib/auth/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // S-4 Step 1: accepts EITHER a Supabase session or the legacy website JWT, so
    // the desktop and website can migrate on different days without signing anyone
    // out. One response for both failure modes — telling a caller WHICH issuer
    // rejected them would tell an attacker which system to attack.
    const identity = await authenticate(request);
    if (!identity) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Sign in to continue.' },
        { status: 401 }
      );
    }

    const user = await findUserById(identity.userId);
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
