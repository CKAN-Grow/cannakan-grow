-- Canonical Grow Identity Layer, Phase 1.
--
-- Additive privacy and identity foundation. Existing profile, Community,
-- Grow Network, Recognition, and Seed Vault contracts remain in place while
-- new callers gain one viewer-aware, server-filtered identity boundary.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Canonical constants and validation helpers.
-- ---------------------------------------------------------------------------

create or replace function public.get_grow_identity_contract_v1()
returns jsonb
language sql
immutable
set search_path = public
as $$
  select jsonb_build_object(
    'version', 'grow-identity.v1',
    'profile_visibility', jsonb_build_array('personal', 'connections', 'public'),
    'field_visibility', jsonb_build_array('only_me', 'connections', 'public'),
    'experience_levels', jsonb_build_array('new', 'beginner', 'intermediate', 'experienced', 'expert'),
    'primary_roles', jsonb_build_array('grower', 'breeder', 'source', 'educator', 'researcher', 'community_contributor', 'industry_partner'),
    'connection_request_permissions', jsonb_build_array('anyone', 'mutual_connections', 'nobody'),
    'identity_field_keys', to_jsonb(array[
      'display_name', 'username', 'profile_image', 'cover_image', 'bio',
      'primary_role', 'experience_level', 'years_growing', 'growing_environments',
      'favorite_methods', 'grow_interests', 'grow_goals', 'favorite_breeders',
      'favorite_sources', 'languages', 'city', 'state_province', 'country',
      'recognitions', 'activity_summary', 'testing_participation',
      'grow_along_participation', 'collections_vault_summary'
    ]::text[]),
    'invitation_preference_keys', to_jsonb(array[
      'testing_programs', 'grow_alongs', 'collaborations', 'vault_sharing',
      'breeder_source_opportunities'
    ]::text[]),
    'provenance_values', jsonb_build_array('self_declared', 'observed', 'suggested', 'user_confirmed', 'system_verified'),
    'defaults', jsonb_build_object(
      'profile_visibility', 'connections',
      'grow_network_discoverable', true,
      'connection_request_permission', 'anyone',
      'personalization_consent', false,
      'invitation_preferences', jsonb_build_object(
        'testing_programs', false,
        'grow_alongs', true,
        'collaborations', true,
        'vault_sharing', true,
        'breeder_source_opportunities', false
      )
    )
  );
$$;

create or replace function public.grow_identity_field_keys_v1()
returns text[]
language sql
immutable
set search_path = public
as $$
  select array[
    'display_name', 'username', 'profile_image', 'cover_image', 'bio',
    'primary_role', 'experience_level', 'years_growing', 'growing_environments',
    'favorite_methods', 'grow_interests', 'grow_goals', 'favorite_breeders',
    'favorite_sources', 'languages', 'city', 'state_province', 'country',
    'recognitions', 'activity_summary', 'testing_participation',
    'grow_along_participation', 'collections_vault_summary'
  ]::text[];
$$;

create or replace function public.grow_identity_default_invitation_preferences_v1()
returns jsonb
language sql
immutable
set search_path = public
as $$
  select jsonb_build_object(
    'testing_programs', false,
    'grow_alongs', true,
    'collaborations', true,
    'vault_sharing', true,
    'breeder_source_opportunities', false
  );
$$;

