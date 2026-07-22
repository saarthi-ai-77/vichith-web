import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser, createAuthCode } from '@/lib/auth/db';
import { createAuthCodeString } from '@/lib/auth/tokens';
import { hashPassword } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const ALLOWED_REDIRECT_URI = 'http://127.0.0.1:43823/callback';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, display_name, state, code_challenge, code_challenge_method, redirect_uri } = body;

    // 1. Validate redirect_uri and PKCE params strictly
    if (redirect_uri !== ALLOWED_REDIRECT_URI) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'redirect_uri must match http://127.0.0.1:43823/callback' },
        { status: 400 }
      );
    }

    if (code_challenge_method !== 'S256' || !code_challenge || !state) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'Invalid PKCE parameters. state, code_challenge, and code_challenge_method=S256 are required.' },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'invalid_credentials', message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);
    let user = await findUserByEmail(email);

    if (action === 'signup') {
      if (user) {
        return NextResponse.json(
          { error: 'user_exists', message: 'An account with this email already exists.' },
          { status: 400 }
        );
      }
      user = await createUser(email, hashedPassword, display_name);
    } else {
      // Sign in mode
      if (!user) {
        return NextResponse.json(
          { error: 'invalid_credentials', message: 'Invalid email or password.' },
          { status: 401 }
        );
      }
      if (user.password_hash && user.password_hash !== hashedPassword) {
        return NextResponse.json(
          { error: 'invalid_credentials', message: 'Invalid email or password.' },
          { status: 401 }
        );
      }
    }

    // Generate single-use authorization code (expires in ≤60 seconds)
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresAt = nowInSeconds + 60; // 60 seconds TTL
    const code = createAuthCodeString();

    await createAuthCode(code, code_challenge, user.id, expiresAt);

    // Build the success loopback redirect URL
    const redirectUrl = `${ALLOWED_REDIRECT_URI}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

    return NextResponse.json({
      success: true,
      redirect_url: redirectUrl,
      code,
      state,
    });
  } catch (err: any) {
    console.error('Error in desktop-login endpoint:', err);
    return NextResponse.json(
      { error: 'server_error', message: err.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
