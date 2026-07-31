-- 004_rls_lockdown.sql
--
-- S-9 · CRITICAL. Closes full anonymous read/write access to every table.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- WHAT WAS WRONG
--
-- 003_desktop_auth.sql enabled RLS on six tables and then wrote, for each:
--
--     CREATE POLICY "Allow service role full access on users"
--       ON public.users FOR ALL USING (true);
--
-- The name describes an intention the statement does not carry out. A policy with
-- no `TO` clause applies `TO PUBLIC` — every role, including `anon`. And the
-- service role never needed a policy at all: Supabase's `service_role` holds the
-- BYPASSRLS attribute, so it does not consult policies in the first place.
--
-- So the only thing those six policies did was grant `USING (true)` — unrestricted
-- SELECT, INSERT, UPDATE and DELETE — to anonymous callers. RLS was ON and
-- enforcing a rule that permitted everything.
--
-- The anon key is public by design and is served from `/api/config`. Combined,
-- that is an unauthenticated remote compromise of the entire database:
--
--   • `users`          — every email plus `password_hash`, which is *unsalted
--                        SHA-256* (S-7). Readable, then crackable offline at
--                        rainbow-table speed.
--   • `refresh_tokens` — every live refresh token. Read one, mint sessions as
--                        that user indefinitely. Full account takeover.
--   • `auth_codes`     — in-flight PKCE codes.
--   • `entitlements`   — writable, so anyone could set `plan = 'pro'` and give
--                        themselves unlimited credits.
--   • `usage_events`   — forgeable and deletable; billing and quota become fiction.
--   • `profiles`       — role assignments, writable. Self-promotion to admin.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- WHY DENY-ALL IS THE RIGHT MITIGATION, AND NOT A COMPROMISE
--
-- Nothing in the browser touches Supabase. Every call goes through a Next.js
-- route handler using `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS. The anon
-- role therefore needs *zero* table access for the product to work, which means
-- the correct policy set is the empty one: RLS enabled, no policies, nothing
-- permitted. There is no functionality to weigh against it.
--
-- REJECTED ALTERNATIVES
--
--   • Per-user policies keyed on `auth.uid()` — the textbook answer, and wrong
--     here: identity does not live in Supabase Auth yet (S-4 is mid-migration),
--     so `auth.uid()` is NULL for every one of our users. The policies would read
--     as protection and grant nothing, or worse, be "fixed" later by loosening
--     them. Revisit after S-4 Step 3, when `auth.uid()` is real.
--   • Restricting the six policies to `TO service_role` — harmless but pointless,
--     since BYPASSRLS means they are never evaluated. Keeping a decorative policy
--     invites someone to edit it into a real one.
--   • Rotating the anon key — treats a published-by-design value as a leaked
--     secret. It changes the key an attacker uses, not what that key can do.
--   • Revoking grants alone, without RLS — grants and RLS are independent gates.
--     Doing both is the point; either alone is one mistake away from open.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- DEPLOYMENT — ORDER MATTERS
--
-- DO NOT RUN THIS UNTIL `SUPABASE_SERVICE_ROLE_KEY` IS CONFIRMED SET IN VERCEL.
--
-- Every route resolves its key as `SERVICE_ROLE || ANON`. If the service role key
-- is absent, production is *currently running on the anon key* — and this
-- migration would take the entire site down at the moment it is applied.
--
-- The companion change to `src/lib/supabase.ts` makes that condition observable
-- instead of invisible: it refuses to start without the service role key. So:
--
--   1. Deploy the code change. If the site still works, the key is set.
--      If it returns 500, set `SUPABASE_SERVICE_ROLE_KEY` and redeploy.
--   2. Only then run this file in the Supabase SQL Editor.
--
-- That ordering turns "is the key set?" from a question into an observation, and
-- it is why the code change ships first even though the SQL is the actual fix.
--
-- Idempotent: safe to run more than once, and safe on a database where some of
-- these tables do not exist.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- 1 ─ Drop the six policies from 003 by name. Named explicitly rather than
--     dropped wholesale, so this migration cannot silently remove a policy
--     somebody added deliberately after 003.
DROP POLICY IF EXISTS "Allow service role full access on users"          ON public.users;
DROP POLICY IF EXISTS "Allow service role full access on profiles"       ON public.profiles;
DROP POLICY IF EXISTS "Allow service role full access on entitlements"   ON public.entitlements;
DROP POLICY IF EXISTS "Allow service role full access on usage_events"   ON public.usage_events;
DROP POLICY IF EXISTS "Allow service role full access on auth_codes"     ON public.auth_codes;
DROP POLICY IF EXISTS "Allow service role full access on refresh_tokens" ON public.refresh_tokens;

-- 2 ─ Enable RLS on EVERY table in `public`, not just the six.
--
--     The other eleven (waitlist, reports, surveys, downloads, tasks, roles,
--     activity_logs, attachments, task_comments, task_attachments, sessions) were
--     created outside these migrations and their RLS state is unknown. A table
--     created without RLS is open to anon by default, so enumerating the schema is
--     the only way to be sure — and it means a table added tomorrow is covered by
--     re-running this rather than by remembering.
--
--     With RLS on and no policy present, every non-BYPASSRLS role is denied. That
--     is the intended end state.
DO $$
DECLARE t record;
BEGIN
    FOR t IN
        SELECT c.relname
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.relname);
    END LOOP;
END $$;

-- 3 ─ Revoke table privileges from the public-facing roles.
--
--     Defence in depth: RLS and GRANTs are independent gates, and this one keeps
--     holding if a permissive policy is ever added by mistake. Nothing legitimate
--     loses access — no browser code and no route uses these roles.
REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- 4 ─ Close the same hole for tables created later. Without this, the next
--     `CREATE TABLE` re-grants to anon under Supabase's default privileges and
--     quietly undoes step 3 for that table.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES    FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFY — run this after the transaction commits.
--
-- Expect: `rls_enabled` true for every row, `policies_open_to_anon` 0 everywhere.
-- Any non-zero count is a policy reachable by an anonymous caller and must be
-- read before it is trusted.
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    COUNT(p.polname) FILTER (
        WHERE p.polroles = '{0}'::oid[]                    -- TO PUBLIC
           OR 'anon' = ANY (SELECT rolname FROM pg_roles WHERE oid = ANY (p.polroles))
    ) AS policies_open_to_anon,
    COUNT(p.polname) AS policies_total,
    has_table_privilege('anon', c.oid, 'SELECT') AS anon_has_select_grant
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE n.nspname = 'public' AND c.relkind = 'r'
GROUP BY c.relname, c.relrowsecurity, c.oid
ORDER BY policies_open_to_anon DESC, c.relname;
