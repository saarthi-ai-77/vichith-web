/**
 * Supabase as the identity provider — S-4 Step 3.
 *
 * The properties pinned here are the ones that decide whether flipping
 * `VICHITH_IDENTITY=supabase` is safe. Two of them are the difference between a
 * migration and an outage:
 *
 *   • a sign-in failure must FALL BACK, because during the migration "invalid login
 *     credentials" mostly means "this person is not in Supabase Auth yet"
 *   • a sign-UP failure must NOT fall back, because that would create the same
 *     person twice in two systems — the exact outcome a unified identity exists to
 *     prevent
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const h = vi.hoisted(() => ({
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({ auth: { signInWithPassword: h.signInWithPassword, signUp: h.signUp } }),
}));

import {
    supabaseIdentityEnabled,
    supabaseSignIn,
    supabaseSignUp,
} from '../supabaseIdentity';

const SESSION = {
    access_token: 'sb-access',
    refresh_token: 'sb-refresh',
    expires_at: 1_800_000_000,
};
const USER = { id: 'u-1', email: 'a@b.co', user_metadata: { display_name: 'Ada' } };

const env = { ...process.env };
beforeEach(() => {
    h.signInWithPassword.mockReset();
    h.signUp.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
});
afterEach(() => {
    process.env = { ...env };
});

describe('the flag', () => {
    it('is off unless VICHITH_IDENTITY is exactly supabase', () => {
        delete process.env.VICHITH_IDENTITY;
        expect(supabaseIdentityEnabled()).toBe(false);
        process.env.VICHITH_IDENTITY = 'legacy';
        expect(supabaseIdentityEnabled()).toBe(false);
        process.env.VICHITH_IDENTITY = 'Supabase';
        expect(supabaseIdentityEnabled()).toBe(true);
    });
});

describe('sign-in', () => {
    it('returns a session on success', async () => {
        h.signInWithPassword.mockResolvedValue({ data: { session: SESSION, user: USER }, error: null });
        const out = await supabaseSignIn('a@b.co', 'pw');
        expect(out.kind).toBe('session');
        if (out.kind !== 'session') throw new Error('unreachable');
        expect(out.session.access_token).toBe('sb-access');
        expect(out.session.issuer).toBe('supabase');
        expect(out.session.user.display_name).toBe('Ada');
    });

    it('falls back rather than rejecting when Supabase says no', async () => {
        // THE critical one. GoTrue answers "Invalid login credentials" both for a
        // wrong password and for an account that does not exist there. During the
        // migration most users are the latter, so rejecting here would lock out
        // everyone who has not re-registered the moment the flag is flipped.
        h.signInWithPassword.mockResolvedValue({
            data: null,
            error: { message: 'Invalid login credentials' },
        });
        expect((await supabaseSignIn('a@b.co', 'pw')).kind).toBe('fallback');
    });

    it('falls back when Supabase auth is not configured', async () => {
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        expect((await supabaseSignIn('a@b.co', 'pw')).kind).toBe('fallback');
        expect(h.signInWithPassword).not.toHaveBeenCalled();
    });

    it('falls back on a success that carries no session', async () => {
        h.signInWithPassword.mockResolvedValue({ data: { user: USER }, error: null });
        expect((await supabaseSignIn('a@b.co', 'pw')).kind).toBe('fallback');
    });
});

describe('sign-up', () => {
    it('returns a session on success', async () => {
        h.signUp.mockResolvedValue({ data: { session: SESSION, user: USER }, error: null });
        const out = await supabaseSignUp('a@b.co', 'pw', 'Ada');
        expect(out.kind).toBe('session');
    });

    it('REJECTS rather than falling back when Supabase refuses', async () => {
        // Falling back here would create the same person in both systems, which is
        // the one outcome a unified identity migration must never produce.
        h.signUp.mockResolvedValue({ data: null, error: { message: 'User already registered' } });
        const out = await supabaseSignUp('a@b.co', 'pw');
        expect(out.kind).toBe('rejected');
        if (out.kind !== 'rejected') throw new Error('unreachable');
        expect(out.message).toContain('already registered');
    });

    it('names email confirmation precisely instead of calling it a failure', async () => {
        // A user with no session means the project requires confirmation. Saying
        // "sign-up failed" would be untrue and would hide the link they must click.
        h.signUp.mockResolvedValue({ data: { user: USER, session: null }, error: null });
        const out = await supabaseSignUp('a@b.co', 'pw');
        expect(out.kind).toBe('rejected');
        if (out.kind !== 'rejected') throw new Error('unreachable');
        expect(out.error).toBe('confirmation_required');
        expect(out.message).toMatch(/check your email/i);
    });
});

describe('session shape', () => {
    it('derives expires_at from expires_in when absent', async () => {
        h.signInWithPassword.mockResolvedValue({
            data: { session: { access_token: 'a', refresh_token: 'r', expires_in: 3600 }, user: USER },
            error: null,
        });
        const out = await supabaseSignIn('a@b.co', 'pw');
        if (out.kind !== 'session') throw new Error('unreachable');
        // Unix SECONDS, which is what the desktop parses. Milliseconds here would
        // put expiry ~50,000 years out and silently disable every refresh.
        const nowSecs = Math.floor(Date.now() / 1000);
        expect(out.session.expires_at).toBeGreaterThan(nowSecs);
        expect(out.session.expires_at).toBeLessThan(nowSecs + 7200);
    });

    it('falls back to the email local part when no display name is set', async () => {
        h.signInWithPassword.mockResolvedValue({
            data: { session: SESSION, user: { id: 'u', email: 'zoe@x.com' } },
            error: null,
        });
        const out = await supabaseSignIn('zoe@x.com', 'pw');
        if (out.kind !== 'session') throw new Error('unreachable');
        expect(out.session.user.display_name).toBe('zoe');
    });
});
