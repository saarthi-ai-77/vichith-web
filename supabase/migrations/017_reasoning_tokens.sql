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
