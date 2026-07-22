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
