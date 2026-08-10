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

-- Children first.
DROP TABLE IF EXISTS public.task_attachments;
DROP TABLE IF EXISTS public.task_comments;

-- Then the parent.
DROP TABLE IF EXISTS public.tasks;

-- Independent of the task tree.
DROP TABLE IF EXISTS public.activity_logs;
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
