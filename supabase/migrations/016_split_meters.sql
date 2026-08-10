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
