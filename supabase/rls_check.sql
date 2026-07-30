-- Which tables are reachable with the public anon key?
-- Run in Supabase → SQL Editor. Any row with rls_enabled = false is
-- readable/writable by anyone who has the anon key — which is now public.
SELECT
  c.relname               AS table_name,
  c.relrowsecurity        AS rls_enabled,
  COUNT(p.polname)        AS policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE n.nspname = 'public' AND c.relkind = 'r'
GROUP BY c.relname, c.relrowsecurity
ORDER BY c.relrowsecurity ASC, c.relname;
