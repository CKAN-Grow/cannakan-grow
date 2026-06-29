-- Add per-user Seed Vault color themes and expose owner themes in share payloads.

alter table public.public_member_profiles
  add column if not exists vault_theme text not null default 'green';

update public.public_member_profiles
set vault_theme = 'green'
where vault_theme is null
  or vault_theme not in ('green', 'pink', 'blue', 'purple', 'amber');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'public_member_profiles_vault_theme_check'
      and conrelid = 'public.public_member_profiles'::regclass
  ) then
    alter table public.public_member_profiles
      add constraint public_member_profiles_vault_theme_check
      check (vault_theme in ('green', 'pink', 'blue', 'purple', 'amber'));
  end if;
end;
$$;

drop view if exists public.safe_public_member_profiles;

create view public.safe_public_member_profiles as
select
  id,
  user_id,
  display_name,
  avatar_url,
  bio,
  public_handle,
  location_region,
  country_code,
  profile_visibility,
  vault_theme,
  joined_at,
  show_profile_in_community_grow,
  show_grow_stats_publicly,
  created_at,
  updated_at
from public.public_member_profiles
where coalesce(show_profile_in_community_grow, true) = true
  and coalesce(profile_visibility, 'public') = 'public'
  and nullif(btrim(coalesce(display_name, '')), '') is not null
  and exists (
    select 1
    from public.profiles
    where profiles.id = public_member_profiles.user_id
      and coalesce(profiles.account_status, 'active') = 'active'
      and coalesce(profiles.deletion_status, '') <> 'deleted'
  );

comment on view public.safe_public_member_profiles is
  'Public-safe profile lookup surface. Exposes approved profile identity fields, including Seed Vault theme, only for visible active public profiles.';

revoke all on table public.safe_public_member_profiles from public;
grant select on table public.safe_public_member_profiles to anon, authenticated;

comment on column public.public_member_profiles.vault_theme is
  'Per-user Seed Vault color theme preset. Applies only to Seed Vault surfaces and shared Vault owner presentation.';

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
      coalesce(public_member_profiles.vault_theme, 'green') as owner_vault_theme,
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
      public_member_profiles.vault_theme,
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
    'owner_vault_theme', owner_vault_theme,
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
  owner_theme text := 'green';
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
    public_member_profiles.public_handle,
    coalesce(public_member_profiles.vault_theme, 'green')
  into owner_name, owner_handle, owner_theme
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
    'owner_vault_theme', owner_theme,
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


create or replace function public.get_shared_seed_vault(vault_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned_slug text := public.normalize_seed_vault_share_slug(vault_slug);
  settings_row public.seed_vault_share_settings;
  owner_name text := 'CannaKAN Grower';
  owner_theme text := 'green';
  entries_payload jsonb := '[]'::jsonb;
  entry_count integer := 0;
begin
  if cleaned_slug is null then
    return jsonb_build_object('found', false, 'entries', '[]'::jsonb);
  end if;

  select *
  into settings_row
  from public.seed_vault_share_settings
  where public_slug = cleaned_slug
    and visibility in ('public', 'link')
  limit 1;

  if settings_row.user_id is null then
    return jsonb_build_object('found', false, 'entries', '[]'::jsonb);
  end if;

  select
    coalesce(nullif(btrim(public_member_profiles.display_name), ''), 'CannaKAN Grower'),
    coalesce(public_member_profiles.vault_theme, 'green')
  into owner_name, owner_theme
  from public.public_member_profiles
  inner join public.profiles
    on profiles.id = public_member_profiles.user_id
  where public_member_profiles.user_id = settings_row.user_id
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
    where user_id = settings_row.user_id
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
      'quantity_remaining', case when settings_row.show_quantity then quantity_remaining else null end,
      'storage_location', case when settings_row.show_storage_location then storage_location else null end,
      'storage_notes', case when settings_row.show_storage_notes then storage_notes else null end,
      'notes', case when settings_row.show_private_notes then notes else null end
    )) order by lower(source), lower(variety), created_at desc), '[]'::jsonb),
    count(*)::integer
  into entries_payload, entry_count
  from visible_entries;

  return jsonb_build_object(
    'found', true,
    'visibility', settings_row.visibility,
    'owner_display_name', owner_name,
    'owner_vault_theme', owner_theme,
    'total_visible_entries', entry_count,
    'settings', jsonb_build_object(
      'show_quantity', settings_row.show_quantity,
      'show_storage_location', settings_row.show_storage_location,
      'show_storage_notes', settings_row.show_storage_notes,
      'show_private_notes', settings_row.show_private_notes
    ),
    'entries', entries_payload
  );
end;
$$;

grant execute on function public.get_shared_seed_vault(text) to anon, authenticated;

notify pgrst, 'reload schema';
