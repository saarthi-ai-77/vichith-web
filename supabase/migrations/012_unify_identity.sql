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
