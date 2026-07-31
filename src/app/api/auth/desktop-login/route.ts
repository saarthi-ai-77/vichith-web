import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser, createAuthCode, updateUserPasswordHash } from '@/lib/auth/db';
import { createAuthCodeString } from '@/lib/auth/tokens';
import { hashPasswordSecure, verifyPassword } from '@/lib/auth/password';

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

    let user = await findUserByEmail(email);

    if (action === 'signup') {
      if (user) {
        return NextResponse.json(
          { error: 'user_exists', message: 'An account with this email already exists.' },
          { status: 400 }
        );
      }
      // Salted and stretched from the very first account created after this ships
      // (S-7). The migration for EXISTING rows is a separate, still-open decision;
      // that is no reason to keep minting new weak hashes while it is made.
      user = await createUser(email, await hashPasswordSecure(password), display_name);
    } else {
      // Sign in mode
      if (!user) {
        return NextResponse.json(
          { error: 'invalid_credentials', message: 'Invalid email or password.' },
          { status: 401 }
        );
      }

      const { ok, needsUpgrade } = await verifyPassword(password, user.password_hash);
      if (!ok) {
        return NextResponse.json(
          { error: 'invalid_credentials', message: 'Invalid email or password.' },
          { status: 401 }
        );
      }

      // Upgrade in place. The password is already in memory because we just
      // verified it, so this adds no new handling of plaintext — it is not the
      // "capture the plaintext to seed another system" approach that
      // AUTH_UNIFICATION_PLAN.md §4 rejected. Best-effort: a failed write must
      // never cost an authenticated user their sign-in.
      if (needsUpgrade) {
        await updateUserPasswordHash(user.id, await hashPasswordSecure(password));
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
