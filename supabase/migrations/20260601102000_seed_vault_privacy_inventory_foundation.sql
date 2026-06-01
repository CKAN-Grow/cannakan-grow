-- Step 2B.1 Seed Vault privacy and inventory foundation additions.
-- Additive only: extends owner-scoped Seed Vault records without changing CSTP,
-- Community Grow, or grow session architecture.

alter table public.seed_vault_entries
  add column if not exists visibility text not null default 'private',
  add column if not exists acquired_at date,
  add column if not exists storage_notes text,
  add column if not exists archived_at timestamptz,
  add column if not exists is_deleted boolean not null default false,
  add column if not exists deleted_at timestamptz;

alter table public.seed_vault_entries
  alter column visibility set default 'private',
  alter column is_deleted set default false;

update public.seed_vault_entries
set
  visibility = case
    when lower(coalesce(visibility, 'private')) = 'public' then 'public'
    else 'private'
  end,
  is_deleted = coalesce(is_deleted, false);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_visibility_check'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_visibility_check
      check (visibility in ('private', 'public'));
  end if;
end;
$$;

comment on column public.seed_vault_entries.visibility is
  'Owner-controlled Seed Vault visibility hook. Entries remain owner-only by RLS; public value is reserved for future public-safe metadata flows.';
comment on column public.seed_vault_entries.acquired_at is
  'Optional exact acquisition date for future Seed Age Analytics.';
comment on column public.seed_vault_entries.storage_notes is
  'Owner-only storage condition notes. Never exposed through public profile or Community Grow queries.';
comment on column public.seed_vault_entries.is_deleted is
  'Soft-delete compatibility hook for future retention-safe Seed Vault behavior.';

create index if not exists seed_vault_entries_user_visibility_idx
  on public.seed_vault_entries (user_id, visibility, is_archived, is_deleted);

create index if not exists seed_vault_entries_user_acquired_idx
  on public.seed_vault_entries (user_id, acquired_at);

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
grant select, insert, update, delete on public.seed_vault_entries to authenticated;

notify pgrst, 'reload schema';
