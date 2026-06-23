-- Shared Seed Vault V1 direct Grow user sharing.
-- Direct grants are separate from public/link sharing and use authenticated RPCs
-- that return permission-filtered vault projections without exposing emails.

create table if not exists public.seed_vault_share_users (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  shared_with_user_id uuid not null references auth.users(id) on delete cascade,
  can_view_quantity boolean not null default false,
  can_view_storage_location boolean not null default false,
  can_view_storage_notes boolean not null default false,
  can_view_notes boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seed_vault_share_users_not_self_check
    check (owner_user_id <> shared_with_user_id)
);

create unique index if not exists seed_vault_share_users_owner_recipient_idx
  on public.seed_vault_share_users (owner_user_id, shared_with_user_id);

create index if not exists seed_vault_share_users_recipient_idx
  on public.seed_vault_share_users (shared_with_user_id, owner_user_id);

create index if not exists seed_vault_share_users_owner_idx
  on public.seed_vault_share_users (owner_user_id, shared_with_user_id);

create or replace function public.set_seed_vault_share_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists seed_vault_share_users_set_updated_at on public.seed_vault_share_users;
create trigger seed_vault_share_users_set_updated_at
before update on public.seed_vault_share_users
for each row
execute function public.set_seed_vault_share_users_updated_at();

alter table public.seed_vault_share_users enable row level security;

drop policy if exists "Seed Vault share owners can read grants" on public.seed_vault_share_users;
create policy "Seed Vault share owners can read grants"
on public.seed_vault_share_users
for select
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists "Seed Vault shared users can read their grant" on public.seed_vault_share_users;
create policy "Seed Vault shared users can read their grant"
on public.seed_vault_share_users
for select
to authenticated
using (auth.uid() = shared_with_user_id);

drop policy if exists "Seed Vault owners can grant direct shares" on public.seed_vault_share_users;
create policy "Seed Vault owners can grant direct shares"
on public.seed_vault_share_users
for insert
to authenticated
with check (auth.uid() = owner_user_id);

drop policy if exists "Seed Vault owners can update direct shares" on public.seed_vault_share_users;
create policy "Seed Vault owners can update direct shares"
on public.seed_vault_share_users
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "Seed Vault owners can delete direct shares" on public.seed_vault_share_users;
create policy "Seed Vault owners can delete direct shares"
on public.seed_vault_share_users
for delete
to authenticated
using (auth.uid() = owner_user_id);

revoke all on table public.seed_vault_share_users from public;
grant select, insert, update, delete on table public.seed_vault_share_users to authenticated;

create or replace function public.search_seed_vault_share_users(search_query text)
returns table (
  user_id uuid,
  display_name text,
  public_handle text,
  avatar_url text,
  country_code text
)
language sql
security definer
set search_path = public, auth
as $$
  select
    safe_public_member_profiles.user_id,
    safe_public_member_profiles.display_name,
    safe_public_member_profiles.public_handle,
    safe_public_member_profiles.avatar_url,
    safe_public_member_profiles.country_code
  from public.safe_public_member_profiles
  where auth.uid() is not null
    and safe_public_member_profiles.user_id <> auth.uid()
    and length(btrim(coalesce(search_query, ''))) >= 2
    and (
      lower(safe_public_member_profiles.display_name) like '%' || lower(btrim(search_query)) || '%'
      or lower(coalesce(safe_public_member_profiles.public_handle, '')) like '%' || lower(regexp_replace(btrim(search_query), '^@+', '')) || '%'
    )
  order by
    case
      when lower(coalesce(safe_public_member_profiles.public_handle, '')) = lower(regexp_replace(btrim(search_query), '^@+', '')) then 0
      when lower(safe_public_member_profiles.display_name) = lower(btrim(search_query)) then 1
      when lower(coalesce(safe_public_member_profiles.public_handle, '')) like lower(regexp_replace(btrim(search_query), '^@+', '')) || '%' then 2
      when lower(safe_public_member_profiles.display_name) like lower(btrim(search_query)) || '%' then 3
      else 4
    end,
    lower(safe_public_member_profiles.display_name)
  limit 10;
$$;

grant execute on function public.search_seed_vault_share_users(text) to authenticated;

