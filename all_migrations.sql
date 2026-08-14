-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Creators table (extends Supabase auth.users)
create table public.creators (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  display_name    text,
  avatar_url      text,
  bio             text,
  location        text,
  website         text,
  verified        boolean default false,
  auth_provider   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Username format constraint
alter table public.creators
  add constraint username_format 
  check (username ~ '^[a-zA-Z0-9_]{3,30}$');

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger creators_updated_at
  before update on public.creators
  for each row execute function update_updated_at();

-- RLS
alter table public.creators enable row level security;

-- Anyone can read public profiles
create policy "Public profiles are viewable by everyone"
  on public.creators for select
  using (true);

-- Creators can only update their own profile
create policy "Creators can update own profile"
  on public.creators for update
  using (auth.uid() = id);

-- Insert only via server-side (service role) on signup
create policy "Service role can insert creators"
  on public.creators for insert
  with check (auth.uid() = id);
-- Projects table
create table public.projects (
  id              uuid primary key default uuid_generate_v4(),
  creator_id      uuid not null references public.creators(id) 
                    on delete cascade,
  title           text not null,
  slug            text not null,
  description     text,
  cover_url       text,
  tags            text[] default '{}',
  visibility      text not null default 'private'
                    check (visibility in ('public', 'unlisted', 'private')),
  published_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  
  -- VVCS fields (wired now, filled in Phase 3)
  latest_commit_id    uuid,
  commit_count        integer default 0,
  last_committed_at   timestamptz,
  
  unique(creator_id, slug)
);

-- Auto-update updated_at
create trigger projects_updated_at
  before update on public.projects
  for each row execute function update_updated_at();

-- RLS
alter table public.projects enable row level security;

-- Public projects visible to everyone
create policy "Public projects are viewable by everyone"
  on public.projects for select
  using (visibility = 'public');

-- Unlisted projects visible to anyone with the link
create policy "Unlisted projects are viewable by anyone"
  on public.projects for select
  using (visibility = 'unlisted');

-- Private projects visible to creator only
create policy "Private projects visible to creator only"
  on public.projects for select
  using (auth.uid() = creator_id);

-- Creators can insert their own projects
create policy "Creators can insert own projects"
  on public.projects for insert
  with check (auth.uid() = creator_id);

-- Creators can update their own projects
create policy "Creators can update own projects"
  on public.projects for update
  using (auth.uid() = creator_id);

-- Creators can delete their own projects
create policy "Creators can delete own projects"
  on public.projects for delete
  using (auth.uid() = creator_id);

-- Commits table (shell only — VVCS data arrives in Phase 3)
create table public.commits (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.projects(id)
                    on delete cascade,
  creator_id      uuid not null references public.creators(id),
  message         text not null,
  snapshot_url    text,              -- S3/R2 link, filled in Phase 3
  metadata        jsonb default '{}',-- operation counts, duration, etc.
  created_at      timestamptz default now()
);

alter table public.commits enable row level security;

-- Commits visible if parent project is visible
create policy "Commits visible with project"
  on public.commits for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
      and (p.visibility in ('public', 'unlisted')
        or p.creator_id = auth.uid())
    )
  );

-- Only creator can insert commits
create policy "Creator can insert commits"
  on public.commits for insert
  with check (auth.uid() = creator_id);
-- 003_desktop_auth.sql
-- Create users table (if not using auth.users directly)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT true,
  display_name TEXT,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure missing columns exist if users table was created previously
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
    ALTER TABLE public.users ALTER COLUMN username DROP NOT NULL;
  END IF;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  roles TEXT[] DEFAULT ARRAY['user']::TEXT[] NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create entitlements table
