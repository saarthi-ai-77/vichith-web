-- 006_auth_code_session.sql
--
-- S-4 Step 3 · Carry a Supabase session across the authorization-code hop.
--
-- The desktop flow is two requests: `/api/auth/desktop-login` authenticates and
-- returns a code on the loopback, then `/api/auth/exchange` redeems that code for
-- tokens. With Supabase as the identity provider the session is created during the
-- FIRST request — GoTrue issues it at sign-in — but must be handed over during the
-- SECOND, and the password is (correctly) not available any more by then.
--
-- So the session rides on the code row it belongs to.
--
-- WHY THIS IS ACCEPTABLE STORAGE, STATED PLAINLY
-- It is a bearer token at rest, which deserves scrutiny rather than a shrug:
--
--   • The row is single-use and expires in ≤60 seconds — the same code that grants
--     the session already lives here, so this widens nothing about who can get a
--     session, only what is written down for a minute.
--   • After 004_rls_lockdown.sql this table has RLS on and no policy, so only the
--     service role can read it. Before 004 it was world-readable, which is why THAT
--     migration is a prerequisite and not an unrelated cleanup.
--   • `getAndConsumeAuthCode` marks the row used on read, and the column is cleared
--     at the same time, so the token is not left behind after redemption.
--
-- The alternative — a separate session store keyed by code — is the same data with
-- one more table and one more lifetime to get wrong.
--
-- Idempotent. Requires 004 to have run first.

BEGIN;

ALTER TABLE public.auth_codes
    ADD COLUMN IF NOT EXISTS supabase_session JSONB;

COMMENT ON COLUMN public.auth_codes.supabase_session IS
    'Supabase session minted at sign-in, redeemed at /api/auth/exchange. Cleared on '
    'consumption. NULL for legacy-issued codes. Readable only by the service role.';

COMMIT;
