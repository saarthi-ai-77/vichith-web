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
