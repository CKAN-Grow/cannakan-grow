-- My Seed Vault: personal seed collection entries.
-- Additive only. This does not modify grow session, CSTP, or Community Grow tables.

create extension if not exists pgcrypto;

create table if not exists public.seed_vault_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seed_name text not null,
  seed_type text,
  source text,
  quantity integer check (quantity is null or quantity >= 0),
  year_acquired integer check (year_acquired is null or (year_acquired >= 1900 and year_acquired <= 2100)),
  seed_age_years numeric check (seed_age_years is null or seed_age_years >= 0),
  storage_location text,
  notes text,
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

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

notify pgrst, 'reload schema';
