-- 015_resolve_duplicate_identity_row.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- One human, two public.users rows. Delete the empty one.
--
-- THIS IS THE LOGIN BUG, and it is not the mapping.
--
-- `findUserByEmail` (db.ts:137) uses `.maybeSingle()`. PostgREST returns an ERROR,
-- not a row, when more than one matches — so with two rows for one email the
-- function logs, hands back `data = null`, and returns null. `desktop-login` then
-- sees `user === null` and answers 401 "Invalid email or password" for an account
-- that exists and whose credentials are fine.
--
-- That is why unification appeared to work for new users and fail for existing
-- ones: only an existing user could have ended up with two rows.
--
-- THE TWO ROWS, as observed 2026-08-10:
--
--   d9ea7709…  created 2026-07-22  scrypt$   0 usage · 0 entitlements · 0 tokens
--              auth_user_id → 769eb22c…
--   769eb22c…  created 2026-08-10  PROXY_R   203 usage · 1 entitlement · 86 tokens
--              auth_user_id NULL, and its OWN id is the auth.users id
--
-- The migration script that created the second row did the right thing: it made
-- `public.users.id` equal `auth.users.id` for the canonical record and moved the
-- history onto it. It simply left the original behind.
--
-- SO THE PROXY IS CANONICAL, not the original. It holds every dependent row and
-- its id already matches auth.users, which is the invariant the whole unification
-- is trying to reach. The original holds nothing but a password.
--
-- WHAT IS LOST: the scrypt hash on the deleted row — the old desktop-only
-- password. That is intended. Supabase owns this account's credentials now,
-- `desktop-login` tries Supabase first, and keeping a second working password for
-- one person is exactly the dual-credential state this migration exists to end.
-- The user signs in with their app.vichith.in password everywhere.
--
-- CASCADE SAFETY: `003_desktop_auth.sql` puts five ON DELETE CASCADE foreign keys
-- on public.users(id). The row being deleted has 0 usage_events, 0 entitlements
-- and 0 refresh_tokens — verified before writing this — so the cascade reaches
-- nothing. That is the whole reason this row and not the other one goes.

-- ── Guard: refuse if the row is not actually empty ───────────────────────────
--
-- If anything has been written to d9ea7709 since the counts above were taken,
-- deleting it would destroy that data. Fail loudly instead.
DO $$
DECLARE
    v_usage   INTEGER;
    v_ent     INTEGER;
    v_tokens  INTEGER;
BEGIN
    SELECT count(*) INTO v_usage  FROM public.usage_events   WHERE user_id = 'd9ea7709-747b-43cb-9587-f7015adbd521';
    SELECT count(*) INTO v_ent    FROM public.entitlements   WHERE user_id = 'd9ea7709-747b-43cb-9587-f7015adbd521';
    SELECT count(*) INTO v_tokens FROM public.refresh_tokens WHERE user_id = 'd9ea7709-747b-43cb-9587-f7015adbd521';

    IF v_usage > 0 OR v_ent > 0 OR v_tokens > 0 THEN
        RAISE EXCEPTION
            'Refusing to delete d9ea7709: it now holds % usage_events, % entitlements, % refresh_tokens. Re-assess which row is canonical.',
            v_usage, v_ent, v_tokens;
    END IF;
END $$;

-- ── Delete the empty duplicate ───────────────────────────────────────────────
DELETE FROM public.users
WHERE id = 'd9ea7709-747b-43cb-9587-f7015adbd521';

-- ── Make the survivor's mapping explicit ─────────────────────────────────────
--
-- Its id already IS the auth.users id, so `identity.ts` resolves correctly either
-- way (`authUserId || legacyId` returns the same value). Setting it anyway makes
-- the invariant "a canonical row always has auth_user_id" true without exception,
-- so nothing downstream has to special-case a NULL that means "already canonical".
UPDATE public.users
SET auth_user_id = id
WHERE id = '769eb22c-cdd7-4367-a56c-b8037477c16d'
  AND auth_user_id IS NULL;

-- ── Verification ─────────────────────────────────────────────────────────────
--
-- Expect ONE row, with auth_user_id equal to id:
--
--   SELECT id, email, auth_user_id, left(password_hash, 7) AS hash_kind
--   FROM public.users WHERE lower(email) = 'info.vichith@gmail.com';
--
-- Expect ZERO rows — no email may map to more than one user:
--
--   SELECT lower(email), count(*) FROM public.users
--   WHERE email IS NOT NULL AND email <> ''
--   GROUP BY lower(email) HAVING count(*) > 1;
--
-- Then sign in on the desktop with the app.vichith.in password. It should
-- succeed, and /api/usage should show the 203 events and the wallet balance
-- against one identity.
--
-- NOTE the two rows with a BLANK email that the duplicate check also reported.
-- They are untouched and harmless here: they match no auth.users row, so 014
-- skips them and `findUserByEmail` is never called with an empty string. They are
-- data hygiene for later, not part of this fix.
