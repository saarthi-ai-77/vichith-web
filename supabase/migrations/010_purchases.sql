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