create or replace function public.upsert_seed_vault_user_share(
  target_user_id uuid,
  next_can_view_quantity boolean default false,
  next_can_view_storage_location boolean default false,
  next_can_view_storage_notes boolean default false,
  next_can_view_notes boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requester uuid := auth.uid();
  saved_share public.seed_vault_share_users;
  target_profile record;
begin
  if requester is null then
    raise exception 'Authentication required';
  end if;

  if target_user_id is null or target_user_id = requester then
    raise exception 'Choose another Grow user to share with.';
  end if;

  select user_id, display_name, public_handle, avatar_url, country_code
  into target_profile
  from public.safe_public_member_profiles
  where user_id = target_user_id
  limit 1;

  if target_profile.user_id is null then
    raise exception 'Grow user is not available for sharing.';
  end if;

  insert into public.seed_vault_share_users (
    owner_user_id,
    shared_with_user_id,
    can_view_quantity,
    can_view_storage_location,
    can_view_storage_notes,
    can_view_notes
  )
  values (
    requester,
    target_user_id,
    coalesce(next_can_view_quantity, false),
    coalesce(next_can_view_storage_location, false),
    coalesce(next_can_view_storage_notes, false),
    coalesce(next_can_view_notes, false)
  )
  on conflict (owner_user_id, shared_with_user_id) do update
    set can_view_quantity = excluded.can_view_quantity,
        can_view_storage_location = excluded.can_view_storage_location,
        can_view_storage_notes = excluded.can_view_storage_notes,
        can_view_notes = excluded.can_view_notes,
        updated_at = timezone('utc', now())
  returning *
  into saved_share;

  return jsonb_build_object(
    'id', saved_share.id,
    'shared_with_user_id', saved_share.shared_with_user_id,
    'display_name', target_profile.display_name,
    'public_handle', target_profile.public_handle,
    'avatar_url', target_profile.avatar_url,
    'country_code', target_profile.country_code,
    'can_view_quantity', saved_share.can_view_quantity,
    'can_view_storage_location', saved_share.can_view_storage_location,
    'can_view_storage_notes', saved_share.can_view_storage_notes,
    'can_view_notes', saved_share.can_view_notes,
    'updated_at', saved_share.updated_at
  );
end;
$$;

grant execute on function public.upsert_seed_vault_user_share(uuid, boolean, boolean, boolean, boolean) to authenticated;

create or replace function public.remove_seed_vault_user_share(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requester uuid := auth.uid();
begin
  if requester is null then
    raise exception 'Authentication required';
  end if;

  delete from public.seed_vault_share_users
  where owner_user_id = requester
    and shared_with_user_id = target_user_id;

  return jsonb_build_object('removed', true);
end;
$$;

grant execute on function public.remove_seed_vault_user_share(uuid) to authenticated;

create or replace function public.get_seed_vault_user_shares()
returns jsonb
language sql
security definer
set search_path = public, auth
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', seed_vault_share_users.id,
    'shared_with_user_id', seed_vault_share_users.shared_with_user_id,
    'display_name', safe_public_member_profiles.display_name,
    'public_handle', safe_public_member_profiles.public_handle,
    'avatar_url', safe_public_member_profiles.avatar_url,
    'country_code', safe_public_member_profiles.country_code,
    'can_view_quantity', seed_vault_share_users.can_view_quantity,
    'can_view_storage_location', seed_vault_share_users.can_view_storage_location,
    'can_view_storage_notes', seed_vault_share_users.can_view_storage_notes,
    'can_view_notes', seed_vault_share_users.can_view_notes,
    'updated_at', seed_vault_share_users.updated_at
  ) order by lower(safe_public_member_profiles.display_name)), '[]'::jsonb)
  from public.seed_vault_share_users
  inner join public.safe_public_member_profiles
    on safe_public_member_profiles.user_id = seed_vault_share_users.shared_with_user_id
  where auth.uid() is not null
    and seed_vault_share_users.owner_user_id = auth.uid();
$$;

grant execute on function public.get_seed_vault_user_shares() to authenticated;

create or replace function public.get_seed_vaults_shared_with_me()
returns jsonb
language sql
security definer
set search_path = public, auth
as $$
  with shared_vaults as (
    select
      seed_vault_share_users.owner_user_id,
      coalesce(nullif(btrim(public_member_profiles.display_name), ''), 'CannaKAN Grower') as owner_display_name,
      public_member_profiles.public_handle as owner_public_handle,
      seed_vault_share_users.can_view_quantity,
      seed_vault_share_users.can_view_storage_location,
      seed_vault_share_users.can_view_storage_notes,
      seed_vault_share_users.can_view_notes,
      seed_vault_share_users.updated_at as share_updated_at,
      count(seed_vault_entries.id)::integer as visible_entry_count,
      max(seed_vault_entries.updated_at) as vault_updated_at
    from public.seed_vault_share_users
    inner join public.public_member_profiles
      on public_member_profiles.user_id = seed_vault_share_users.owner_user_id
    inner join public.profiles
      on profiles.id = seed_vault_share_users.owner_user_id
    left join public.seed_vault_entries
      on seed_vault_entries.user_id = seed_vault_share_users.owner_user_id
      and coalesce(seed_vault_entries.is_archived, false) = false
      and coalesce(seed_vault_entries.is_deleted, false) = false
      and coalesce(seed_vault_entries.is_mock, false) = false
      and coalesce(seed_vault_entries.dev_mode_only, false) = false
    where auth.uid() is not null
      and seed_vault_share_users.shared_with_user_id = auth.uid()
      and coalesce(profiles.account_status, 'active') = 'active'
      and coalesce(profiles.deletion_status, '') <> 'deleted'
    group by
      seed_vault_share_users.owner_user_id,
      public_member_profiles.display_name,
      public_member_profiles.public_handle,
      seed_vault_share_users.can_view_quantity,
      seed_vault_share_users.can_view_storage_location,
      seed_vault_share_users.can_view_storage_notes,
      seed_vault_share_users.can_view_notes,
      seed_vault_share_users.updated_at
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'owner_user_id', owner_user_id,
    'owner_display_name', owner_display_name,
    'owner_public_handle', owner_public_handle,
    'visible_entry_count', visible_entry_count,
    'last_updated_at', coalesce(vault_updated_at, share_updated_at),
    'can_view_quantity', can_view_quantity,
    'can_view_storage_location', can_view_storage_location,
    'can_view_storage_notes', can_view_storage_notes,
    'can_view_notes', can_view_notes,
    'updated_at', share_updated_at
  ) order by lower(owner_display_name)), '[]'::jsonb)
  from shared_vaults;
