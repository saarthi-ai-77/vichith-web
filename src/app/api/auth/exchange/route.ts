import { NextRequest, NextResponse } from 'next/server';
import { getAndConsumeAuthCode, findUserById, createRefreshToken } from '@/lib/auth/db';
import { verifyPkceChallenge, createAccessToken, createRefreshTokenString } from '@/lib/auth/tokens';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, code_verifier } = body || {};

    if (!code || !code_verifier) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'Both code and code_verifier are required.' },
        { status: 400 }
      );
    }

    // 1. Fetch and consume authorization code (single-use)
    const authCodeRecord = await getAndConsumeAuthCode(code);
    if (!authCodeRecord) {
      return NextResponse.json(
        { error: 'invalid_code', message: 'Authorization code is invalid or has already been used.' },
        { status: 400 }
      );
    }

    // 2. Check code expiration (expires_at is in UNIX SECONDS)
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (authCodeRecord.expires_at < nowInSeconds) {
      return NextResponse.json(
        { error: 'expired', message: 'Authorization code has expired.' },
        { status: 400 }
      );
    }

    // 3. Verify PKCE S256 Challenge
    const isPkceValid = verifyPkceChallenge(code_verifier, authCodeRecord.code_challenge);
    if (!isPkceValid) {
      return NextResponse.json(
        { error: 'verifier_mismatch', message: 'Code verifier does not match stored code challenge.' },
        { status: 400 }
      );
    }

    // 4. Fetch User
    const user = await findUserById(authCodeRecord.user_id);
    if (!user) {
      return NextResponse.json(
        { error: 'user_not_found', message: 'User associated with authorization code was not found.' },
        { status: 400 }
      );
    }

    // 5. Create Access Token (expires_at in UNIX SECONDS)
    const { access_token, expires_at } = createAccessToken({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
    });

    // 6. Create Rotating Refresh Token (30 days TTL in UNIX SECONDS)
    const refreshTokenStr = createRefreshTokenString();
    const refreshExpiresAt = nowInSeconds + 30 * 24 * 60 * 60; // 30 days
    await createRefreshToken(refreshTokenStr, user.id, refreshExpiresAt);

    // 7. Return 200 OK
    return NextResponse.json({
      access_token,
      refresh_token: refreshTokenStr,
      expires_at, // UNIX SECONDS
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/auth/exchange:', err);
    return NextResponse.json(
      { error: 'server_error', message: err.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
