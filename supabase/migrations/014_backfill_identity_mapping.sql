-- 014_backfill_identity_mapping.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Link auth.users rows that already existed when the trigger was created.
--
-- WHY UNIFICATION WORKED FOR NEW USERS AND NOT EXISTING ONES.
--
-- 012 links the two identity systems with a trigger:
--
--     CREATE TRIGGER ... AFTER INSERT ON auth.users
--     → UPDATE public.users SET auth_user_id = NEW.id
--       WHERE email = NEW.email AND auth_user_id IS NULL;
--
-- A trigger only covers the FUTURE. Every auth.users row created before 012 was
-- applied — which includes anyone who signed up on app.vichith.in while this was
-- being built — never fired it and is still unlinked. So a new account is one
-- person with one id, and an older account is still two.
--
-- Nothing backfilled the past. This does, once.
--
-- WHAT THIS TOUCHES: one nullable column, on rows where it is currently NULL.
-- No primary key moves. No foreign key is affected. `003_desktop_auth.sql` has
-- five FKs into public.users(id) and none of them are touched here — that is
-- precisely why the mapping-column approach was chosen over rewriting ids.

-- ── Look before you write ────────────────────────────────────────────────────
--
-- `auth_user_id` is UNIQUE (012:15). If two public.users rows share an email,
-- the backfill below would map one and fail on the other, and which one won
-- would be arbitrary. Run this FIRST and expect ZERO rows:
--
--   SELECT lower(email) AS email, count(*)
--   FROM public.users
--   GROUP BY lower(email)
--   HAVING count(*) > 1;
--
-- If it returns anything, STOP and report it rather than running the UPDATE.
-- Duplicate rows for one human is a data question, not a migration question —
-- one of them holds the history and the other does not, and only a person can
-- say which is which.

-- ── The backfill ─────────────────────────────────────────────────────────────
--
-- Email is compared case-insensitively because `createUser` lowercases on write
-- (`db.ts:171`) while rows created by other paths may not have.
--
-- `auth_user_id IS NULL` keeps this idempotent and stops it from ever
-- re-pointing a mapping that is already set.
UPDATE public.users AS u
SET auth_user_id = a.id
FROM auth.users AS a
WHERE lower(u.email) = lower(a.email)
  AND u.auth_user_id IS NULL;

-- ── Verification ─────────────────────────────────────────────────────────────
--
-- Who is now linked, and who is still not:
--
--   SELECT u.email,
--          u.id            AS legacy_id,
--          u.auth_user_id  AS canonical_id,
--          (a.id IS NOT NULL) AS has_auth_account
--   FROM public.users u
--   LEFT JOIN auth.users a ON lower(a.email) = lower(u.email)
--   ORDER BY u.email;
--
-- A row with `has_auth_account = false` is NOT a failure of this migration —
-- that person has no Supabase account yet. They get one by signing up on
-- app.vichith.in with the same email, and 012's trigger links them on insert.
-- Until then they resolve to their legacy id and cannot hold a wallet, which is
-- the known and accepted state of the grace period.
--
-- `identity.ts` caches a NEGATIVE lookup for five minutes, so a user linked by
-- this migration may take up to five minutes to resolve to their canonical id on
-- an already-warm serverless instance. That is bounded and self-correcting; it
-- is not a reason to restart anything.
