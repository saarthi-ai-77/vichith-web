-- 019_renew_granted_credits_guard.sql
-- APPLIED to production. Confirmed by the founder 2026-08-31.
--
-- The header below said "NOT applied" for longer than it was true, and that
-- claim was repeated downstream in MASTER_CONTEXT and in a later audit as a
-- live bug. A migration file is a poor place to track application status —
-- it cannot know — so treat this line as a note, and the database as the
-- authority.
--
-- CRITICAL, LIVE BUG. Retrieved from production via
-- `SELECT pg_get_functiondef('renew_granted_credits'::regproc);` (2026-08-29,
-- after 018 was applied) — this function was never in version control before
-- now, so this is the first time its real body has been reviewable at all.
--
-- THE BUG. The live function has NO date/time guard:
--
--   UPDATE public.wallets SET granted_balance = 100 WHERE user_id = p_user_id;
--   UPDATE public.entitlements SET renews_at = renews_at + interval '1 month' WHERE user_id = p_user_id;
--
-- `quota.ts`'s `reserveCredits()` calls this RPC UNCONDITIONALLY on every
-- reservation — not just monthly. With no guard, every single generation
-- request resets `granted_balance` to 100 and pushes `renews_at` a month
-- further out, regardless of whether a renewal was actually due. A user who
-- has spent their granted balance down to 20 and makes another request has
-- their balance reset to 100 BEFORE that reservation is taken.
--
-- Net effect: the granted-credit bucket is effectively unlimited for any
-- user who keeps making requests, and `renews_at` never functions as a real
-- monthly boundary — it is continuously pushed into the future by ordinary
-- use. `quota.ts`'s own comment at the call site says this should be "lazily
-- renew monthly credits if past due" — the guard that sentence describes was
-- never actually implemented in this function.
--
-- THE FIX. Read `renews_at` first (row-locked, matching the other RPCs'
-- concurrency pattern) and do nothing at all unless it has genuinely passed.
-- A NULL `renews_at` (a row predating `grantSignupCreditsIdempotent`'s
-- initialization, if any still exist) is treated as "not due" rather than
-- "immediately due" — conservative: it under-grants a stale row instead of
-- also renewing unconditionally for it, and self-corrects the moment
-- `renews_at` is ever set by anything else.
--
-- NOT addressed here, deliberately: a user inactive for several months only
-- catches up one month per call (a subsequent call, still finding `renews_at`
-- in the past, renews again). This does not lose or fabricate money — each
-- catch-up call still just resets to the same 100 — so it is left as a minor,
-- self-correcting behavior rather than adding month-counting complexity to a
-- fix that is otherwise a single missing guard.

CREATE OR REPLACE FUNCTION renew_granted_credits(p_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_renews_at TIMESTAMPTZ;
BEGIN
    SELECT renews_at INTO v_renews_at FROM entitlements WHERE user_id = p_user_id FOR UPDATE;

    -- Not due yet (or no renewal date on record) — do nothing. This is the
    -- guard that was missing: every prior call, from every reservation,
    -- fell through to the unconditional reset below regardless of this check.
    IF v_renews_at IS NULL OR NOW() < v_renews_at THEN
        RETURN false;
    END IF;

    UPDATE wallets SET granted_balance = 100, updated_at = NOW() WHERE user_id = p_user_id;
    UPDATE entitlements SET renews_at = renews_at + interval '1 month' WHERE user_id = p_user_id;

    RETURN true;
END;
$$;
