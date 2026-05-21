-- Ensure My Seed Vault account storage is available through Supabase REST.
-- Additive repair only: does not modify grow sessions, CSTP, Community Grow,
-- session timing, delete, or analytics tables.

create extension if not exists pgcrypto;

create table if not exists public.seed_vault_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seed_name text not null,
  seed_type text,
  source text,
  quantity integer,
  year_acquired integer,
  seed_age_years numeric,
  storage_location text,
  notes text,
  is_favorite boolean default false,
  is_archived boolean default false,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

alter table public.seed_vault_entries
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid,
  add column if not exists seed_name text,
  add column if not exists seed_type text,
  add column if not exists source text,
  add column if not exists quantity integer,
  add column if not exists year_acquired integer,
  add column if not exists seed_age_years numeric,
  add column if not exists storage_location text,
  add column if not exists notes text,
  add column if not exists is_favorite boolean default false,
  add column if not exists is_archived boolean default false,
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists updated_at timestamptz default timezone('utc', now());

alter table public.seed_vault_entries
  alter column id set default gen_random_uuid(),
  alter column is_favorite set default false,
  alter column is_archived set default false,
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now());

update public.seed_vault_entries
set
  id = coalesce(id, gen_random_uuid()),
  is_favorite = coalesce(is_favorite, false),
  is_archived = coalesce(is_archived, false),
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
      or seed_name is null
      or btrim(seed_name) = ''
      or is_favorite is null
      or is_archived is null
      or created_at is null
      or updated_at is null
  ) then
    alter table public.seed_vault_entries
      alter column id set not null,
      alter column user_id set not null,
      alter column seed_name set not null,
      alter column is_favorite set not null,
      alter column is_archived set not null,
      alter column created_at set not null,
      alter column updated_at set not null;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_quantity_nonnegative'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_quantity_nonnegative
      check (quantity is null or quantity >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_year_acquired_range'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_year_acquired_range
      check (year_acquired is null or (year_acquired >= 1900 and year_acquired <= 2100));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_seed_age_nonnegative'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_seed_age_nonnegative
      check (seed_age_years is null or seed_age_years >= 0);
  end if;
end;
$$;

comment on table public.seed_vault_entries is
  'Per-user My Seed Vault records for cataloging owned seed inventory before optionally linking entries to grow sessions.';

comment on column public.seed_vault_entries.seed_name is
  'Seed name / variety shown on each Vault Entry.';

create index if not exists seed_vault_entries_user_updated_idx
  on public.seed_vault_entries (user_id, is_archived, is_favorite desc, updated_at desc);

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

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.seed_vault_entries to authenticated;

notify pgrst, 'reload schema';
