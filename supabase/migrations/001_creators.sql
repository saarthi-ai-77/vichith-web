-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Creators table (extends Supabase auth.users)
create table public.creators (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  display_name    text,
  avatar_url      text,
  bio             text,
  location        text,
  website         text,
  verified        boolean default false,
  auth_provider   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Username format constraint
alter table public.creators
  add constraint username_format 
  check (username ~ '^[a-zA-Z0-9_]{3,30}$');

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger creators_updated_at
  before update on public.creators
  for each row execute function update_updated_at();

-- RLS
alter table public.creators enable row level security;

-- Anyone can read public profiles
create policy "Public profiles are viewable by everyone"
  on public.creators for select
  using (true);

-- Creators can only update their own profile
create policy "Creators can update own profile"
  on public.creators for update
  using (auth.uid() = id);

-- Insert only via server-side (service role) on signup
create policy "Service role can insert creators"
  on public.creators for insert
  with check (auth.uid() = id);
