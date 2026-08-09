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
