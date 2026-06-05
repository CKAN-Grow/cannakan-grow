-- Repair My Seed Vault persistence contract for Supabase REST.
-- Additive only: no existing Seed Vault, grow session, profile, CSTP, or
-- Community Grow rows are deleted or rewritten outside safe column backfills.

create extension if not exists pgcrypto;

create table if not exists public.seed_vault_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text,
  seed_variety text,
  seed_name text,
  seed_type text,
  sex text,
  seed_sex text,
  seed_age_years numeric,
  seed_count integer,
  quantity integer,
  remaining_count integer,
  year_acquired integer,
  acquired_at date,
  storage_location text,
  storage_notes text,
  notes text,
  visibility text not null default 'private',
  is_favorite boolean default false,
  is_archived boolean default false,
  archived_at timestamptz,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  is_mock boolean default false,
  dev_mode_only boolean default false,
  mock_source text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

alter table public.seed_vault_entries
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid,
  add column if not exists source text,
  add column if not exists seed_variety text,
  add column if not exists seed_name text,
  add column if not exists seed_type text,
  add column if not exists sex text,
  add column if not exists seed_sex text,
  add column if not exists seed_age_years numeric,
  add column if not exists seed_count integer,
  add column if not exists quantity integer,
  add column if not exists remaining_count integer,
  add column if not exists year_acquired integer,
  add column if not exists acquired_at date,
  add column if not exists storage_location text,
  add column if not exists storage_notes text,
  add column if not exists notes text,
  add column if not exists visibility text not null default 'private',
  add column if not exists is_favorite boolean default false,
  add column if not exists is_archived boolean default false,
  add column if not exists archived_at timestamptz,
  add column if not exists is_deleted boolean not null default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists is_mock boolean default false,
  add column if not exists dev_mode_only boolean default false,
  add column if not exists mock_source text,
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists updated_at timestamptz default timezone('utc', now());

alter table public.seed_vault_entries
  alter column id set default gen_random_uuid(),
  alter column visibility set default 'private',
  alter column is_favorite set default false,
  alter column is_archived set default false,
  alter column is_deleted set default false,
  alter column is_mock set default false,
  alter column dev_mode_only set default false,
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now());

update public.seed_vault_entries
set
  id = coalesce(id, gen_random_uuid()),
  seed_variety = nullif(coalesce(nullif(seed_variety, ''), nullif(seed_name, '')), ''),
  seed_name = nullif(coalesce(nullif(seed_name, ''), nullif(seed_variety, '')), ''),
  sex = nullif(coalesce(nullif(sex, ''), nullif(seed_sex, '')), ''),
  seed_sex = nullif(coalesce(nullif(seed_sex, ''), nullif(sex, '')), ''),
  seed_count = coalesce(seed_count, quantity),
  quantity = coalesce(quantity, seed_count),
  remaining_count = coalesce(remaining_count, seed_count, quantity),
  visibility = case
    when lower(coalesce(visibility, 'private')) = 'public' then 'public'
    else 'private'
  end,
  is_favorite = coalesce(is_favorite, false),
  is_archived = coalesce(is_archived, false),
  is_deleted = coalesce(is_deleted, false),
  is_mock = coalesce(is_mock, false),
  dev_mode_only = coalesce(dev_mode_only, false),
  created_at = coalesce(created_at, timezone('utc', now())),
  updated_at = coalesce(updated_at, timezone('utc', now()));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and contype = 'p'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_pkey primary key (id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_user_id_fkey'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from public.seed_vault_entries
    where id is null
      or user_id is null
      or created_at is null
      or updated_at is null
      or visibility is null
      or is_deleted is null
  ) then
    alter table public.seed_vault_entries
      alter column id set not null,
      alter column user_id set not null,
      alter column visibility set not null,
      alter column is_deleted set not null,
      alter column created_at set not null,
      alter column updated_at set not null;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_seed_count_nonnegative'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_seed_count_nonnegative
      check (seed_count is null or seed_count >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_remaining_count_nonnegative'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_remaining_count_nonnegative
      check (remaining_count is null or remaining_count >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_quantity_nonnegative'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_quantity_nonnegative
      check (quantity is null or quantity >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_year_acquired_range'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_year_acquired_range
      check (year_acquired is null or (year_acquired >= 1980 and year_acquired <= 2100));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_seed_age_nonnegative'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_seed_age_nonnegative
      check (seed_age_years is null or seed_age_years >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_visibility_check'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_visibility_check
      check (visibility in ('private', 'public'));
  end if;
end;
$$;

create index if not exists seed_vault_entries_user_updated_idx
  on public.seed_vault_entries (user_id, is_archived, is_favorite desc, updated_at desc);

create index if not exists seed_vault_entries_user_source_idx
  on public.seed_vault_entries (user_id, source);

create index if not exists seed_vault_entries_user_variety_idx
  on public.seed_vault_entries (user_id, seed_variety);

create index if not exists seed_vault_entries_user_visibility_idx
  on public.seed_vault_entries (user_id, visibility, is_archived, is_deleted);

create index if not exists seed_vault_entries_user_acquired_idx
  on public.seed_vault_entries (user_id, acquired_at);

create or replace function public.set_seed_vault_entries_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists seed_vault_entries_set_updated_at
  on public.seed_vault_entries;

create trigger seed_vault_entries_set_updated_at
  before update on public.seed_vault_entries
  for each row
  execute function public.set_seed_vault_entries_updated_at();

alter table public.seed_vault_entries enable row level security;

drop policy if exists "Users can view their own seed vault entries"
  on public.seed_vault_entries;
drop policy if exists "Users can insert their own seed vault entries"
  on public.seed_vault_entries;
drop policy if exists "Users can update their own seed vault entries"
  on public.seed_vault_entries;
drop policy if exists "Users can delete their own seed vault entries"
  on public.seed_vault_entries;

create policy "Users can view their own seed vault entries"
  on public.seed_vault_entries
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own seed vault entries"
  on public.seed_vault_entries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own seed vault entries"
  on public.seed_vault_entries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own seed vault entries"
  on public.seed_vault_entries
  for delete
  to authenticated
  using (auth.uid() = user_id);

revoke all on public.seed_vault_entries from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.seed_vault_entries to authenticated;

notify pgrst, 'reload schema';
