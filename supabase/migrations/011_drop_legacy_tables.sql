-- 011_drop_legacy_tables.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Drop six tables from a previous product iteration. Their code is gone; only
-- the tables remained.
--
-- EVIDENCE, not intuition. Every table in `public` was grepped across all three
-- repositories — vichith-web/src, vichith-platform/apps, vichith-platform/packages
-- and the desktop src — for Supabase table access. These six have ZERO:
--
--     activity_logs · roles · sessions · task_attachments · task_comments · tasks
--
-- `tasks` initially showed four matches; none were `from('tasks')`. They were the
-- word appearing in unrelated prose. Checked before proposing the drop, because a
-- table dropped on a false negative is not recoverable from a migration file.
--
-- They are also coherent as a set: tasks, their comments, their attachments,
-- roles, sessions and an activity log is a task-manager schema. That is the shape
-- of something that used to be a different product, which matches the founder's
-- account that the code was deleted and the tables were not.
--
-- WHAT IS DELIBERATELY NOT DROPPED, and why:
--   · profiles (12 refs) · users (7) · wallets (3) · waitlist (3)
--   · usage_events (2) · credit_transactions (2)
--   · auth_codes · downloads · entitlements · refresh_tokens · reports · surveys
--     (1 each — low, but LIVE. One reference is still a consumer.)
--
-- ORDER MATTERS. Children before parents: task_attachments and task_comments
-- reference tasks. Dropping tasks first would either fail or force CASCADE, and
-- CASCADE is how a drop reaches something nobody intended.
--
-- NO CASCADE ANYWHERE IN THIS FILE. If a drop fails on a dependency, that
-- dependency is information — something references this table that the grep did
-- not see. STOP and report it rather than adding CASCADE to make the error go
-- away.
--
-- BACK UP FIRST. Supabase keeps automatic backups, but confirm one exists from
-- today before running this. A dropped table is not in any migration file and
-- cannot be restored from this repository.
--
-- Safe to re-run: IF EXISTS throughout.
--
-- FIRST ATTEMPT FAILED AT `roles`, and correctly — see the note above that drop.
-- Postgres wraps a multi-statement script in an implicit transaction, so that
-- failure rolled the whole file back and nothing was dropped. Verify before
-- re-running:
--
--   SELECT relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY 1;

-- Children first.
DROP TABLE IF EXISTS public.task_attachments;
DROP TABLE IF EXISTS public.task_comments;

-- Then the parent.
DROP TABLE IF EXISTS public.tasks;

-- Independent of the task tree.
DROP TABLE IF EXISTS public.activity_logs;

-- ── roles: a dependency the grep could not see ───────────────────────────────
--
-- The first attempt failed here, exactly as this file's no-CASCADE rule intended:
--
--   ERROR 2BP01: cannot drop table roles because other objects depend on it
--   DETAIL: constraint users_role_id_fkey on table users depends on table roles
--
-- `public.users` carries a `role_id` column with a foreign key into `roles`. A
-- source grep cannot see a schema-level dependency, which is the whole reason
-- this migration refuses CASCADE: the failure is the information.
--
-- CASCADE would have silently dropped the constraint and left an orphan
-- `users.role_id` column pointing at nothing — a column that looks meaningful to
-- the next reader and means nothing at all. That is the failure mode this
-- codebase keeps paying for, in schema form.
--
-- The column is dead too. Nothing anywhere reads `role_id` or `roles`; the
-- application models roles as `roles: string[]`, a text array ON the users table
-- (`db.ts:17` declares it, `db.ts:253` writes `['user']` on insert). So `users`
-- has both a live array and a legacy FK, and only the array is used.
--
-- Drop the constraint and the dead column explicitly, THEN the table. Three named
-- statements instead of one CASCADE: each one says what it removes, and the
-- migration is readable as a record of what happened.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_id_fkey;
ALTER TABLE public.users DROP COLUMN IF EXISTS role_id;

DROP TABLE IF EXISTS public.roles;

-- `public.sessions` is NOT Supabase's session store. Supabase keeps sessions in
-- the `auth` schema, which this migration does not touch. This is a leftover from
-- the same previous iteration.
DROP TABLE IF EXISTS public.sessions;

-- ── Verification ─────────────────────────────────────────────────────────────
--
-- Expect exactly twelve tables, and none of the six above:
--
--   SELECT relname FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'public' AND c.relkind = 'r'
--   ORDER BY 1;
--
-- And confirm the S-9 gates still hold afterwards — expect ZERO rows:
--
--   SELECT table_name, grantee FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND grantee IN ('anon','authenticated');
