/**
 * Supabase Auth as the identity provider — S-4 Step 3.
 *
 * THE SHAPE, AND WHY IT IS THIS SHAPE
 * The plan originally had `/auth/desktop` redirect with a Supabase PKCE code for
 * `auth_exchange_code` to redeem. Checking the call sites killed that: the live
 * desktop path is `auth_exchange_code_web` → `POST /api/auth/exchange`, so the old
 * design silently required a desktop release — a shipped binary, the slowest thing
 * in this system to change and the one thing that cannot be rolled back — and it
 * assumed GoTrue would mint a code against a challenge WE generated.
 *
 * So nothing about the wire changes. The desktop still gets a code on the loopback
 * and still redeems it at `/api/auth/exchange`. The only difference is who issued
 * the tokens inside the response: Supabase instead of our own JWT signer. PKCE is
 * still verified by our `auth_codes` table, which already works, so GoTrue's PKCE
 * semantics never enter into it.
 *
 * OFF BY DEFAULT
 * `VICHITH_IDENTITY=supabase` turns it on. Without it every path below is skipped
 * and the legacy issuance runs exactly as it does today. This is the same dual-path
 * discipline that carried the BYOK migration and the S-7 password change: the new
 * path is added, proven, and only then is the old one deleted (Step 6, gated on
 * telemetry showing zero legacy tokens).
 *
 * WHAT IT CANNOT DO, AND WHY THAT IS NOT A BUG
 * Existing accounts do not exist in Supabase Auth and cannot be migrated silently —
 * their password hashes are one-way (§4). With the flag on, a NEW signup is created
 * in Supabase Auth, and an existing user signing in for the first time falls back to
 * the legacy path rather than being refused. Nobody is locked out by flipping the
 * flag; the migration for existing users is the one-time re-sign-in §4 chose, which
 * needs a message from the founder, not more code.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** The tokens `/api/auth/exchange` hands the desktop. Shape is issuer-independent. */
export interface IdentitySession {
    access_token: string;
    refresh_token: string;
    /** UNIX SECONDS, matching what the desktop already parses. */
    expires_at: number;
    user: { id: string; email: string; display_name: string };
    /** Recorded so Step 6 can be gated on data rather than a date. */
    issuer: 'supabase' | 'legacy';
}

/** True when Supabase Auth is the identity provider for this deployment. */
export function supabaseIdentityEnabled(): boolean {
    return process.env.VICHITH_IDENTITY?.trim().toLowerCase() === 'supabase';
}

/**
 * A client for user-facing auth calls.
 *
 * The ANON key, deliberately, and it is the one place in this codebase that is
 * correct: `signInWithPassword` and `signUp` are anon-key operations, and using the
 * service role here would bypass the very rate limiting and lockout that GoTrue
 * applies to sign-in attempts. (The S-9 build guard allow-lists this file for
 * exactly this reason — see `scripts/check-service-role.mjs`.)
 */
function authClient(): SupabaseClient | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !anonKey) return null;
    // No session persistence: this runs per-request on a server, and a persisted
    // session would be shared between users of the same warm instance.
    return createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

function toSession(data: any, fallbackEmail: string): IdentitySession | null {
    const s = data?.session;
    if (!s?.access_token || !s?.refresh_token) return null;
    const user = data?.user ?? s.user ?? {};
    return {
        access_token: s.access_token,
        refresh_token: s.refresh_token,
        // GoTrue returns `expires_at` in unix seconds; fall back to expires_in.
        expires_at: s.expires_at ?? Math.floor(Date.now() / 1000) + (s.expires_in ?? 3600),
        user: {
            id: user.id ?? '',
            email: user.email ?? fallbackEmail,
            display_name:
                user.user_metadata?.display_name ?? fallbackEmail.split('@')[0] ?? '',
        },
        issuer: 'supabase',
    };
}

export type IdentityOutcome =
    | { kind: 'session'; session: IdentitySession }
    /** Not a Supabase account. The caller falls back to the legacy path. */
    | { kind: 'fallback'; reason: string }
    /** Genuinely bad credentials or a taken email — do NOT fall back. */
    | { kind: 'rejected'; error: string; message: string };

/** Sign in an existing Supabase Auth user. */
export async function supabaseSignIn(email: string, password: string): Promise<IdentityOutcome> {
    const client = authClient();
    if (!client) return { kind: 'fallback', reason: 'supabase auth not configured' };

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
        // "Invalid login credentials" is ambiguous: it means BOTH a wrong password
        // and an account that does not exist in Supabase Auth. During the migration
        // most users are the latter, so this must fall through to the legacy check
        // rather than reject — otherwise flipping the flag locks out everyone who
        // has not re-registered yet.
        return { kind: 'fallback', reason: error.message };
    }
    const session = toSession(data, email);
    return session ? { kind: 'session', session } : { kind: 'fallback', reason: 'no session returned' };
}

/** Create a new Supabase Auth user. */
export async function supabaseSignUp(
    email: string,
    password: string,
    displayName?: string
): Promise<IdentityOutcome> {
    const client = authClient();
    if (!client) return { kind: 'fallback', reason: 'supabase auth not configured' };

    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName || email.split('@')[0] } },
    });
    if (error) {
        // A signup failure IS conclusive — unlike sign-in, there is no "maybe they
        // are a legacy user" reading. Falling back would create a second account for
        // the same person in a different system, which is the one outcome a unified
        // identity migration must never produce.
        return {
            kind: 'rejected',
            error: 'signup_failed',
            message: error.message || 'Could not create the account.',
        };
    }

    const session = toSession(data, email);
    if (session) return { kind: 'session', session };

    // No session with a created user means email confirmation is switched on for
    // the project. Say so precisely: "sign-up failed" would be a lie, and the user
    // needs to know to go and click a link.
    if (data?.user) {
        return {
            kind: 'rejected',
            error: 'confirmation_required',
            message: 'Account created. Check your email to confirm it, then sign in.',
        };
    }
    return { kind: 'fallback', reason: 'no session and no user returned' };
}
