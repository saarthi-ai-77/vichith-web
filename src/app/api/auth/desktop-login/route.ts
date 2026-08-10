import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseClient } from '@/lib/supabase';
import { findUserByEmail, createUser, createAuthCode, updateUserPasswordHash } from '@/lib/auth/db';
import { createAuthCodeString } from '@/lib/auth/tokens';
import { hashPasswordSecure, verifyPassword } from '@/lib/auth/password';
import {
  supabaseIdentityEnabled,
  supabaseSignIn,
  supabaseSignUp,
  type IdentitySession,
} from '@/lib/auth/supabaseIdentity';

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

    // ── S-4 Step 3: Supabase as the identity provider ────────────────────────
    //
    // Off unless VICHITH_IDENTITY=supabase. When on, the session is minted HERE by
    // GoTrue and carried on the auth-code row to /api/auth/exchange, because the
    // password is deliberately gone by then. Nothing about the wire the desktop
    // speaks changes — only who issued the tokens inside the response.
    let supabaseSession: IdentitySession | null = null;
    const outcome =
      action === 'signup'
        ? await supabaseSignUp(email, password, display_name)
        : await supabaseSignIn(email, password);

    if (outcome.kind === 'rejected') {
      return NextResponse.json(
        { error: outcome.error, message: outcome.message },
        { status: 400 }
      );
    }
    
    // For signup, if Supabase fallback occurs (e.g. misconfigured), we must fail.
    // We strictly enforce Supabase Auth for all new signups.
    if (action === 'signup' && outcome.kind === 'fallback') {
      return NextResponse.json(
        { error: 'server_error', message: 'Identity service is unavailable.' },
        { status: 500 }
      );
    }

    if (outcome.kind === 'session') {
      supabaseSession = outcome.session;
    }
    // For signin, 'fallback' means this person is not a Supabase Auth account.
    // Drop through to the legacy check rather than refusing.

    let user = await findUserByEmail(email);

    if (supabaseSession && user && !user.auth_user_id) {
      // The trigger on auth.users should have linked them, but as a secondary
      // safety net, if they exist locally but aren't mapped yet, map them now.
      const supabase = getSupabaseClient();
      await supabase.from('users').update({ auth_user_id: supabaseSession.user.id }).eq('id', user.id);
      // Mutate the loaded user object so the rest of the flow is correct.
      user.auth_user_id = supabaseSession.user.id;
    }

    if (supabaseSession && !user) {
      // Authenticated by Supabase but with no local row yet: create one so profile,
      // entitlements and usage keep working unchanged. The password column is a
      // random value nothing will ever verify against — Supabase owns this
      // account's credentials now, and storing a usable hash beside it would
      // recreate the second identity system this migration exists to remove.
      user = await createUser(
        email,
        await hashPasswordSecure(crypto.randomUUID()),
        display_name
      );
    }

    if (action === 'signup') {
      // `user` is already set when Supabase just created the account above, so the
      // duplicate check applies only to the legacy path (which is now unreachable for signups, 
      // but we keep the safety check).
      if (user && !supabaseSession) {
        return NextResponse.json(
          { error: 'user_exists', message: 'An account with this email already exists.' },
          { status: 400 }
        );
      }
      // db.ts's password_hash insert path stops being reachable for NEW users.
      // All new users are inserted via the `supabaseSession && !user` block above
      // with an unguessable password hash, delegating authentication entirely to Supabase.
    } else {
      // Sign in mode
      if (!user) {
        return NextResponse.json(
          { error: 'invalid_credentials', message: 'Invalid email or password.' },
          { status: 401 }
        );
      }

      // Already proven by Supabase — re-checking a local hash that no longer
      // governs this account would reject the very users the migration moved.
      const { ok, needsUpgrade } = supabaseSession
        ? { ok: true, needsUpgrade: false }
        : await verifyPassword(password, user.password_hash);
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

    await createAuthCode(code, code_challenge, user.id, expiresAt, supabaseSession);

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
