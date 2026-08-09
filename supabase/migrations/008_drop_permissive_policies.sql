-- 008_drop_permissive_policies.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Remove the `USING (true)` policies 004 left behind.
--
-- WHY THIS IS NOT URGENT, AND WHY IT IS STILL NECESSARY.
--
-- After 004 these policies grant nothing. Postgres checks the table GRANT before
-- it ever evaluates a row policy, and 004 revoked every privilege from `anon` and
-- `authenticated` — so a policy saying "allow everyone" sits behind a door that is
-- locked. Verified live after 004 applied: `anon_has_select_grant` is false on all
-- sixteen tables.
--
-- They are removed anyway for two reasons.
--
-- 1. THEY ARE A LANDMINE. The only thing standing between `Allow all on users` and
--    a full database breach is the absence of one GRANT. Supabase tooling, a
--    future migration, a dashboard click, or a restored backup could re-add it,
--    and the reopening would be silent and total. Defence in depth means both
--    layers should be correct, not one layer compensating for the other forever.
--
-- 2. THEY LIE TO THE READER. A policy named `Allow service role full access on
--    users` that carries no `TO` clause applies to PUBLIC — every role, including
--    anon. Anyone auditing this schema reads the name and believes access is
--    restricted to the service role. That misreading is precisely how S-9 survived
--    as long as it did.
--
-- DECISION RECORDED (founder, 2026-08-09): every table in `public` is
-- SERVICE-ROLE ONLY. The application reaches its data through the API, which uses
-- `SUPABASE_SERVICE_ROLE_KEY` and bypasses RLS by design. No browser code and no
-- route reads these tables with the anon or authenticated role — verified against
-- the live route list: download, report, survey and waitlist all use the service
-- role, `/api/config` only hands the anon key to the client, and the browser
-- Supabase client is used solely by login/signup, which talk to the `auth` schema.
--
-- Consequently a correctly scoped policy has no consumer either. That is why this
-- migration drops policies rather than rewriting them: an unreachable policy is
-- not safer than no policy, it is just harder to reason about.
--
-- RLS REMAINS ENABLED on every table. With RLS on and no policy present, every
-- non-BYPASSRLS role is denied — which is the intended end state, and the same one
-- 004 §2 describes.
--
-- SAFE TO RE-RUN. `DROP POLICY IF EXISTS` is idempotent.
--
-- ORDER: after 004. This migration assumes 004's REVOKE has already run; applying
-- it to a database where `anon` still holds grants would REMOVE the only thing
-- restricting those tables and open them completely.

-- ── The thirteen policies observed after 004, by table ───────────────────────

-- Full-access policies: `FOR ALL USING (true)` with no TO clause.
DROP POLICY IF EXISTS "Allow all on users"            ON public.users;
DROP POLICY IF EXISTS "Allow all on roles"            ON public.roles;
DROP POLICY IF EXISTS "Allow all on sessions"         ON public.sessions;
DROP POLICY IF EXISTS "Allow all on tasks"            ON public.tasks;
DROP POLICY IF EXISTS "Allow all on task_comments"    ON public.task_comments;
DROP POLICY IF EXISTS "Allow all on task_attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Allow all on activity_logs"    ON public.activity_logs;

-- Public-submission surfaces. The routes behind these use the service role, so
-- dropping the policies changes nothing a user can do: /api/download,
-- /api/report and /api/survey all bypass RLS.
DROP POLICY IF EXISTS "Allow read access on downloads"             ON public.downloads;
DROP POLICY IF EXISTS "Allow public inserts on downloads"          ON public.downloads;
DROP POLICY IF EXISTS "Allow read access to authenticated on reports" ON public.reports;
DROP POLICY IF EXISTS "Allow public inserts on reports"            ON public.reports;
DROP POLICY IF EXISTS "Allow read access on surveys"               ON public.surveys;
DROP POLICY IF EXISTS "Allow public inserts on surveys"            ON public.surveys;

-- ── Verification ─────────────────────────────────────────────────────────────
--
-- Run after applying. Expect ZERO rows. Any row is a policy this migration did
-- not know about — report it rather than dropping it blindly, because a policy
-- added deliberately after this was written may have a consumer.
--
--   SELECT tablename, policyname, cmd, roles, qual
--   FROM pg_policies
--   WHERE schemaname = 'public'
--   ORDER BY tablename;
--
-- And confirm the GRANT gate still holds. Expect ZERO rows:
--
--   SELECT table_name, grantee, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND grantee IN ('anon','authenticated');