$$;

grant execute on function public.get_seed_vaults_shared_with_me() to authenticated;

create or replace function public.get_direct_shared_seed_vault(owner_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requester uuid := auth.uid();
  share_row public.seed_vault_share_users;
  owner_name text := 'CannaKAN Grower';
  owner_handle text := null;
  entries_payload jsonb := '[]'::jsonb;
  entry_count integer := 0;
begin
  if requester is null then
    raise exception 'Authentication required';
  end if;

  select *
  into share_row
  from public.seed_vault_share_users
  where public.seed_vault_share_users.owner_user_id = get_direct_shared_seed_vault.owner_user_id
    and public.seed_vault_share_users.shared_with_user_id = requester
  limit 1;

  if share_row.owner_user_id is null then
    return jsonb_build_object('found', false, 'entries', '[]'::jsonb);
  end if;

  select
    coalesce(nullif(btrim(public_member_profiles.display_name), ''), 'CannaKAN Grower'),
    public_member_profiles.public_handle
  into owner_name, owner_handle
  from public.public_member_profiles
  inner join public.profiles
    on profiles.id = public_member_profiles.user_id
  where public_member_profiles.user_id = share_row.owner_user_id
    and coalesce(profiles.account_status, 'active') = 'active'
    and coalesce(profiles.deletion_status, '') <> 'deleted'
  limit 1;

  with visible_entries as (
    select
      coalesce(nullif(btrim(source), ''), 'Unknown Source') as source,
      coalesce(nullif(btrim(seed_variety), ''), nullif(btrim(seed_name), ''), 'Unknown Variety') as variety,
      nullif(btrim(seed_type), '') as seed_type,
      coalesce(nullif(btrim(seed_sex), ''), nullif(btrim(sex), '')) as seed_sex,
      nullif(year_acquired, 0) as year_acquired,
      seed_age_years,
      coalesce(remaining_count, quantity, seed_count) as quantity_remaining,
      nullif(btrim(storage_location), '') as storage_location,
      nullif(btrim(storage_notes), '') as storage_notes,
      nullif(btrim(notes), '') as notes,
      created_at
    from public.seed_vault_entries
    where user_id = share_row.owner_user_id
      and coalesce(is_archived, false) = false
      and coalesce(is_deleted, false) = false
      and coalesce(is_mock, false) = false
      and coalesce(dev_mode_only, false) = false
  )
  select
    coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
      'source', source,
      'variety', variety,
      'seed_type', seed_type,
      'seed_sex', seed_sex,
      'year_acquired', year_acquired,
      'seed_age_years', seed_age_years,
      'quantity_remaining', case when share_row.can_view_quantity then quantity_remaining else null end,
      'storage_location', case when share_row.can_view_storage_location then storage_location else null end,
      'storage_notes', case when share_row.can_view_storage_notes then storage_notes else null end,
      'notes', case when share_row.can_view_notes then notes else null end
    )) order by lower(source), lower(variety), created_at desc), '[]'::jsonb),
    count(*)::integer
  into entries_payload, entry_count
  from visible_entries;

  return jsonb_build_object(
    'found', true,
    'owner_display_name', owner_name,
    'owner_public_handle', owner_handle,
    'total_visible_entries', entry_count,
    'settings', jsonb_build_object(
      'show_quantity', share_row.can_view_quantity,
      'show_storage_location', share_row.can_view_storage_location,
      'show_storage_notes', share_row.can_view_storage_notes,
      'show_private_notes', share_row.can_view_notes
    ),
    'entries', entries_payload
  );
end;
$$;

grant execute on function public.get_direct_shared_seed_vault(uuid) to authenticated;

comment on table public.seed_vault_share_users is
  'Direct authenticated-user Seed Vault share grants. Separate from public/link sharing.';

notify pgrst, 'reload schema';