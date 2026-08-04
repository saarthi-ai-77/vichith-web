-- Projects table
create table public.projects (
  id              uuid primary key default uuid_generate_v4(),
  creator_id      uuid not null references public.creators(id) 
                    on delete cascade,
  title           text not null,
  slug            text not null,
  description     text,
  cover_url       text,
  tags            text[] default '{}',
  visibility      text not null default 'private'
                    check (visibility in ('public', 'unlisted', 'private')),
  published_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  
  -- VVCS fields (wired now, filled in Phase 3)
  latest_commit_id    uuid,
  commit_count        integer default 0,
  last_committed_at   timestamptz,
  
  unique(creator_id, slug)
);

-- Auto-update updated_at
create trigger projects_updated_at
  before update on public.projects
  for each row execute function update_updated_at();

-- RLS
alter table public.projects enable row level security;

-- Public projects visible to everyone
create policy "Public projects are viewable by everyone"
  on public.projects for select
  using (visibility = 'public');

-- Unlisted projects visible to anyone with the link
create policy "Unlisted projects are viewable by anyone"
  on public.projects for select
  using (visibility = 'unlisted');

-- Private projects visible to creator only
create policy "Private projects visible to creator only"
  on public.projects for select
  using (auth.uid() = creator_id);

-- Creators can insert their own projects
create policy "Creators can insert own projects"
  on public.projects for insert
  with check (auth.uid() = creator_id);

-- Creators can update their own projects
create policy "Creators can update own projects"
  on public.projects for update
  using (auth.uid() = creator_id);

-- Creators can delete their own projects
create policy "Creators can delete own projects"
  on public.projects for delete
  using (auth.uid() = creator_id);

-- Commits table (shell only — VVCS data arrives in Phase 3)
create table public.commits (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.projects(id)
                    on delete cascade,
  creator_id      uuid not null references public.creators(id),
  message         text not null,
  snapshot_url    text,              -- S3/R2 link, filled in Phase 3
  metadata        jsonb default '{}',-- operation counts, duration, etc.
  created_at      timestamptz default now()
);

alter table public.commits enable row level security;

-- Commits visible if parent project is visible
create policy "Commits visible with project"
  on public.commits for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
      and (p.visibility in ('public', 'unlisted')
        or p.creator_id = auth.uid())
    )
  );

-- Only creator can insert commits
create policy "Creator can insert commits"
  on public.commits for insert
  with check (auth.uid() = creator_id);
