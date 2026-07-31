-- 005_rate_limits.sql
--
-- S-5 (remainder) · Per-IP throttling for the unauthenticated endpoints.
--
-- S-5 fixed the input validation on `/api/waitlist`, `/api/report`, `/api/survey`
-- and `/api/download` and noted that "a per-IP throttle is still worth adding".
-- This is that. Those four endpoints accept anonymous writes, and validation
-- bounds how big each write is without bounding how many there are — a script can
-- still fill the waitlist table, or upload attachment after valid attachment until
-- the storage bill notices.
--
-- WHY A TABLE AND NOT AN IN-MEMORY COUNTER
-- The same reason `src/lib/ai/quota.ts` is database-backed: this runs on
-- serverless, where each invocation may be a fresh instance. An in-memory counter
-- resets constantly and enforces nothing — the classic limiter that works in
-- development and protects nothing in production.
--
-- WHY NOT COUNT THE DESTINATION TABLES INSTEAD
-- `quota.ts` counts rows in `usage_events`, which is elegant because the write it
-- limits is the row it counts. That does not work here: these tables do not record
-- the caller's IP, adding it would put personal data in the business tables
-- permanently, and `/api/download` and a rejected `/api/report` write no row at all
-- while still costing work. A dedicated table keeps the IP out of the business
-- data and expires it.
--
-- RETENTION
-- Rows older than the widest window are useless. `cleanup_rate_limits()` deletes
-- them; the limiter also opportunistically prunes, so this works without a cron.
-- An IP is personal data under GDPR, so short retention is a requirement, not
-- housekeeping.
--
-- Depends on 004 having run: RLS is enabled below, and no policy is created, which
-- means only the service role can touch this.

BEGIN;

CREATE TABLE IF NOT EXISTS public.rate_limits (
    id          BIGSERIAL PRIMARY KEY,
    -- Hashed, never raw. The limiter only ever needs to know whether two requests
    -- came from the same place, and a hash answers that without this table
    -- becoming a log of who visited the site.
    ip_hash     TEXT        NOT NULL,
    -- Which endpoint, so a waitlist signup does not consume a download's budget.
    bucket      TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The limiter's only query is "count rows for this hash and bucket since T", so
-- the index carries all three columns in that order.
CREATE INDEX IF NOT EXISTS rate_limits_lookup
    ON public.rate_limits (ip_hash, bucket, created_at DESC);

-- Separate index for the sweep, which filters on age alone.
CREATE INDEX IF NOT EXISTS rate_limits_created_at
    ON public.rate_limits (created_at);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No policy, deliberately. Only the service role (BYPASSRLS) may read or write it.
REVOKE ALL ON public.rate_limits FROM anon, authenticated;

/**
 * Delete throttle records older than one day.
 *
 * One day is comfortably wider than the longest window any bucket uses, so nothing
 * still in force is ever removed.
 */
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    DELETE FROM public.rate_limits WHERE created_at < now() - INTERVAL '1 day';
$$;

REVOKE ALL ON FUNCTION public.cleanup_rate_limits() FROM PUBLIC, anon, authenticated;

COMMIT;