create or replace function public.grow_identity_invitation_preferences_valid_v1(value jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select jsonb_typeof(coalesce(value, '{}'::jsonb)) = 'object'
    and not exists (
      select 1
      from jsonb_each(coalesce(value, '{}'::jsonb)) item
      where item.key <> all (array[
        'testing_programs', 'grow_alongs', 'collaborations', 'vault_sharing',
        'breeder_source_opportunities'
      ]::text[])
        or jsonb_typeof(item.value) <> 'boolean'
    );
$$;

create or replace function public.grow_identity_provenance_valid_v1(value jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select jsonb_typeof(coalesce(value, '{}'::jsonb)) = 'object'
    and not exists (
      select 1
      from jsonb_each(coalesce(value, '{}'::jsonb)) item
      where item.key <> all (public.grow_identity_field_keys_v1())
        or jsonb_typeof(item.value) <> 'object'
        or coalesce(item.value ->> 'source', '') not in (
          'self_declared', 'observed', 'suggested', 'user_confirmed', 'system_verified'
        )
    );
$$;

create or replace function public.normalize_grow_identity_text_array_v1(values_input text[], max_items integer default 25)
returns text[]
language sql
immutable
set search_path = public
as $$
  with normalized as (
    select distinct on (lower(btrim(value)))
      btrim(value) as value,
      ordinality as first_position
    from unnest(coalesce(values_input, '{}'::text[])) with ordinality rows(value, ordinality)
    where nullif(btrim(coalesce(value, '')), '') is not null
    order by lower(btrim(value)), ordinality
  )
  select coalesce(array_agg(value order by first_position), '{}'::text[])
  from (select value, first_position from normalized order by first_position limit greatest(0, least(coalesce(max_items, 25), 100))) limited;
$$;

create or replace function public.normalize_grow_identity_json_text_array_v1(value jsonb, max_items integer default 25)
returns text[]
language plpgsql
immutable
set search_path = public
as $$
declare result text[];
begin
  if value is null or value = 'null'::jsonb then
    return '{}'::text[];
  end if;
  if jsonb_typeof(value) <> 'array' then
    raise exception 'Identity multi-value fields must be arrays' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_array_elements(value) item where jsonb_typeof(item) <> 'string') then
    raise exception 'Identity multi-value fields may contain text only' using errcode = '22023';
  end if;
  select public.normalize_grow_identity_text_array_v1(array_agg(item #>> '{}'), max_items)
  into result
  from jsonb_array_elements(value) item;
  return coalesce(result, '{}'::text[]);
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Extend the existing member profile as the canonical identity row.
-- ---------------------------------------------------------------------------

alter table public.public_member_profiles
  add column if not exists username text,
  add column if not exists cover_image_url text default '',
  add column if not exists primary_role text not null default 'grower',
  add column if not exists experience_level text not null default 'new',
  add column if not exists years_growing integer,
  add column if not exists languages text[] not null default '{}'::text[],
  add column if not exists growing_environments text[] not null default '{}'::text[],
  add column if not exists favorite_germination_methods text[] not null default '{}'::text[],
  add column if not exists grow_interests text[] not null default '{}'::text[],
  add column if not exists grow_goals text[] not null default '{}'::text[],
  add column if not exists favorite_breeders text[] not null default '{}'::text[],
  add column if not exists favorite_sources text[] not null default '{}'::text[],
  add column if not exists city text,
  add column if not exists state_province text,
  add column if not exists country text,
  add column if not exists timezone text,
  add column if not exists grow_network_discoverable boolean not null default true,
  add column if not exists connection_request_permission text not null default 'anyone',
  add column if not exists invitation_preferences jsonb not null default public.grow_identity_default_invitation_preferences_v1(),
  add column if not exists personalization_consent boolean not null default false,
  add column if not exists identity_provenance jsonb not null default '{}'::jsonb;

alter table public.public_member_profiles
  drop constraint if exists public_member_profiles_visibility_check;

update public.public_member_profiles
set username = coalesce(
      nullif(lower(btrim(username)), ''),
      nullif(lower(btrim(public_handle)), '')
    ),
    primary_role = case
      when lower(coalesce(primary_role, 'grower')) in ('grower', 'breeder', 'source', 'educator', 'researcher', 'community_contributor', 'industry_partner')
        then lower(primary_role)
      else 'grower'
    end,
    experience_level = case
      when lower(coalesce(experience_level, 'new')) in ('new', 'beginner', 'intermediate', 'experienced', 'expert')
        then lower(experience_level)
      else 'new'
    end,
    languages = public.normalize_grow_identity_text_array_v1(languages, 25),
    growing_environments = public.normalize_grow_identity_text_array_v1(growing_environments, 25),
    favorite_germination_methods = public.normalize_grow_identity_text_array_v1(favorite_germination_methods, 25),
    grow_interests = public.normalize_grow_identity_text_array_v1(grow_interests, 25),
    grow_goals = public.normalize_grow_identity_text_array_v1(grow_goals, 25),
    favorite_breeders = public.normalize_grow_identity_text_array_v1(favorite_breeders, 25),
    favorite_sources = public.normalize_grow_identity_text_array_v1(favorite_sources, 25),
    state_province = coalesce(nullif(btrim(state_province), ''), case
      when lower(coalesce(profile_visibility, '')) = 'public' then nullif(btrim(location_region), '')
      else null
    end),
    country = coalesce(nullif(btrim(country), ''), nullif(upper(btrim(country_code)), '')),
    profile_visibility = case
      when coalesce(show_profile_in_community_grow, true) = false then 'personal'
      when lower(coalesce(profile_visibility, '')) in ('private', 'personal') then 'personal'
      when lower(coalesce(profile_visibility, '')) = 'public' then 'public'
      when lower(coalesce(profile_visibility, '')) = 'connections' then 'connections'
      else 'connections'
    end,
    grow_network_discoverable = case
      when coalesce(show_profile_in_community_grow, true) = false
        or lower(coalesce(profile_visibility, '')) in ('private', 'personal') then false
      else coalesce(grow_network_discoverable, true)
    end,
    connection_request_permission = case
      when coalesce(allow_followers, true) = false then 'nobody'
      when lower(coalesce(connection_request_permission, 'anyone')) in ('anyone', 'mutual_connections', 'nobody')
        then lower(connection_request_permission)
      else 'anyone'
    end,
    invitation_preferences = public.grow_identity_default_invitation_preferences_v1() || coalesce(invitation_preferences, '{}'::jsonb),
    personalization_consent = coalesce(personalization_consent, false),
    identity_provenance = case
      when public.grow_identity_provenance_valid_v1(identity_provenance) then identity_provenance
      else '{}'::jsonb
    end,
    updated_at = timezone('utc', now());

update public.public_member_profiles
set show_profile_in_community_grow = profile_visibility <> 'personal',
    allow_followers = connection_request_permission <> 'nobody';

alter table public.public_member_profiles
  alter column profile_visibility set default 'connections';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'public_member_profiles_visibility_check' and conrelid = 'public.public_member_profiles'::regclass) then
    alter table public.public_member_profiles add constraint public_member_profiles_visibility_check check (profile_visibility in ('personal', 'connections', 'public'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'public_member_profiles_primary_role_check' and conrelid = 'public.public_member_profiles'::regclass) then
    alter table public.public_member_profiles add constraint public_member_profiles_primary_role_check check (primary_role in ('grower', 'breeder', 'source', 'educator', 'researcher', 'community_contributor', 'industry_partner'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'public_member_profiles_experience_level_check' and conrelid = 'public.public_member_profiles'::regclass) then
    alter table public.public_member_profiles add constraint public_member_profiles_experience_level_check check (experience_level in ('new', 'beginner', 'intermediate', 'experienced', 'expert'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'public_member_profiles_years_growing_check' and conrelid = 'public.public_member_profiles'::regclass) then
    alter table public.public_member_profiles add constraint public_member_profiles_years_growing_check check (years_growing is null or years_growing between 0 and 100);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'public_member_profiles_connection_permission_check' and conrelid = 'public.public_member_profiles'::regclass) then
    alter table public.public_member_profiles add constraint public_member_profiles_connection_permission_check check (connection_request_permission in ('anyone', 'mutual_connections', 'nobody'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'public_member_profiles_username_check' and conrelid = 'public.public_member_profiles'::regclass) then
    alter table public.public_member_profiles add constraint public_member_profiles_username_check check (username is null or username ~ '^[a-z0-9][a-z0-9-]{2,31}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'public_member_profiles_invitation_preferences_check' and conrelid = 'public.public_member_profiles'::regclass) then
    alter table public.public_member_profiles add constraint public_member_profiles_invitation_preferences_check check (public.grow_identity_invitation_preferences_valid_v1(invitation_preferences));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'public_member_profiles_identity_provenance_check' and conrelid = 'public.public_member_profiles'::regclass) then
    alter table public.public_member_profiles add constraint public_member_profiles_identity_provenance_check check (public.grow_identity_provenance_valid_v1(identity_provenance));
  end if;
end
$$;

create unique index if not exists public_member_profiles_username_unique_idx
  on public.public_member_profiles (lower(username))
  where username is not null and btrim(username) <> '';

create index if not exists public_member_profiles_grow_network_discovery_idx
  on public.public_member_profiles (grow_network_discoverable, profile_visibility, lower(display_name));

-- ---------------------------------------------------------------------------
-- 3. Extensible field visibility allowlist.
-- ---------------------------------------------------------------------------

create table if not exists public.grow_identity_field_visibility (
  user_id uuid not null references auth.users(id) on delete cascade,
  field_key text not null,
  visibility text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, field_key),
  constraint grow_identity_field_visibility_key_check check (field_key = any (public.grow_identity_field_keys_v1())),
  constraint grow_identity_field_visibility_value_check check (visibility in ('only_me', 'connections', 'public'))
);

alter table public.grow_identity_field_visibility enable row level security;

drop policy if exists "Owners can read Grow Identity field visibility" on public.grow_identity_field_visibility;
create policy "Owners can read Grow Identity field visibility"
on public.grow_identity_field_visibility
for select to authenticated
using (auth.uid() = user_id or public.current_user_is_admin());

revoke all privileges on table public.grow_identity_field_visibility from public, anon, authenticated, service_role;
grant select on table public.grow_identity_field_visibility to authenticated;

insert into public.grow_identity_field_visibility (user_id, field_key, visibility)
select
  profiles.user_id,
  field_keys.field_key,
  case
    when field_keys.field_key = 'city' then 'only_me'
    when field_keys.field_key in ('state_province', 'country') then 'public'
    when profiles.profile_visibility = 'public' then 'public'
    when profiles.profile_visibility = 'personal' then 'only_me'
    else case
      when field_keys.field_key in ('display_name', 'username', 'profile_image', 'recognitions') then 'public'
      else 'connections'
    end
  end
from public.public_member_profiles profiles
cross join unnest(public.grow_identity_field_keys_v1()) field_keys(field_key)
on conflict (user_id, field_key) do nothing;

create or replace function public.seed_grow_identity_field_visibility_v1()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.grow_identity_field_visibility (user_id, field_key, visibility)
  select
    new.user_id,
    field_key,
    case
      when field_key = 'city' then 'only_me'
      when field_key in ('state_province', 'country', 'display_name', 'username', 'profile_image', 'recognitions') then 'public'
      else 'connections'
    end
  from unnest(public.grow_identity_field_keys_v1()) keys(field_key)
  on conflict (user_id, field_key) do nothing;
  return new;
end;
$$;

revoke all on function public.seed_grow_identity_field_visibility_v1() from public, anon, authenticated, service_role;

drop trigger if exists public_member_profiles_seed_grow_identity_visibility on public.public_member_profiles;
create trigger public_member_profiles_seed_grow_identity_visibility
after insert on public.public_member_profiles
for each row execute function public.seed_grow_identity_field_visibility_v1();

-- Normalize direct legacy writes and protect system-owned identity state.
create or replace function public.sync_public_member_profiles_identity()
returns trigger
language plpgsql
set search_path = public
as $$
declare caller_is_admin boolean := false;
declare canonical_owner_update boolean := false;
begin
  if new.id is null and new.user_id is not null then new.id = new.user_id; end if;
  if new.user_id is null and new.id is not null then new.user_id = new.id; end if;

  caller_is_admin := coalesce(public.current_user_is_admin(), false);
  canonical_owner_update := current_user not in ('anon', 'authenticated');
  if tg_op = 'UPDATE' and auth.uid() is not null and not caller_is_admin then
    new.id := old.id;
    new.user_id := old.user_id;
  end if;
  if tg_op = 'INSERT' and auth.uid() is not null and not caller_is_admin then
    new.is_verified := false;
    new.reserved_grow_id := false;
    new.identity_provenance := '{}'::jsonb;
  end if;
  if tg_op = 'UPDATE' and auth.uid() is not null and not caller_is_admin then
    if new.is_verified is distinct from old.is_verified
      or new.reserved_grow_id is distinct from old.reserved_grow_id
      or (not canonical_owner_update and new.identity_provenance is distinct from old.identity_provenance) then
      raise exception 'System-managed Grow Identity fields cannot be changed by members' using errcode = '42501';
    end if;
  end if;

  new.display_name = nullif(btrim(coalesce(new.display_name, '')), '');
  new.bio = btrim(coalesce(new.bio, ''));
  new.avatar_url = btrim(coalesce(new.avatar_url, ''));
  new.cover_image_url = btrim(coalesce(new.cover_image_url, ''));
  new.location_region = btrim(coalesce(new.location_region, ''));
  new.country_code = nullif(upper(btrim(coalesce(new.country_code, ''))), '');
  new.city = nullif(btrim(coalesce(new.city, '')), '');
  new.state_province = nullif(btrim(coalesce(new.state_province, '')), '');
  new.country = nullif(btrim(coalesce(new.country, '')), '');
  new.timezone = nullif(btrim(coalesce(new.timezone, '')), '');
  if new.timezone is not null and not exists (select 1 from pg_timezone_names zones where zones.name = new.timezone) then
    raise exception 'Unsupported timezone' using errcode = '22023';
  end if;

  new.public_handle = nullif(lower(regexp_replace(regexp_replace(coalesce(new.public_handle, ''), '^@+', ''), '[^a-zA-Z0-9-]+', '-', 'g')), '');
  new.username = nullif(lower(regexp_replace(regexp_replace(coalesce(new.username, new.public_handle, ''), '^@+', ''), '[^a-zA-Z0-9-]+', '-', 'g')), '');
  if new.public_handle is null then new.public_handle = new.username; end if;

  new.primary_role = lower(coalesce(new.primary_role, 'grower'));
  new.experience_level = lower(coalesce(new.experience_level, 'new'));
  new.languages = public.normalize_grow_identity_text_array_v1(new.languages, 25);
  new.growing_environments = public.normalize_grow_identity_text_array_v1(new.growing_environments, 25);
  new.favorite_germination_methods = public.normalize_grow_identity_text_array_v1(new.favorite_germination_methods, 25);
  new.grow_interests = public.normalize_grow_identity_text_array_v1(new.grow_interests, 25);
  new.grow_goals = public.normalize_grow_identity_text_array_v1(new.grow_goals, 25);
  new.favorite_breeders = public.normalize_grow_identity_text_array_v1(new.favorite_breeders, 25);
  new.favorite_sources = public.normalize_grow_identity_text_array_v1(new.favorite_sources, 25);

  if tg_op = 'INSERT' and coalesce(new.show_profile_in_community_grow, true) = false then
    new.profile_visibility := 'personal';
  elsif tg_op = 'UPDATE' and new.profile_visibility is not distinct from old.profile_visibility
      and new.show_profile_in_community_grow is distinct from old.show_profile_in_community_grow then
    new.profile_visibility := case when coalesce(new.show_profile_in_community_grow, true) then 'public' else 'personal' end;
  elsif lower(coalesce(new.profile_visibility, 'connections')) in ('private', 'personal') then
    new.profile_visibility := 'personal';
  elsif lower(coalesce(new.profile_visibility, 'connections')) in ('connections', 'public') then
    new.profile_visibility := lower(new.profile_visibility);
  else
    raise exception 'Unsupported profile visibility' using errcode = '22023';
  end if;
  new.show_profile_in_community_grow = new.profile_visibility <> 'personal';
  if new.state_province is null and new.profile_visibility = 'public' then
    new.state_province := nullif(btrim(new.location_region), '');
  end if;
  if tg_op = 'INSERT' then
    new.connection_request_permission = case when coalesce(new.allow_followers, true) then 'anyone' else 'nobody' end;
  elsif new.allow_followers is distinct from old.allow_followers then
    new.connection_request_permission = case when coalesce(new.allow_followers, true) then 'anyone' else 'nobody' end;
  else
    new.connection_request_permission = lower(coalesce(new.connection_request_permission, 'anyone'));
  end if;
  new.allow_followers = new.connection_request_permission <> 'nobody';
  new.grow_network_discoverable = case when new.profile_visibility = 'personal' then false else coalesce(new.grow_network_discoverable, true) end;
  new.invitation_preferences = public.grow_identity_default_invitation_preferences_v1() || coalesce(new.invitation_preferences, '{}'::jsonb);
  new.personalization_consent = coalesce(new.personalization_consent, false);
  new.identity_provenance = coalesce(new.identity_provenance, '{}'::jsonb);
  new.profile_type = case
    when lower(coalesce(new.profile_type, new.account_type, 'grower')) in ('grower', 'source', 'breeder', 'organization', 'industry_partner', 'event')
      then lower(coalesce(new.profile_type, new.account_type, 'grower'))
    else 'grower'
  end;
  new.account_type = new.profile_type;
  new.is_verified = coalesce(new.is_verified, false);
  new.reserved_grow_id = coalesce(new.reserved_grow_id, false);
  new.joined_at = coalesce(new.joined_at, new.created_at, timezone('utc', now()));
  new.created_at = coalesce(new.created_at, timezone('utc', now()));
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function public.sync_public_member_profiles_identity() from public, anon, authenticated, service_role;

drop trigger if exists public_member_profiles_identity_sync on public.public_member_profiles;
create trigger public_member_profiles_identity_sync
before insert or update on public.public_member_profiles
for each row execute function public.sync_public_member_profiles_identity();

-- Existing grants exposed owner writes to PostgREST without matching INSERT or
-- UPDATE policies. Restore the owner row boundary and with-check invariant.
drop policy if exists "Owners can create their member identity" on public.public_member_profiles;
create policy "Owners can create their member identity"
on public.public_member_profiles
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Owners can update their member identity" on public.public_member_profiles;
create policy "Owners can update their member identity"
on public.public_member_profiles
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Profile editing retains its legacy direct path, but system verification,
-- reserved identity, and provenance are RPC/system-owned and not mass assignable.
revoke update on table public.public_member_profiles from authenticated;
grant update (
  id, user_id, display_name, avatar_url, joined_at, notify_community_activity,
  show_profile_in_community_grow, allow_followers, show_grow_stats_publicly,
  bio, public_handle, location_region, profile_visibility, country_code,
  vault_theme, profile_type, account_type, grow_id_qr_data_url,
  grow_id_qr_profile_url, grow_id_qr_updated_at, username, cover_image_url,
  primary_role, experience_level, years_growing, languages,
  growing_environments, favorite_germination_methods, grow_interests,
  grow_goals, favorite_breeders, favorite_sources, city, state_province,
  country, timezone, grow_network_discoverable, connection_request_permission,
  invitation_preferences, personalization_consent
) on public.public_member_profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Relationship and field-resolution helpers. Viewer UUIDs are accepted only
-- by owner-internal helpers; browser RPCs always derive auth.uid() server-side.
-- ---------------------------------------------------------------------------

create or replace function public.grow_identity_is_connection_v1(owner_user_id uuid, viewer_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select owner_user_id is not null and viewer_user_id is not null and owner_user_id <> viewer_user_id
    and exists (select 1 from public.grow_follows where follower_id = owner_user_id and following_id = viewer_user_id)
    and exists (select 1 from public.grow_follows where follower_id = viewer_user_id and following_id = owner_user_id);
$$;

create or replace function public.grow_identity_has_mutual_connection_v1(first_user_id uuid, second_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users candidate
    where candidate.id not in (first_user_id, second_user_id)
      and public.grow_identity_is_connection_v1(first_user_id, candidate.id)
      and public.grow_identity_is_connection_v1(second_user_id, candidate.id)
  );
$$;

create or replace function public.grow_identity_field_visible_v1(owner_user_id uuid, field_name text, viewer_scope text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare configured_visibility text;
begin
  if field_name <> all (public.grow_identity_field_keys_v1()) then return false; end if;
  select visibility into configured_visibility
  from public.grow_identity_field_visibility
  where user_id = owner_user_id and field_key = field_name;
  configured_visibility := coalesce(configured_visibility, case
    when field_name = 'city' then 'only_me'
    when field_name in ('state_province', 'country', 'display_name', 'username', 'profile_image', 'recognitions') then 'public'
    else 'connections'
  end);
  return case viewer_scope
    when 'only_me' then true
    when 'connections' then configured_visibility in ('connections', 'public')
    else configured_visibility = 'public'
  end;
end;
$$;

revoke all on function public.grow_identity_is_connection_v1(uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.grow_identity_has_mutual_connection_v1(uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.grow_identity_field_visible_v1(uuid, text, text) from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 5. Viewer-aware read contract. Only authorized fields enter the result JSON.
-- ---------------------------------------------------------------------------

create or replace function public.get_grow_identity_v1(owner_user_id uuid, read_context text default 'direct')
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  viewer_user_id uuid := auth.uid();
  profile_record record;
  caller_is_admin boolean := false;
  viewer_is_owner boolean := false;
  viewer_is_connection boolean := false;
  viewer_has_vault_share boolean := false;
  viewer_scope text := 'public';
  relationship_label text := 'member';
  fields jsonb := '{}'::jsonb;
  location_fields jsonb := '{}'::jsonb;
  visible_city text;
  visible_state text;
  visible_country text;
  recognition_rows jsonb := '[]'::jsonb;
  visibility_rows jsonb := '{}'::jsonb;
begin
  if viewer_user_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if owner_user_id is null then return null; end if;
  if lower(coalesce(read_context, 'direct')) not in ('direct', 'network_search', 'community_attribution', 'vault_share') then
    raise exception 'Unsupported Grow Identity read context' using errcode = '22023';
  end if;

  select member.*, private_profile.username as private_username
  into profile_record
  from public.public_member_profiles member
  inner join public.profiles private_profile on private_profile.id = member.user_id
  where member.user_id = owner_user_id
    and coalesce(private_profile.account_status, 'active') = 'active'
    and coalesce(private_profile.deletion_status, '') <> 'deleted';
  if not found then return null; end if;

  caller_is_admin := coalesce(public.current_user_is_admin(), false);
  viewer_is_owner := viewer_user_id = owner_user_id;
  viewer_is_connection := public.grow_identity_is_connection_v1(owner_user_id, viewer_user_id);
  select exists (
    select 1 from public.seed_vault_share_users
    where seed_vault_share_users.owner_user_id = get_grow_identity_v1.owner_user_id
      and seed_vault_share_users.shared_with_user_id = viewer_user_id
  ) into viewer_has_vault_share;

  if lower(read_context) = 'network_search' then
    if not profile_record.grow_network_discoverable or profile_record.profile_visibility = 'personal' then return null; end if;
  elsif not (viewer_is_owner or caller_is_admin or viewer_has_vault_share) then
    if profile_record.profile_visibility = 'personal' then return null; end if;
    if profile_record.profile_visibility = 'connections' and not viewer_is_connection then return null; end if;
  end if;

  if viewer_is_owner or caller_is_admin then
    viewer_scope := 'only_me';
    relationship_label := case when viewer_is_owner then 'owner' else 'administrator' end;
  elsif viewer_is_connection then
    viewer_scope := 'connections';
    relationship_label := 'connection';
  elsif viewer_has_vault_share then
    viewer_scope := 'public';
    relationship_label := 'shared_vault';
  else
    viewer_scope := 'public';
    relationship_label := 'member';
  end if;

  if public.grow_identity_field_visible_v1(owner_user_id, 'display_name', viewer_scope) then fields := fields || jsonb_build_object('display_name', profile_record.display_name); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'username', viewer_scope) then fields := fields || jsonb_build_object('username', coalesce(profile_record.username, profile_record.public_handle, profile_record.private_username)); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'profile_image', viewer_scope) then fields := fields || jsonb_build_object('profile_image_url', profile_record.avatar_url); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'cover_image', viewer_scope) then fields := fields || jsonb_build_object('cover_image_url', profile_record.cover_image_url); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'bio', viewer_scope) then fields := fields || jsonb_build_object('bio', profile_record.bio); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'primary_role', viewer_scope) then fields := fields || jsonb_build_object('primary_role', profile_record.primary_role); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'experience_level', viewer_scope) then fields := fields || jsonb_build_object('experience_level', profile_record.experience_level); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'years_growing', viewer_scope) then fields := fields || jsonb_build_object('years_growing', profile_record.years_growing); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'languages', viewer_scope) then fields := fields || jsonb_build_object('languages', to_jsonb(profile_record.languages)); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'growing_environments', viewer_scope) then fields := fields || jsonb_build_object('growing_environments', to_jsonb(profile_record.growing_environments)); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'favorite_methods', viewer_scope) then fields := fields || jsonb_build_object('favorite_methods', to_jsonb(profile_record.favorite_germination_methods)); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'grow_interests', viewer_scope) then fields := fields || jsonb_build_object('grow_interests', to_jsonb(profile_record.grow_interests)); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'grow_goals', viewer_scope) then fields := fields || jsonb_build_object('grow_goals', to_jsonb(profile_record.grow_goals)); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'favorite_breeders', viewer_scope) then fields := fields || jsonb_build_object('favorite_breeders', to_jsonb(profile_record.favorite_breeders)); end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'favorite_sources', viewer_scope) then fields := fields || jsonb_build_object('favorite_sources', to_jsonb(profile_record.favorite_sources)); end if;

  if public.grow_identity_field_visible_v1(owner_user_id, 'city', viewer_scope) then visible_city := profile_record.city; end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'state_province', viewer_scope) then visible_state := profile_record.state_province; end if;
  if public.grow_identity_field_visible_v1(owner_user_id, 'country', viewer_scope) then visible_country := coalesce(profile_record.country, profile_record.country_code); end if;
  if visible_city is not null then location_fields := location_fields || jsonb_build_object('city', visible_city); end if;
  if visible_state is not null then location_fields := location_fields || jsonb_build_object('state_province', visible_state); end if;
  if visible_country is not null then location_fields := location_fields || jsonb_build_object('country', visible_country, 'country_code', profile_record.country_code); end if;
  if visible_city is not null or visible_state is not null or visible_country is not null then
    location_fields := location_fields || jsonb_build_object('display', concat_ws(', ', visible_city, visible_state, visible_country));
    fields := fields || jsonb_build_object('location', location_fields);
  end if;

  if public.grow_identity_field_visible_v1(owner_user_id, 'recognitions', viewer_scope) then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', definitions.id,
      'title', definitions.title,
      'category', definitions.category,
      'icon', definitions.icon,
      'rarity', definitions.rarity,
      'earned_at', records.earned_at,
      'featured', records.featured,
      'provenance', records.assignment_source
    ) order by records.featured desc, definitions.display_priority desc, records.earned_at desc), '[]'::jsonb)
    into recognition_rows
    from public.user_recognitions records
    inner join public.recognition_definitions definitions on definitions.id = records.recognition_id
    where records.user_id = owner_user_id and records.revoked_at is null
      and (not definitions.hidden or viewer_is_owner or caller_is_admin);
    fields := fields || jsonb_build_object('recognitions', recognition_rows);
  end if;

  if viewer_is_owner or caller_is_admin then
    select coalesce(jsonb_object_agg(field_key, visibility), '{}'::jsonb)
    into visibility_rows from public.grow_identity_field_visibility where user_id = owner_user_id;
  end if;

  return jsonb_strip_nulls(jsonb_build_object(
    'version', 'grow-identity.v1',
    'owner_user_id', owner_user_id,
    'viewer_relationship', relationship_label,
    'read_context', lower(coalesce(read_context, 'direct')),
    'profile_visibility', profile_record.profile_visibility,
    'grow_network_discoverable', profile_record.grow_network_discoverable,
    'fields', fields,
    'system_identity', jsonb_build_object(
      'profile_type', profile_record.profile_type,
      'is_verified', profile_record.is_verified
    ),
    'field_visibility', case when viewer_is_owner or caller_is_admin then visibility_rows else null end,
    'preferences', case when viewer_is_owner or caller_is_admin then jsonb_build_object(
      'connection_request_permission', profile_record.connection_request_permission,
      'invitation_preferences', profile_record.invitation_preferences,
      'personalization_consent', profile_record.personalization_consent,
      'timezone', profile_record.timezone
    ) else null end,
    'provenance', case when viewer_is_owner or caller_is_admin then profile_record.identity_provenance else null end,
    'created_at', profile_record.created_at,
    'updated_at', profile_record.updated_at
  ));
