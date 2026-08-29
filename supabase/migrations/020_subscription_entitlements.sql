-- 020_subscription_entitlements.sql
-- Written for founder review. NOT applied — same convention as 018/019.
--
-- Backs the reasoning-subscription tiers approved 2026-08-29 (Creator ₹599,
-- Pro ₹1,499). Two things are needed that do not exist yet:
--
--   1. Somewhere to record WHICH Razorpay subscription a user holds, so the
--      webhook can tell an activation from a renewal from a cancellation, and
--      so support can answer "what is this person paying for".
--   2. An idempotent way to grant a cycle's INCLUDED credits.
--
-- WHY INCLUDED CREDITS NEED THEIR OWN FUNCTION, rather than reusing
-- `grant_purchased_credits`: they are economically different money.
--   • Purchased credits (packs) go to `purchased_balance`, never expire, and
--     are ADDED to whatever is already there — the user paid cash for them.
--   • Included credits are a monthly allowance. They go to `granted_balance`,
--     do NOT roll over, and are therefore SET, not added: a Creator who used
--     40 of last month's 300 must start the new cycle at 300, not 560.
-- Using the purchase function for both would quietly turn a non-rolling
-- allowance into a permanent, accumulating, non-expiring balance.

-- ── 1. Subscription record ──────────────────────────────────────────────
--
-- One row per user. A user can only hold one Vichith subscription at a time,
-- so `user_id` is the primary key rather than a separate id — an upgrade
-- REPLACES the row rather than creating a second, concurrent entitlement.

CREATE TABLE IF NOT EXISTS public.subscriptions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Razorpay's own subscription id (`sub_...`). The idempotency anchor for
    -- every lifecycle webhook about this subscription.
    razorpay_subscription_id TEXT NOT NULL UNIQUE,
    -- Vichith's own tier name ('creator' | 'pro'), not Razorpay's plan id —
    -- so a re-created Razorpay plan does not orphan existing subscribers.
    plan_id TEXT NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
    -- Mirrors Razorpay's own subscription states. 'active' is the only one
    -- that should grant entitlement; everything else falls back to free.
    status TEXT NOT NULL CHECK (status IN ('created', 'active', 'halted', 'cancelled', 'completed', 'expired')),
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service-role only, exactly like `wallets` and `credit_transactions`
-- (Migration 004's rule). The client reads its plan through /api/usage, never
-- by querying this table — a client that can read its own subscription row
-- can also try to write one.
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ── 2. Idempotent per-cycle credit grant ────────────────────────────────
--
-- `p_reference_id` is the Razorpay PAYMENT id for this cycle's charge, which
-- is unique per billing cycle. That is what makes a redelivered
-- `subscription.charged` webhook a no-op instead of a second month's credits.
-- Same unique-constraint mechanism the pack purchase path already relies on
-- (`010_purchases.sql`'s partial index), extended to cover this new reason.

DROP INDEX IF EXISTS unique_purchase_event;
CREATE UNIQUE INDEX IF NOT EXISTS unique_purchase_event
    ON credit_transactions (reference_id, reason)
    WHERE reason IN ('purchase', 'refund_purchase', 'plan_credits');

CREATE OR REPLACE FUNCTION grant_plan_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_reference_id TEXT
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO credit_transactions (user_id, amount, reason, reference_id, status)
    VALUES (p_user_id, p_amount, 'plan_credits', p_reference_id, 'completed')
    ON CONFLICT (reference_id, reason)
        WHERE reason IN ('purchase', 'refund_purchase', 'plan_credits') DO NOTHING;

    IF FOUND THEN
        -- SET, not add — see this file's header on why included credits are
        -- an allowance rather than a balance. `purchased_balance` is
        -- deliberately untouched: money the user paid cash for must survive
        -- every renewal, and must never be reset by one.
        UPDATE wallets SET granted_balance = p_amount, updated_at = NOW() WHERE user_id = p_user_id;
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$;

-- ── 3. Entitlement transition ───────────────────────────────────────────
--
-- Sets the tier the reasoning gate reads (`entitlements.plan`, consumed by
-- quota.ts's checkQuota) and records the subscription in one transaction, so
-- the two can never disagree about what a user is paying for.
--
-- NOTE the deliberate asymmetry with credits: DOWNGRADING a plan does not
-- claw back credits already granted for the current cycle. They were part of
-- what the customer paid for; taking them back on cancellation would be
-- charging for a month and then removing it.

CREATE OR REPLACE FUNCTION apply_subscription_state(
    p_user_id UUID,
    p_razorpay_subscription_id TEXT,
    p_plan_id TEXT,
    p_billing_cycle TEXT,
    p_status TEXT,
    p_entitlement_plan TEXT,
    p_period_end TIMESTAMPTZ
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO subscriptions (
        user_id, razorpay_subscription_id, plan_id, billing_cycle, status, current_period_end, updated_at
    )
    VALUES (
        p_user_id, p_razorpay_subscription_id, p_plan_id, p_billing_cycle, p_status, p_period_end, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        razorpay_subscription_id = EXCLUDED.razorpay_subscription_id,
        plan_id = EXCLUDED.plan_id,
        billing_cycle = EXCLUDED.billing_cycle,
        status = EXCLUDED.status,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW();

    UPDATE entitlements SET plan = p_entitlement_plan, updated_at = NOW() WHERE user_id = p_user_id;
END;
$$;