CREATE TABLE IF NOT EXISTS public.entitlements (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  plan TEXT DEFAULT 'free' NOT NULL,
  credits_balance INT DEFAULT 0 NOT NULL,
  autonomy_runs_remaining INT DEFAULT 10 NOT NULL,
  renews_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create usage_events table
CREATE TABLE IF NOT EXISTS public.usage_events (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  runtime TEXT DEFAULT 'cloud' NOT NULL,
  provider TEXT,
  model TEXT,
  units INT DEFAULT 1,
  credits_cost INT DEFAULT 0,
  project_id TEXT,
  meta JSONB,
  ts BIGINT NOT NULL, -- Unix timestamp in milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create auth_codes table for PKCE single-use authorization codes
CREATE TABLE IF NOT EXISTS public.auth_codes (
  code TEXT PRIMARY KEY,
  code_challenge TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  expires_at BIGINT NOT NULL, -- Unix timestamp in seconds (≤60s TTL)
  used BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create refresh_tokens table for desktop refresh token rotation
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  token TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  expires_at BIGINT NOT NULL, -- Unix timestamp in seconds
  revoked BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service role full access to tables
CREATE POLICY "Allow service role full access on users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow service role full access on profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow service role full access on entitlements" ON public.entitlements FOR ALL USING (true);
CREATE POLICY "Allow service role full access on usage_events" ON public.usage_events FOR ALL USING (true);
CREATE POLICY "Allow service role full access on auth_codes" ON public.auth_codes FOR ALL USING (true);
CREATE POLICY "Allow service role full access on refresh_tokens" ON public.refresh_tokens FOR ALL USING (true);
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
-- 007_credit_ledger.sql
-- Vichith Studio Credit Ledger (Wallets + Transactions)

CREATE TABLE IF NOT EXISTS wallets (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Protect wallets with RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
-- No policies are created for wallets. Access is strictly service-role-only via the API, 
-- per the founder's decision (Migration 004). The client cannot read this directly.

DO $$
BEGIN
    CREATE TYPE transaction_status AS ENUM ('reserved', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES wallets(user_id),
    amount INTEGER NOT NULL, -- negative for reservation, positive for refund/credit
    reason TEXT NOT NULL,
    reference_id TEXT, -- job ID or request ID
    status transaction_status NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Protect credit_transactions with RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
-- No policies are created for credit_transactions. Access is strictly service-role-only 
-- via the API. The client cannot read this directly.

-- RPC for reserving credits safely
CREATE OR REPLACE FUNCTION reserve_credits(p_user_id UUID, p_amount INTEGER, p_job_id TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance INTEGER;
    v_reservation_id UUID;
BEGIN
    SELECT balance INTO v_balance FROM wallets WHERE user_id = p_user_id FOR UPDATE;
    
    IF v_balance IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'database_error', 'message', 'Wallet not found.');
    END IF;

    IF v_balance < p_amount THEN
        RETURN json_build_object('success', false, 'error', 'insufficient_balance', 'message', 'Insufficient balance.');
    END IF;

    UPDATE wallets SET balance = balance - p_amount, updated_at = NOW() WHERE user_id = p_user_id;
    
    INSERT INTO credit_transactions (user_id, amount, reason, reference_id, status)
    VALUES (p_user_id, -p_amount, 'reservation', p_job_id, 'reserved')
    RETURNING id INTO v_reservation_id;
    
    RETURN json_build_object('success', true, 'reservation_id', v_reservation_id);
END;
$$;

-- RPC for settling a reservation
CREATE OR REPLACE FUNCTION settle_credits(p_reservation_id UUID, p_actual_amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_reserved_amount INTEGER;
    v_user_id UUID;
    v_status transaction_status;
    v_refund INTEGER;
BEGIN
    SELECT user_id, amount, status INTO v_user_id, v_reserved_amount, v_status 
    FROM credit_transactions 
    WHERE id = p_reservation_id FOR UPDATE;
    
    IF v_status != 'reserved' THEN
        RETURN;
    END IF;
    
    v_refund := (-v_reserved_amount) - p_actual_amount;
    
    IF v_refund > 0 THEN
        -- Refund the unused portion
        UPDATE wallets SET balance = balance + v_refund, updated_at = NOW() WHERE user_id = v_user_id;
        
        -- Create a separate refund transaction for the difference.
        INSERT INTO credit_transactions (user_id, amount, reason, reference_id, status)
        VALUES (v_user_id, v_refund, 'refund_unused', p_reservation_id::TEXT, 'refunded');
    ELSIF v_refund < 0 THEN
        -- Overspend: actual amount was greater than reserved amount.
        -- We deduct the difference from the wallet, but clamp at 0 so we don't violate the CHECK(balance >= 0) constraint.
        -- Any overspend beyond the balance is absorbed by us.
        DECLARE
            v_current_balance INTEGER;
            v_debit INTEGER;
        BEGIN
            SELECT balance INTO v_current_balance FROM wallets WHERE user_id = v_user_id FOR UPDATE;
            v_debit := LEAST(v_current_balance, -v_refund); -- v_refund is negative, so -v_refund is the overspend
            
            IF v_debit > 0 THEN
                UPDATE wallets SET balance = balance - v_debit, updated_at = NOW() WHERE user_id = v_user_id;
                
                -- Create a separate transaction for the overspend debit.
                INSERT INTO credit_transactions (user_id, amount, reason, reference_id, status)
                VALUES (v_user_id, -v_debit, 'overspend_debit', p_reservation_id::TEXT, 'completed');
            END IF;
        END;
    END IF;
    
    IF p_actual_amount = 0 THEN
        UPDATE credit_transactions SET status = 'refunded', updated_at = NOW() WHERE id = p_reservation_id;
    ELSE
        UPDATE credit_transactions SET status = 'completed', updated_at = NOW() WHERE id = p_reservation_id;
    END IF;
END;
$$;
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
-- 009_drop_ledger_policies.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Remove two policies that 007 no longer creates.
--
-- WHY THIS EXISTS AT ALL. An earlier draft of 007 created
--
--     "Users can view their own wallet"        ON wallets
--     "Users can view their own transactions"  ON credit_transactions
--
-- and that draft is the copy that was applied to production, before the
-- correction landed in the repository. The corrected 007 simply omits them, which
-- means re-running it cannot remove them — a migration can only drop what it
-- names. Hence this one.
--
-- THE FILES AND THE DATABASE HAD DIVERGED. That is the cost of applying SQL by
-- hand rather than through the migration runner, and it is worth stating plainly
-- because the next person to read `pg_policies` would otherwise find two policies
-- the repository says do not exist.
--
-- THERE IS NO SECURITY HOLE HERE. Both policies are `FOR SELECT USING
-- (auth.uid() = user_id)` — correctly scoped to the caller's own row, not the
-- `USING (true)` shape 008 removed. And `authenticated` holds no grant on either
-- table after 004, so neither policy can fire. They are removed because they are
-- MISLEADING, not because they are dangerous.
--
-- A policy that cannot fire tells the next reader that clients read these tables
-- directly. They do not, and they must not: the ledger is reached through the API
-- with the service role, which bypasses RLS by design. A second read path to the
-- same state via supabase-js would be the parallel-ownership pattern this project
-- keeps paying to remove.
--
-- RLS STAYS ENABLED on both tables. RLS on with no policy denies every
-- non-BYPASSRLS role, which is the intended end state and matches 004 §2 and 008.
--
-- SAFE TO RE-RUN. `DROP POLICY IF EXISTS` is idempotent, and safe even on a
-- database where the corrected 007 was applied and these never existed.

DROP POLICY IF EXISTS "Users can view their own wallet"       ON public.wallets;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.credit_transactions;

-- ── Verification ─────────────────────────────────────────────────────────────
--
-- Expect ZERO rows for both tables:
--
--   SELECT tablename, policyname FROM pg_policies
--   WHERE schemaname = 'public' AND tablename IN ('wallets','credit_transactions');
--
-- And confirm RLS is still ON for both — this migration must not turn it off:
--
--   SELECT relname, relrowsecurity FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'public' AND relname IN ('wallets','credit_transactions');
-- 010_purchases.sql
-- Adds idempotency constraint for purchases and refund reversals.

-- We enforce that a given reference_id (like a Razorpay event ID) 
-- can only be used once for a specific reason (like 'purchase' or 'refund_purchase').
-- We use a partial index so that legitimate repeating events (like multiple 'reservation'
-- entries for the same multi-turn jobId) are not constrained.
CREATE UNIQUE INDEX IF NOT EXISTS unique_purchase_event ON credit_transactions (reference_id, reason) 
WHERE reason IN ('purchase', 'refund_purchase');

-- RPC for granting purchased credits idempotently
CREATE OR REPLACE FUNCTION grant_purchased_credits(p_user_id UUID, p_amount INTEGER, p_reference_id TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Attempt to insert the transaction. 
    -- If it violates the unique constraint, the payment webhook was already processed.
    INSERT INTO credit_transactions (user_id, amount, reason, reference_id, status)
    VALUES (p_user_id, p_amount, 'purchase', p_reference_id, 'completed')
    ON CONFLICT (reference_id, reason) WHERE reason IN ('purchase', 'refund_purchase') DO NOTHING;

    IF FOUND THEN
        -- Add to wallet
        UPDATE wallets SET balance = balance + p_amount, updated_at = NOW() WHERE user_id = p_user_id;
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$;

-- RPC for refunding purchased credits idempotently
CREATE OR REPLACE FUNCTION reverse_purchased_credits(p_user_id UUID, p_amount INTEGER, p_reference_id TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Note: p_amount should be positive (the amount to subtract from the wallet).
    -- We insert it as a negative amount in the transaction log.
    INSERT INTO credit_transactions (user_id, amount, reason, reference_id, status)
    VALUES (p_user_id, -p_amount, 'refund_purchase', p_reference_id, 'refunded')
    ON CONFLICT (reference_id, reason) WHERE reason IN ('purchase', 'refund_purchase') DO NOTHING;

    IF FOUND THEN
        -- We deduct from wallet. We clamp at 0 so it doesn't violate CHECK(balance >= 0) if they already spent it.
        UPDATE wallets SET balance = GREATEST(0, balance - p_amount), updated_at = NOW() WHERE user_id = p_user_id;
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$;
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
-- 011_storage_generations.sql
-- Create the generations bucket for generated images and video.

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'generations',
  'generations',
  false, -- private bucket, users must authenticate
  false,
  104857600, -- 100MB limit for generated video files
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm']
) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'generations' bucket

-- 1. Service role has full access (insert/update/delete)
CREATE POLICY "Service role has full access to generations"
ON storage.objects FOR ALL TO service_role
USING (bucket_id = 'generations');

-- 2. Authenticated users can read their own generations
-- We assume the object path follows the pattern: userId/...
-- E.g. 123e4567-e89b-12d3-a456-426614174000/job-abc.mp4
CREATE POLICY "Users can read their own generations"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'generations' AND 
  (auth.uid())::text = (string_to_array(name, '/'))[1]
);
-- 012_unify_identity.sql
-- Unify Identity onto Supabase Auth

-- Drop the foreign key from wallets to auth.users.
-- This trades a referential-integrity guarantee for the ability to unblock the credit system
-- for legacy users immediately, without needing to move public.users.id (which would trigger
-- dangerous ON DELETE CASCADE updates across 5 tables).
--
-- TO RESTORE: Once every user is a Supabase user, and we drop the legacy path entirely, 
-- we can re-add `FOREIGN KEY (user_id) REFERENCES auth.users(id)`.
ALTER TABLE public.wallets DROP CONSTRAINT IF EXISTS wallets_user_id_fkey;

-- Add a mapping column to link legacy accounts to new Supabase Auth accounts.
-- NO ID EVER CHANGES. 
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- Create a trigger function to automatically map users when they sign up on Supabase Auth.
-- This ensures that when a legacy user creates an account on app.vichith.in, 
-- their new auth.users row is automatically mapped to their legacy public.users row.
CREATE OR REPLACE FUNCTION public.link_migrated_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If a legacy user exists with the same email, link them
  UPDATE public.users 
  SET auth_user_id = NEW.id 
  WHERE email = NEW.email AND auth_user_id IS NULL;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_link_legacy ON auth.users;
CREATE TRIGGER on_auth_user_created_link_legacy
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.link_migrated_user();
-- 013_migrate_historical_rows.sql
-- Update the trigger to automatically create proxy rows in public.users
-- so that new auth.users IDs can be used in usage_events and entitlements.

CREATE OR REPLACE FUNCTION link_legacy_user_on_signup()
RETURNS TRIGGER AS $$
DECLARE
    v_legacy_id UUID;
BEGIN
    -- 1. Link the legacy user if they exist
    UPDATE public.users 
    SET auth_user_id = NEW.id
    WHERE email = NEW.email 
      AND auth_user_id IS NULL
    RETURNING id INTO v_legacy_id;

    -- 2. Create the proxy row with the new auth.users.id
    -- This ensures that the new Supabase user can immediately hold usage_events
    -- and entitlements, because those tables FK to public.users(id).
    -- We use an unusable password hash.
    INSERT INTO public.users (id, email, email_verified, display_name, password_hash, auth_user_id)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        '*supabaserow*', 
        NEW.id
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
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
-- 016_split_meters.sql
-- Split wallet balance into granted (resets monthly) and purchased (never expires)

-- 1. Rename existing balance to granted_balance
ALTER TABLE public.wallets RENAME COLUMN balance TO granted_balance;

-- 2. Add purchased_balance
ALTER TABLE public.wallets ADD COLUMN purchased_balance INTEGER NOT NULL DEFAULT 0 CHECK (purchased_balance >= 0);

-- 3. Replace reserve_credits RPC
CREATE OR REPLACE FUNCTION reserve_credits(p_user_id UUID, p_amount INTEGER, p_job_id TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_granted INTEGER;
    v_purchased INTEGER;
    v_reservation_id UUID;
BEGIN
    SELECT granted_balance, purchased_balance INTO v_granted, v_purchased 
    FROM wallets WHERE user_id = p_user_id FOR UPDATE;
    
    IF v_granted IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'database_error', 'message', 'Wallet not found.');
    END IF;

    IF (v_granted + v_purchased) < p_amount THEN
        RETURN json_build_object('success', false, 'error', 'insufficient_balance', 'message', 'Insufficient balance.');
    END IF;

    -- Burn granted first, then purchased
    IF v_granted >= p_amount THEN
        UPDATE wallets SET granted_balance = granted_balance - p_amount, updated_at = NOW() WHERE user_id = p_user_id;
    ELSE
        UPDATE wallets 
        SET 
            granted_balance = 0, 
            purchased_balance = purchased_balance - (p_amount - v_granted), 
            updated_at = NOW() 
        WHERE user_id = p_user_id;
    END IF;
    
    INSERT INTO credit_transactions (user_id, amount, reason, reference_id, status)
    VALUES (p_user_id, -p_amount, 'reservation', p_job_id, 'reserved')
    RETURNING id INTO v_reservation_id;
    
    RETURN json_build_object('success', true, 'reservation_id', v_reservation_id);
END;
$$;

-- 4. Replace settle_credits RPC
CREATE OR REPLACE FUNCTION settle_credits(p_reservation_id UUID, p_actual_amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_reserved_amount INTEGER;
    v_user_id UUID;
    v_status transaction_status;
    v_refund INTEGER;
BEGIN
    SELECT user_id, amount, status INTO v_user_id, v_reserved_amount, v_status 
    FROM credit_transactions 
    WHERE id = p_reservation_id FOR UPDATE;
    
    IF v_status != 'reserved' THEN
        RETURN;
    END IF;
    
    v_refund := (-v_reserved_amount) - p_actual_amount;
    
    IF v_refund > 0 THEN
        -- Refund the unused portion back to granted_balance (simplest fallback for refunds)
        -- To be perfectly accurate we'd track which balance it came from, but for unused reservations
        -- returning to granted is safer.
        UPDATE wallets SET granted_balance = granted_balance + v_refund, updated_at = NOW() WHERE user_id = v_user_id;
        
        INSERT INTO credit_transactions (user_id, amount, reason, reference_id, status)
        VALUES (v_user_id, v_refund, 'refund_unused', p_reservation_id::TEXT, 'refunded');
    ELSIF v_refund < 0 THEN
        -- Overspend
        DECLARE
            v_granted INTEGER;
            v_purchased INTEGER;
            v_debit INTEGER;
        BEGIN
            SELECT granted_balance, purchased_balance INTO v_granted, v_purchased FROM wallets WHERE user_id = v_user_id FOR UPDATE;
            v_debit := LEAST(v_granted + v_purchased, -v_refund); 
            
            IF v_debit > 0 THEN
                IF v_granted >= v_debit THEN
                    UPDATE wallets SET granted_balance = granted_balance - v_debit, updated_at = NOW() WHERE user_id = v_user_id;
                ELSE
                    UPDATE wallets 
                    SET 
                        granted_balance = 0, 
                        purchased_balance = purchased_balance - (v_debit - v_granted), 
                        updated_at = NOW() 
                    WHERE user_id = v_user_id;
                END IF;
                
                INSERT INTO credit_transactions (user_id, amount, reason, reference_id, status)
                VALUES (v_user_id, -v_debit, 'overspend_debit', p_reservation_id::TEXT, 'completed');
            END IF;
        END;
    END IF;
    
    IF p_actual_amount = 0 THEN
        UPDATE credit_transactions SET status = 'refunded', updated_at = NOW() WHERE id = p_reservation_id;
    ELSE
        UPDATE credit_transactions SET status = 'completed', updated_at = NOW() WHERE id = p_reservation_id;
    END IF;
END;
$$;
-- 017_reasoning_tokens.sql
-- Replaces daily reasoning calls with exact token metering.

ALTER TABLE entitlements
ADD COLUMN reasoning_tokens_used_today BIGINT NOT NULL DEFAULT 0,
ADD COLUMN reasoning_reset_at TIMESTAMPTZ;

-- We also need a safe way to atomically add to tokens and handle resets.

CREATE OR REPLACE FUNCTION add_reasoning_tokens(
    p_user_id UUID,
    p_tokens BIGINT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_reset_at TIMESTAMPTZ;
    v_next_reset TIMESTAMPTZ;
BEGIN
    SELECT reasoning_reset_at INTO v_reset_at
    FROM entitlements
    WHERE user_id = p_user_id;

    -- Next reset is Midnight IST (UTC+5:30) of the next day.
    -- We can approximate or just use UTC midnight for simplicity, but user specifically asked for IST.
    -- PostgreSQL AT TIME ZONE handles this well.
    v_next_reset := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata' + INTERVAL '1 day')::DATE AT TIME ZONE 'Asia/Kolkata';

    IF v_reset_at IS NULL OR CURRENT_TIMESTAMP >= v_reset_at THEN
        UPDATE entitlements
        SET reasoning_tokens_used_today = p_tokens,
            reasoning_reset_at = v_next_reset
        WHERE user_id = p_user_id;
    ELSE
        UPDATE entitlements
        SET reasoning_tokens_used_today = reasoning_tokens_used_today + p_tokens
        WHERE user_id = p_user_id;
    END IF;
END;
$$;
