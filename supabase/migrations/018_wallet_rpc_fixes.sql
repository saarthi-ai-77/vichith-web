-- 018_wallet_rpc_fixes.sql
-- Written for founder review. NOT applied — per this repo's own established
-- convention (every wallet/credit migration in this codebase's history has
-- been founder-run, never agent-applied; see VICHITH_HARNESS_AUDIT.md and
-- Documentation/00_Project/AGENT_2_BRIEF_REASONING_VS_CREDITS.md §4).
--
-- Fixes two real, evidence-traced bugs found during the harness/billing
-- audit. Neither is a new feature — both restore the ledger's own stated
-- invariant ("never silently modify a number without recording the
-- rationale", CREDIT_ECONOMICS.md) against cases the original functions
-- didn't handle correctly.
--
-- WHAT THIS DOES NOT TOUCH: `renew_granted_credits` — called unconditionally
-- by `reserveCredits()` in quota.ts on every reservation, but its definition
-- exists ONLY in the live database, not anywhere in this repository (an
-- exhaustive grep across every .sql/.md/.ts file in the workspace found zero
-- matches). Per this migration's own "do not invent SQL behavior" rule, its
-- current definition must be pulled from the live database before it can be
-- reviewed or corrected, not guessed. To retrieve it, run this in the
-- Supabase SQL editor and paste the result back:
--
--   SELECT pg_get_functiondef('renew_granted_credits'::regproc);
--
-- Once that's in hand, committing it to version control (verbatim, or with a
-- reviewed fix if one is needed) is a THIRD, separate migration — deliberately
-- not bundled here, since this file's two fixes are both already fully
-- verified against the exact SQL currently committed in 016_split_meters.sql
-- and 010_purchases.sql, and bundling an unverified function with two
-- verified ones would make this file only as trustworthy as its weakest part.

