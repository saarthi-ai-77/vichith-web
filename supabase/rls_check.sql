-- Standing RLS audit. Run in Supabase → SQL Editor.
--
-- WHAT THIS CHECK USED TO GET WRONG
--
-- The first version of this file asked only "is RLS enabled, and how many policies
-- are there?" — and by that measure the six tables from 003_desktop_auth.sql looked
-- perfect: RLS on, one policy each. They were in fact wide open to anonymous read
-- AND write, because the policy was `FOR ALL USING (true)` with no `TO` clause,
-- which grants to PUBLIC.
--
-- RLS being ON tells you a gate exists. It tells you nothing about what the gate
-- lets through. So this version reports the thing that actually matters: **can an
-- anonymous caller reach this table**, whether by policy or by grant.
--
-- HOW TO READ THE RESULT
--
--   verdict = 'OPEN TO ANON'  → anyone holding the public anon key can reach it.
--                               That key is served from /api/config, so treat the
--                               table as world-readable. Fix before anything else.
--   verdict = 'RLS OFF'       → no gate at all. Same severity.
--   verdict = 'locked'        → RLS on, no policy an anonymous caller can use, no
--                               grant. This is the expected state for EVERY table:
--                               all access goes through server routes using the
--                               service role, which bypasses RLS.
--
-- After 004_rls_lockdown.sql, every row should read 'locked'.

WITH anon_reachable AS (
    SELECT
        p.polrelid,
        COUNT(*) AS n
    FROM pg_policy p
    WHERE p.polroles = '{0}'::oid[]            -- TO PUBLIC — includes anon
       OR EXISTS (
            SELECT 1 FROM pg_roles r
            WHERE r.oid = ANY (p.polroles) AND r.rolname IN ('anon', 'authenticated')
       )
    GROUP BY p.polrelid
)
SELECT
    c.relname AS table_name,
    CASE
        WHEN NOT c.relrowsecurity THEN 'RLS OFF'
        WHEN COALESCE(a.n, 0) > 0 THEN 'OPEN TO ANON'
        WHEN has_table_privilege('anon', c.oid, 'SELECT')
          OR has_table_privilege('anon', c.oid, 'INSERT')
          OR has_table_privilege('anon', c.oid, 'UPDATE')
          OR has_table_privilege('anon', c.oid, 'DELETE') THEN 'OPEN TO ANON'
        ELSE 'locked'
    END AS verdict,
    c.relrowsecurity AS rls_enabled,
    COALESCE(a.n, 0) AS policies_reachable_by_anon,
    (SELECT COUNT(*) FROM pg_policy p2 WHERE p2.polrelid = c.oid) AS policies_total,
    has_table_privilege('anon', c.oid, 'SELECT') AS anon_select_grant
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN anon_reachable a ON a.polrelid = c.oid
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY
    CASE
        WHEN NOT c.relrowsecurity THEN 0
        WHEN COALESCE(a.n, 0) > 0 THEN 0
        ELSE 1
    END,
    c.relname;
