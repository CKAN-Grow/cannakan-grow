-- Seed Vault Phase 1 foundation.
-- Additive migration only: preserves existing entries and migrates legacy notes
-- into personal_notes when the split-note fields are empty.

create extension if not exists pgcrypto;

alter table public.seed_vault_entries
  add column if not exists source_notes text,
  add column if not exists personal_notes text,
  add column if not exists grow_notes jsonb not null default '[]'::jsonb,
  add column if not exists collections text[] not null default '{}'::text[],
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists planning_status text not null default 'inventory',
  add column if not exists grow_along_enabled boolean not null default false,
  add column if not exists grow_along_name text,
  add column if not exists testing_program_enabled boolean not null default false,
  add column if not exists testing_program_name text,
  add column if not exists testing_program_connection_type text not null default 'independently-marked',
  add column if not exists acquired_from text,
  add column if not exists acquisition_date date,
  add column if not exists order_number text,
  add column if not exists price numeric(12, 2),
  add column if not exists breeder text;

update public.seed_vault_entries
set
  personal_notes = nullif(coalesce(nullif(personal_notes, ''), nullif(notes, '')), ''),
  acquisition_date = coalesce(acquisition_date, acquired_at),
  planning_status = case
    when coalesce(is_archived, false) then 'archived'
    when planning_status in ('inventory', 'planned', 'active', 'completed', 'archived') then planning_status
    else 'inventory'
  end,
  testing_program_connection_type = case
    when testing_program_connection_type in ('connected-group', 'independently-marked') then testing_program_connection_type
    else 'independently-marked'
  end,
  grow_notes = coalesce(grow_notes, '[]'::jsonb),
  collections = coalesce(collections, '{}'::text[]),
  tags = coalesce(tags, '{}'::text[])
where true;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_planning_status_check'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_planning_status_check
      check (planning_status in ('inventory', 'planned', 'active', 'completed', 'archived'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_testing_connection_check'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_testing_connection_check
      check (testing_program_connection_type in ('connected-group', 'independently-marked'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_price_nonnegative'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_price_nonnegative
      check (price is null or price >= 0);
  end if;
end;
$$;

create index if not exists seed_vault_entries_user_planning_idx
  on public.seed_vault_entries (user_id, planning_status, is_archived, updated_at desc);

create index if not exists seed_vault_entries_user_breeder_idx
  on public.seed_vault_entries (user_id, breeder);

create index if not exists seed_vault_entries_collections_gin_idx
  on public.seed_vault_entries using gin (collections);

create index if not exists seed_vault_entries_tags_gin_idx
  on public.seed_vault_entries using gin (tags);

create table if not exists public.seed_vault_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, normalized_name)
);

create table if not exists public.seed_vault_entry_collections (
  seed_vault_entry_id uuid not null references public.seed_vault_entries(id) on delete cascade,
  collection_id uuid not null references public.seed_vault_collections(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (seed_vault_entry_id, collection_id)
);

create table if not exists public.seed_vault_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, normalized_name)
);

create table if not exists public.seed_vault_entry_tags (
  seed_vault_entry_id uuid not null references public.seed_vault_entries(id) on delete cascade,
  tag_id uuid not null references public.seed_vault_tags(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (seed_vault_entry_id, tag_id)
);

create table if not exists public.seed_vault_grow_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seed_vault_entry_id uuid not null references public.seed_vault_entries(id) on delete cascade,
  session_id uuid references public.grow_sessions(id) on delete set null,
  note_text text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.seed_vault_collections enable row level security;
alter table public.seed_vault_entry_collections enable row level security;
alter table public.seed_vault_tags enable row level security;
alter table public.seed_vault_entry_tags enable row level security;
alter table public.seed_vault_grow_notes enable row level security;

drop policy if exists "Users can manage their own seed vault collections" on public.seed_vault_collections;
create policy "Users can manage their own seed vault collections"
  on public.seed_vault_collections
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own seed vault collection memberships" on public.seed_vault_entry_collections;
create policy "Users can manage their own seed vault collection memberships"
  on public.seed_vault_entry_collections
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own seed vault tags" on public.seed_vault_tags;
create policy "Users can manage their own seed vault tags"
  on public.seed_vault_tags
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own seed vault tag memberships" on public.seed_vault_entry_tags;
create policy "Users can manage their own seed vault tag memberships"
  on public.seed_vault_entry_tags
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own seed vault grow notes" on public.seed_vault_grow_notes;
create policy "Users can manage their own seed vault grow notes"
  on public.seed_vault_grow_notes
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.seed_vault_collections to authenticated;
grant select, insert, update, delete on public.seed_vault_entry_collections to authenticated;
grant select, insert, update, delete on public.seed_vault_tags to authenticated;
grant select, insert, update, delete on public.seed_vault_entry_tags to authenticated;
grant select, insert, update, delete on public.seed_vault_grow_notes to authenticated;

notify pgrst, 'reload schema';
