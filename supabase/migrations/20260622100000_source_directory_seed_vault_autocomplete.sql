-- Source Directory foundation for My Seed Vault autocomplete.
-- Stores breeder, seed bank, marketplace, collective, and fallback source names
-- for fast physical seed collection entry.

create extension if not exists pgcrypto;

create table if not exists public.source_directory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text generated always as (
    lower(regexp_replace(trim(name), '\s+', ' ', 'g'))
  ) stored,
  aliases text[] default '{}',
  source_type text not null default 'other',
  country text,
  website text,
  verified boolean default false,
  active boolean default true,
  usage_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists source_directory_normalized_name_uidx
  on public.source_directory (normalized_name);

create index if not exists source_directory_aliases_gin_idx
  on public.source_directory using gin (aliases);

create index if not exists source_directory_active_type_name_idx
  on public.source_directory (active, source_type, name);

create or replace function public.set_source_directory_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists source_directory_set_updated_at
  on public.source_directory;

create trigger source_directory_set_updated_at
  before update on public.source_directory
  for each row
  execute function public.set_source_directory_updated_at();

alter table public.source_directory enable row level security;

drop policy if exists "Authenticated users can view active source directory rows"
  on public.source_directory;

create policy "Authenticated users can view active source directory rows"
  on public.source_directory
  for select
  to authenticated
  using (active = true);

revoke all on public.source_directory from anon;
grant usage on schema public to authenticated;
grant select on public.source_directory to authenticated;

notify pgrst, 'reload schema';