-- ─────────────────────────────────────────────────────────────────────────
-- FIX 1 — settle_credits: refund a partial/unused reservation back to the
-- SAME bucket(s) it was drawn from, proportionally, instead of always to
-- granted_balance.
--
-- THE BUG (traced against 016_split_meters.sql:72-81, that file's own
-- comment: "simplest fallback for refunds ... returning to granted is
-- safer"). `reserve_credits` burns granted_balance first, then
-- purchased_balance for the remainder (016_split_meters.sql:32-42). If a
-- reservation was funded partly or fully from purchased_balance and the job
-- costs less than reserved, the unused portion was refunded ENTIRELY to
-- granted_balance — silently converting money the user actually paid for
-- (never-expiring) into a monthly-reset grant. Every over-estimated
-- reservation against a purchased-funded balance is a small, repeated leak
-- of "never expires" into "expires next month".
--
-- THE FIX. `reserve_credits` already inserts a `reservation` row recording
-- only the total amount reserved, not which bucket(s) it came from — so this
-- fix adds two new columns to `credit_transactions` to record that split at
-- reservation time, then `settle_credits` refunds proportionally from what
-- IT actually recorded, not a policy guess.

ALTER TABLE public.credit_transactions
    ADD COLUMN IF NOT EXISTS reserved_from_granted INTEGER,
    ADD COLUMN IF NOT EXISTS reserved_from_purchased INTEGER;

CREATE OR REPLACE FUNCTION reserve_credits(p_user_id UUID, p_amount INTEGER, p_job_id TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_granted INTEGER;
    v_purchased INTEGER;
    v_reservation_id UUID;
    v_from_granted INTEGER;
    v_from_purchased INTEGER;
BEGIN
    SELECT granted_balance, purchased_balance INTO v_granted, v_purchased
    FROM wallets WHERE user_id = p_user_id FOR UPDATE;

    IF v_granted IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'database_error', 'message', 'Wallet not found.');
    END IF;

    IF (v_granted + v_purchased) < p_amount THEN
        RETURN json_build_object('success', false, 'error', 'insufficient_balance', 'message', 'Insufficient balance.');
    END IF;

    -- Burn granted first, then purchased — UNCHANGED from the existing rule.
    -- The only change is recording the split so settlement can honour it.
    IF v_granted >= p_amount THEN
        v_from_granted := p_amount;
        v_from_purchased := 0;
        UPDATE wallets SET granted_balance = granted_balance - p_amount, updated_at = NOW() WHERE user_id = p_user_id;
    ELSE
        v_from_granted := v_granted;
        v_from_purchased := p_amount - v_granted;
        UPDATE wallets
        SET
            granted_balance = 0,
            purchased_balance = purchased_balance - v_from_purchased,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;

    INSERT INTO credit_transactions (user_id, amount, reason, reference_id, status, reserved_from_granted, reserved_from_purchased)
    VALUES (p_user_id, -p_amount, 'reservation', p_job_id, 'reserved', v_from_granted, v_from_purchased)
    RETURNING id INTO v_reservation_id;

    RETURN json_build_object('success', true, 'reservation_id', v_reservation_id);
END;
$$;

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
    v_from_granted INTEGER;
    v_from_purchased INTEGER;
    v_refund_to_granted INTEGER;
    v_refund_to_purchased INTEGER;
BEGIN
    SELECT user_id, amount, status, reserved_from_granted, reserved_from_purchased
    INTO v_user_id, v_reserved_amount, v_status, v_from_granted, v_from_purchased
    FROM credit_transactions
    WHERE id = p_reservation_id FOR UPDATE;

    IF v_status != 'reserved' THEN
        RETURN;
    END IF;

    v_refund := (-v_reserved_amount) - p_actual_amount;

    IF v_refund > 0 THEN
        -- PROPORTIONAL REFUND (the fix): split the refund across the same
        -- buckets it was drawn from, in the same ratio. A reservation funded
        -- entirely from purchased_balance refunds entirely to
        -- purchased_balance; a mixed reservation refunds in the same mix it
        -- was drawn in. Old rows from before this migration have NULL split
        -- columns — COALESCE falls back to the prior "all to granted"
        -- behavior for those specifically, never for a new reservation.
        IF v_from_granted IS NULL AND v_from_purchased IS NULL THEN
            v_refund_to_granted := v_refund;
            v_refund_to_purchased := 0;
        ELSE
            v_refund_to_purchased := FLOOR(v_refund * COALESCE(v_from_purchased, 0)::NUMERIC / GREATEST(1, -v_reserved_amount));
            v_refund_to_granted := v_refund - v_refund_to_purchased;
        END IF;

        UPDATE wallets
        SET
            granted_balance = granted_balance + v_refund_to_granted,
            purchased_balance = purchased_balance + v_refund_to_purchased,
            updated_at = NOW()
        WHERE user_id = v_user_id;

        INSERT INTO credit_transactions (user_id, amount, reason, reference_id, status)
        VALUES (v_user_id, v_refund, 'refund_unused', p_reservation_id::TEXT, 'refunded');
    ELSIF v_refund < 0 THEN
        -- Overspend — UNCHANGED from the existing rule.
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

-- ─────────────────────────────────────────────────────────────────────────
-- FIX 2 — grant_purchased_credits / reverse_purchased_credits: correct the
-- column reference for the post-016 schema, and record the ACTUAL (clamped)
-- amount reversed, not the requested amount.
--
-- THE BUG (traced against 010_purchases.sql:12-55). Both functions still
-- write to `wallets.balance` — a column `016_split_meters.sql` renamed to
-- `granted_balance` and added `purchased_balance` alongside. The COMMITTED
-- version of these functions would fail outright against the live schema
-- ("column balance does not exist"); since real purchases ARE being
-- credited in production today, the live functions were hand-patched
-- directly in Supabase at some point and that patch was never brought back
-- into git — this migration is that reconciliation, not a new behavior.
--
-- SEPARATELY, `reverse_purchased_credits`'s clamp (`GREATEST(0, balance -
-- p_amount)`, needed so a refund can never drive a balance negative when the
-- credits were already spent) previously recorded `-p_amount` — the FULL
-- requested reversal — in the ledger row, even when the clamp silently
-- reversed less. The ledger and the real balance could disagree. This fix
-- records the ACTUAL amount removed from the wallet, so the ledger stays
-- literally true to what happened, and a refund that couldn't be fully
-- honoured (because the credits were already spent) is now a
-- programmatically detectable case (`actual reversed < requested`) instead
-- of an invisible one — surfacing it to a support/reconciliation view is a
-- follow-up, not part of this fix.

CREATE OR REPLACE FUNCTION grant_purchased_credits(p_user_id UUID, p_amount INTEGER, p_reference_id TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO credit_transactions (user_id, amount, reason, reference_id, status)
    VALUES (p_user_id, p_amount, 'purchase', p_reference_id, 'completed')
    ON CONFLICT (reference_id, reason) WHERE reason IN ('purchase', 'refund_purchase') DO NOTHING;

    IF FOUND THEN
        UPDATE wallets SET purchased_balance = purchased_balance + p_amount, updated_at = NOW() WHERE user_id = p_user_id;
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION reverse_purchased_credits(p_user_id UUID, p_amount INTEGER, p_reference_id TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_purchased INTEGER;
    v_actual_reversed INTEGER;
BEGIN
    SELECT purchased_balance INTO v_current_purchased FROM wallets WHERE user_id = p_user_id FOR UPDATE;
    v_actual_reversed := LEAST(COALESCE(v_current_purchased, 0), p_amount);

    -- The idempotency check still guards against a duplicate refund event
    -- being processed twice — unchanged. Only the AMOUNT recorded changes.
    INSERT INTO credit_transactions (user_id, amount, reason, reference_id, status)
    VALUES (p_user_id, -v_actual_reversed, 'refund_purchase', p_reference_id, 'refunded')
    ON CONFLICT (reference_id, reason) WHERE reason IN ('purchase', 'refund_purchase') DO NOTHING;

    IF FOUND THEN
        UPDATE wallets SET purchased_balance = GREATEST(0, purchased_balance - p_amount), updated_at = NOW() WHERE user_id = p_user_id;
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$;