end;
$$;

create or replace function public.get_my_grow_identity()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  return public.get_grow_identity_v1(auth.uid(), 'direct');
end;
$$;

create or replace function public.search_grow_identities_v1(search_query text default '', result_limit integer default 20)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare normalized_query text := lower(btrim(coalesce(search_query, ''))); result jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select coalesce(jsonb_agg(rows.identity order by rows.sort_name), '[]'::jsonb)
  into result
  from (
    select
      lower(coalesce(profiles.display_name, profiles.username, profiles.public_handle, '')) as sort_name,
      public.get_grow_identity_v1(profiles.user_id, 'network_search') as identity
    from public.public_member_profiles profiles
    where profiles.grow_network_discoverable
      and profiles.profile_visibility in ('connections', 'public')
      and (
        normalized_query = ''
        or lower(coalesce(profiles.display_name, '')) like '%' || normalized_query || '%'
        or lower(coalesce(profiles.username, profiles.public_handle, '')) like '%' || regexp_replace(normalized_query, '^@+', '') || '%'
      )
    order by lower(coalesce(profiles.display_name, profiles.username, profiles.public_handle, ''))
    limit greatest(1, least(coalesce(result_limit, 20), 50))
  ) rows
  where rows.identity is not null;
  return result;
end;
$$;

