import { NextRequest, NextResponse } from 'next/server';
import { rotateRefreshToken, findUserById } from '@/lib/auth/db';
import { createAccessToken, createRefreshTokenString } from '@/lib/auth/tokens';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body || {};

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'invalid_refresh', message: 'Refresh token is required.' },
        { status: 401 }
      );
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const newRefreshTokenStr = createRefreshTokenString();
    const newRefreshExpiresAt = nowInSeconds + 30 * 24 * 60 * 60; // 30 days

    // Rotate refresh token (revokes old token and creates new token)
    const rotatedRecord = await rotateRefreshToken(refresh_token, newRefreshTokenStr, newRefreshExpiresAt);
    if (!rotatedRecord) {
      return NextResponse.json(
        { error: 'invalid_refresh', message: 'Refresh token is invalid, expired, or has already been used.' },
        { status: 401 }
      );
    }

    // Fetch User
    const user = await findUserById(rotatedRecord.user_id);
    if (!user) {
      return NextResponse.json(
        { error: 'invalid_refresh', message: 'User associated with refresh token was not found.' },
        { status: 401 }
      );
    }

    // Create new Access Token (expires_at in UNIX SECONDS)
    const { access_token, expires_at } = createAccessToken({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
    });

    return NextResponse.json({
      access_token,
      refresh_token: newRefreshTokenStr,
      expires_at, // UNIX SECONDS
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/auth/refresh:', err);
    return NextResponse.json(
      { error: 'server_error', message: err.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