create or replace function public.can_request_grow_connection_v1(target_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare requester uuid := auth.uid(); permission text;
begin
  if requester is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if target_user_id is null or target_user_id = requester then return false; end if;
  select connection_request_permission into permission
  from public.public_member_profiles where user_id = target_user_id;
  if permission is null or permission = 'nobody' then return false; end if;
  if permission = 'anyone' then return true; end if;
  return public.grow_identity_has_mutual_connection_v1(requester, target_user_id);
end;
$$;

revoke all on function public.get_grow_identity_contract_v1() from public, anon, authenticated, service_role;
revoke all on function public.get_grow_identity_v1(uuid, text) from public, anon, authenticated, service_role;
revoke all on function public.get_my_grow_identity() from public, anon, authenticated, service_role;
revoke all on function public.search_grow_identities_v1(text, integer) from public, anon, authenticated, service_role;
revoke all on function public.can_request_grow_connection_v1(uuid) from public, anon, authenticated, service_role;
grant execute on function public.get_grow_identity_contract_v1() to authenticated;
grant execute on function public.get_grow_identity_v1(uuid, text) to authenticated;
grant execute on function public.get_my_grow_identity() to authenticated;
grant execute on function public.search_grow_identities_v1(text, integer) to authenticated;
grant execute on function public.can_request_grow_connection_v1(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Canonical owner update path. No owner UUID or system-owned field is
-- accepted from the caller, and arbitrary JSON keys are rejected.
-- ---------------------------------------------------------------------------

create or replace function public.update_my_grow_identity_v1(identity_input jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_user_id uuid := auth.uid();
  payload jsonb := coalesce(identity_input, '{}'::jsonb);
  invalid_key text;
  normalized_username text;
  visibility_item record;
  provenance_key text;
  provenance_field_key text;
begin
  if owner_user_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if jsonb_typeof(payload) <> 'object' then raise exception 'Grow Identity update must be an object' using errcode = '22023'; end if;

  select key into invalid_key
  from jsonb_object_keys(payload) key
  where key <> all (array[
    'display_name', 'username', 'bio', 'profile_image_url', 'cover_image_url',
    'primary_role', 'experience_level', 'years_growing', 'languages',
    'growing_environments', 'favorite_methods', 'grow_interests', 'grow_goals',
    'favorite_breeders', 'favorite_sources', 'city', 'state_province', 'country',
    'country_code', 'timezone', 'profile_visibility', 'grow_network_discoverable',
    'connection_request_permission', 'invitation_preferences',
    'personalization_consent', 'field_visibility'
  ]::text[])
  limit 1;
  if invalid_key is not null then raise exception 'Unsupported Grow Identity field: %', invalid_key using errcode = '22023'; end if;

  if payload ? 'username' then
    normalized_username := nullif(lower(regexp_replace(regexp_replace(coalesce(payload ->> 'username', ''), '^@+', ''), '[^a-zA-Z0-9-]+', '-', 'g')), '');
    if normalized_username is null or normalized_username !~ '^[a-z0-9][a-z0-9-]{2,31}$' then
      raise exception 'Username must be 3-32 lowercase letters, numbers, or hyphens' using errcode = '22023';
    end if;
    if exists (select 1 from public.public_member_profiles where lower(username) = normalized_username and user_id <> owner_user_id) then
      raise exception 'Username is already in use' using errcode = '23505';
    end if;
  end if;

  if payload ? 'primary_role' and lower(coalesce(payload ->> 'primary_role', '')) not in ('grower', 'breeder', 'source', 'educator', 'researcher', 'community_contributor', 'industry_partner') then
    raise exception 'Unsupported primary role' using errcode = '22023';
  end if;
  if payload ? 'experience_level' and lower(coalesce(payload ->> 'experience_level', '')) not in ('new', 'beginner', 'intermediate', 'experienced', 'expert') then
    raise exception 'Unsupported experience level' using errcode = '22023';
  end if;
  if payload ? 'profile_visibility' and lower(coalesce(payload ->> 'profile_visibility', '')) not in ('personal', 'connections', 'public') then
    raise exception 'Unsupported profile visibility' using errcode = '22023';
  end if;
  if payload ? 'connection_request_permission' and lower(coalesce(payload ->> 'connection_request_permission', '')) not in ('anyone', 'mutual_connections', 'nobody') then
    raise exception 'Unsupported connection request permission' using errcode = '22023';
  end if;
  if payload ? 'invitation_preferences' and not public.grow_identity_invitation_preferences_valid_v1(payload -> 'invitation_preferences') then
    raise exception 'Unsupported invitation preference' using errcode = '22023';
  end if;
  if payload ? 'field_visibility' then
    if jsonb_typeof(payload -> 'field_visibility') <> 'object' then raise exception 'Field visibility must be an object' using errcode = '22023'; end if;
    for visibility_item in select key, value from jsonb_each_text(payload -> 'field_visibility') loop
      if visibility_item.key <> all (public.grow_identity_field_keys_v1()) then raise exception 'Unsupported field visibility key: %', visibility_item.key using errcode = '22023'; end if;
      if visibility_item.value not in ('only_me', 'connections', 'public') then raise exception 'Unsupported field visibility value for %', visibility_item.key using errcode = '22023'; end if;
    end loop;
  end if;

  insert into public.public_member_profiles (id, user_id, display_name, public_handle, username)
  select owner_user_id, owner_user_id, nullif(btrim(coalesce(private_profile.username, '')), ''), normalized_username, normalized_username
  from public.profiles private_profile where private_profile.id = owner_user_id
  on conflict (user_id) do nothing;

  update public.public_member_profiles profiles
  set display_name = case when payload ? 'display_name' then nullif(btrim(payload ->> 'display_name'), '') else profiles.display_name end,
      username = case when payload ? 'username' then normalized_username else profiles.username end,
      public_handle = case when payload ? 'username' then normalized_username else profiles.public_handle end,
      bio = case when payload ? 'bio' then btrim(coalesce(payload ->> 'bio', '')) else profiles.bio end,
      avatar_url = case when payload ? 'profile_image_url' then btrim(coalesce(payload ->> 'profile_image_url', '')) else profiles.avatar_url end,
      cover_image_url = case when payload ? 'cover_image_url' then btrim(coalesce(payload ->> 'cover_image_url', '')) else profiles.cover_image_url end,
      primary_role = case when payload ? 'primary_role' then lower(payload ->> 'primary_role') else profiles.primary_role end,
      experience_level = case when payload ? 'experience_level' then lower(payload ->> 'experience_level') else profiles.experience_level end,
      years_growing = case when payload ? 'years_growing' then nullif(payload ->> 'years_growing', '')::integer else profiles.years_growing end,
      languages = case when payload ? 'languages' then public.normalize_grow_identity_json_text_array_v1(payload -> 'languages', 25) else profiles.languages end,
      growing_environments = case when payload ? 'growing_environments' then public.normalize_grow_identity_json_text_array_v1(payload -> 'growing_environments', 25) else profiles.growing_environments end,
      favorite_germination_methods = case when payload ? 'favorite_methods' then public.normalize_grow_identity_json_text_array_v1(payload -> 'favorite_methods', 25) else profiles.favorite_germination_methods end,
      grow_interests = case when payload ? 'grow_interests' then public.normalize_grow_identity_json_text_array_v1(payload -> 'grow_interests', 25) else profiles.grow_interests end,
      grow_goals = case when payload ? 'grow_goals' then public.normalize_grow_identity_json_text_array_v1(payload -> 'grow_goals', 25) else profiles.grow_goals end,
      favorite_breeders = case when payload ? 'favorite_breeders' then public.normalize_grow_identity_json_text_array_v1(payload -> 'favorite_breeders', 25) else profiles.favorite_breeders end,
      favorite_sources = case when payload ? 'favorite_sources' then public.normalize_grow_identity_json_text_array_v1(payload -> 'favorite_sources', 25) else profiles.favorite_sources end,
      city = case when payload ? 'city' then nullif(btrim(payload ->> 'city'), '') else profiles.city end,
      state_province = case when payload ? 'state_province' then nullif(btrim(payload ->> 'state_province'), '') else profiles.state_province end,
      country = case when payload ? 'country' then nullif(btrim(payload ->> 'country'), '') else profiles.country end,
      country_code = case when payload ? 'country_code' then nullif(upper(btrim(payload ->> 'country_code')), '') else profiles.country_code end,
      timezone = case when payload ? 'timezone' then nullif(btrim(payload ->> 'timezone'), '') else profiles.timezone end,
      profile_visibility = case when payload ? 'profile_visibility' then lower(payload ->> 'profile_visibility') else profiles.profile_visibility end,
      grow_network_discoverable = case when payload ? 'grow_network_discoverable' then (payload ->> 'grow_network_discoverable')::boolean else profiles.grow_network_discoverable end,
      connection_request_permission = case when payload ? 'connection_request_permission' then lower(payload ->> 'connection_request_permission') else profiles.connection_request_permission end,
      invitation_preferences = case when payload ? 'invitation_preferences' then public.grow_identity_default_invitation_preferences_v1() || (payload -> 'invitation_preferences') else profiles.invitation_preferences end,
      personalization_consent = case when payload ? 'personalization_consent' then (payload ->> 'personalization_consent')::boolean else profiles.personalization_consent end
  where profiles.user_id = owner_user_id;

  if payload ? 'username' then update public.profiles set username = normalized_username, updated_at = timezone('utc', now()) where id = owner_user_id; end if;

  if payload ? 'field_visibility' then
    for visibility_item in select key, value from jsonb_each_text(payload -> 'field_visibility') loop
      insert into public.grow_identity_field_visibility (user_id, field_key, visibility, updated_at)
      values (owner_user_id, visibility_item.key, visibility_item.value, timezone('utc', now()))
      on conflict (user_id, field_key) do update set visibility = excluded.visibility, updated_at = excluded.updated_at;
    end loop;
  end if;

  for provenance_key in select keys.key from jsonb_object_keys(payload) keys(key)
    where keys.key = any (array[
      'display_name', 'username', 'bio', 'profile_image_url', 'cover_image_url',
      'primary_role', 'experience_level', 'years_growing', 'languages',
      'growing_environments', 'favorite_methods', 'grow_interests', 'grow_goals',
      'favorite_breeders', 'favorite_sources', 'city', 'state_province', 'country'
    ]::text[])
  loop
    provenance_field_key := case provenance_key
      when 'profile_image_url' then 'profile_image'
      when 'cover_image_url' then 'cover_image'
      else provenance_key
    end;
    update public.public_member_profiles
    set identity_provenance = identity_provenance || jsonb_build_object(
      provenance_field_key,
      jsonb_build_object('source', 'self_declared', 'updated_at', timezone('utc', now()))
    )
    where user_id = owner_user_id;
  end loop;

  return public.get_grow_identity_v1(owner_user_id, 'direct');
end;
$$;

revoke all on function public.update_my_grow_identity_v1(jsonb) from public, anon, authenticated, service_role;
grant execute on function public.update_my_grow_identity_v1(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Preserve the legacy safe profile projection without leaking field-private
-- data. Connections-only profiles move to the authenticated search RPC.
-- ---------------------------------------------------------------------------

drop view if exists public.safe_public_member_profiles;

create view public.safe_public_member_profiles as
select
  profiles.id,
  profiles.user_id,
  case when coalesce(field_visibility.values ->> 'display_name', 'public') = 'public' then profiles.display_name else null end as display_name,
  case when coalesce(field_visibility.values ->> 'profile_image', 'public') = 'public' then profiles.avatar_url else '' end as avatar_url,
  case when coalesce(field_visibility.values ->> 'bio', 'connections') = 'public' then profiles.bio else '' end as bio,
  case when coalesce(field_visibility.values ->> 'username', 'public') = 'public' then profiles.public_handle else null end as public_handle,
  coalesce(
    case when coalesce(field_visibility.values ->> 'state_province', 'public') = 'public' then profiles.state_province else null end,
    case when coalesce(field_visibility.values ->> 'country', 'public') = 'public' then coalesce(profiles.country, profiles.country_code) else null end,
    ''
  ) as location_region,
  case when coalesce(field_visibility.values ->> 'country', 'public') = 'public' then profiles.country_code else null end as country_code,
  profiles.profile_visibility,
  profiles.vault_theme,
  profiles.joined_at,
  profiles.show_profile_in_community_grow,
  case when coalesce(field_visibility.values ->> 'activity_summary', 'connections') = 'public' then profiles.show_grow_stats_publicly else false end as show_grow_stats_publicly,
  profiles.created_at,
  profiles.updated_at,
  profiles.account_type,
  profiles.profile_type,
  profiles.is_verified,
  profiles.reserved_grow_id,
  profiles.username,
  profiles.grow_network_discoverable
from public.public_member_profiles profiles
left join lateral (
  select coalesce(jsonb_object_agg(visibility.field_key, visibility.visibility), '{}'::jsonb) as values
  from public.grow_identity_field_visibility visibility
  where visibility.user_id = profiles.user_id
) field_visibility on true
where profiles.show_profile_in_community_grow
  and profiles.profile_visibility = 'public'
  and coalesce(field_visibility.values ->> 'display_name', 'public') = 'public'
  and nullif(btrim(coalesce(profiles.display_name, '')), '') is not null
  and exists (
    select 1 from public.profiles private_profile
    where private_profile.id = profiles.user_id
      and coalesce(private_profile.account_status, 'active') = 'active'
      and coalesce(private_profile.deletion_status, '') <> 'deleted'
  );

comment on view public.safe_public_member_profiles is
  'Legacy public profile projection. Only explicitly public profiles and fields are returned; authenticated connections use get_grow_identity_v1.';

revoke all privileges on table public.safe_public_member_profiles from public, anon, authenticated, service_role;
grant select on table public.safe_public_member_profiles to anon, authenticated;

-- Repair the legacy Recognition wrapper so it cannot bypass canonical profile
-- or field visibility. Anonymous behavior remains only for explicitly public
-- profiles as required by the existing public-profile URL contract.
create or replace function public.get_public_identity_and_recognition(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  viewer uuid := auth.uid();
  profile_record record;
  caller_is_admin boolean := false;
  scope text := 'public';
  recognition_payload jsonb;
  canonical_identity jsonb;
begin
  select * into profile_record from public.public_member_profiles where user_id = p_user_id;
  if not found then return null; end if;
  caller_is_admin := coalesce(public.current_user_is_admin(), false);
  if viewer is null then
    if profile_record.profile_visibility <> 'public'
      or not public.grow_identity_field_visible_v1(p_user_id, 'recognitions', 'public') then return null; end if;
  else
    canonical_identity := public.get_grow_identity_v1(p_user_id, 'direct');
    if canonical_identity is null or not coalesce((canonical_identity -> 'fields') ? 'recognitions', false) then return null; end if;
    scope := case
      when viewer = p_user_id or caller_is_admin then 'only_me'
      when public.grow_identity_is_connection_v1(p_user_id, viewer) then 'connections'
      else 'public'
    end;
  end if;

  recognition_payload := public.get_identity_and_recognition_v1(p_user_id, viewer = p_user_id or caller_is_admin, caller_is_admin);
  if scope <> 'only_me' then
    recognition_payload := jsonb_set(
      recognition_payload,
      '{recognitions}',
      coalesce((select jsonb_agg(item) from jsonb_array_elements(coalesce(recognition_payload -> 'recognitions', '[]'::jsonb)) item where coalesce((item ->> 'hidden')::boolean, false) = false), '[]'::jsonb)
    );
  end if;
  return recognition_payload;
end;
$$;

revoke all on function public.get_public_identity_and_recognition(uuid) from public, service_role;
grant execute on function public.get_public_identity_and_recognition(uuid) to anon, authenticated;

revoke all on function public.grow_identity_field_keys_v1() from public, anon, authenticated, service_role;
revoke all on function public.grow_identity_default_invitation_preferences_v1() from public, anon, authenticated, service_role;
revoke all on function public.grow_identity_invitation_preferences_valid_v1(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.grow_identity_provenance_valid_v1(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_grow_identity_text_array_v1(text[], integer) from public, anon, authenticated, service_role;
revoke all on function public.normalize_grow_identity_json_text_array_v1(jsonb, integer) from public, anon, authenticated, service_role;
grant execute on function public.grow_identity_field_keys_v1() to authenticated;
grant execute on function public.grow_identity_default_invitation_preferences_v1() to authenticated;
grant execute on function public.grow_identity_invitation_preferences_valid_v1(jsonb) to authenticated;
grant execute on function public.grow_identity_provenance_valid_v1(jsonb) to authenticated;
grant execute on function public.normalize_grow_identity_text_array_v1(text[], integer) to authenticated;
grant execute on function public.normalize_grow_identity_json_text_array_v1(jsonb, integer) to authenticated;

comment on column public.public_member_profiles.profile_visibility is
  'Canonical profile visibility: personal, accepted connections, or signed-in Grow members. Field visibility remains authoritative within each scope.';
comment on column public.public_member_profiles.grow_network_discoverable is
  'Independent ordinary Grow Network search/discovery preference. Does not delete or invalidate existing relationships.';
comment on column public.public_member_profiles.identity_provenance is
  'Versionable per-field provenance metadata. Self-declared data is never equivalent to Recognition or verified system identity.';
comment on table public.grow_identity_field_visibility is
  'Allowlisted, extensible Grow Identity field visibility. Mutations occur through update_my_grow_identity_v1.';

notify pgrst, 'reload schema';
