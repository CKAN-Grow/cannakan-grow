-- Grow ID verified profile foundation.
-- Additive only: prepares public profiles for verified Sources, breeders, organizations,
-- industry partners, and events while defaulting normal users to grower profiles.

alter table public.profiles
  add column if not exists profile_setup_complete boolean not null default false;

update public.profiles
set profile_setup_complete = true
where nullif(btrim(coalesce(username, '')), '') is not null
  and coalesce(profile_setup_complete, false) = false;

alter table public.public_member_profiles
  add column if not exists profile_type text not null default 'grower';

alter table public.public_member_profiles
  add column if not exists account_type text not null default 'grower';

alter table public.public_member_profiles
  add column if not exists is_verified boolean not null default false;

alter table public.public_member_profiles
  add column if not exists reserved_grow_id boolean not null default false;

update public.public_member_profiles
set profile_type = case
      when lower(coalesce(profile_type, account_type, 'grower')) in ('grower', 'source', 'breeder', 'organization', 'industry_partner', 'event')
        then lower(coalesce(profile_type, account_type, 'grower'))
      else 'grower'
    end,
    account_type = case
      when lower(coalesce(account_type, profile_type, 'grower')) in ('grower', 'source', 'breeder', 'organization', 'industry_partner', 'event')
        then lower(coalesce(account_type, profile_type, 'grower'))
      else 'grower'
    end,
    is_verified = coalesce(is_verified, false),
    reserved_grow_id = coalesce(reserved_grow_id, false),
    public_handle = nullif(lower(regexp_replace(regexp_replace(coalesce(public_handle, ''), '^@+', ''), '[^a-zA-Z0-9-]+', '-', 'g')), ''),
    updated_at = timezone('utc', now());

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'public_member_profiles_profile_type_check'
      and conrelid = 'public.public_member_profiles'::regclass
  ) then
    alter table public.public_member_profiles
      add constraint public_member_profiles_profile_type_check
      check (profile_type in ('grower', 'source', 'breeder', 'organization', 'industry_partner', 'event'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'public_member_profiles_account_type_check'
      and conrelid = 'public.public_member_profiles'::regclass
  ) then
    alter table public.public_member_profiles
      add constraint public_member_profiles_account_type_check
      check (account_type in ('grower', 'source', 'breeder', 'organization', 'industry_partner', 'event'));
  end if;
end
$$;

create or replace function public.sync_public_member_profiles_identity()
returns trigger
language plpgsql
as $$
begin
  if new.id is null and new.user_id is not null then
    new.id = new.user_id;
  elsif new.user_id is null and new.id is not null then
    new.user_id = new.id;
  elsif new.id is not null and new.user_id is not null and new.id is distinct from new.user_id then
    new.user_id = new.id;
  end if;

  if new.created_at is null then
    new.created_at = timezone('utc', now());
  end if;

  if new.joined_at is null then
    new.joined_at = coalesce(new.created_at, timezone('utc', now()));
  end if;

  new.bio = coalesce(new.bio, '');
  new.location_region = coalesce(new.location_region, '');
  new.country_code = nullif(upper(btrim(coalesce(new.country_code, ''))), '');
  new.public_handle = nullif(lower(regexp_replace(regexp_replace(coalesce(new.public_handle, ''), '^@+', ''), '[^a-zA-Z0-9-]+', '-', 'g')), '');
  new.profile_type = case
    when lower(coalesce(new.profile_type, new.account_type, 'grower')) in ('grower', 'source', 'breeder', 'organization', 'industry_partner', 'event')
      then lower(coalesce(new.profile_type, new.account_type, 'grower'))
    else 'grower'
  end;
  new.account_type = new.profile_type;
  new.is_verified = coalesce(new.is_verified, false);
  new.reserved_grow_id = coalesce(new.reserved_grow_id, false);
  new.profile_visibility = case
    when coalesce(new.show_profile_in_community_grow, true) = false then 'private'
    when lower(coalesce(new.profile_visibility, 'public')) = 'private' then 'private'
    else 'public'
  end;

  return new;
end;
$$;

create or replace view public.safe_public_member_profiles as
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
  joined_at,
  show_profile_in_community_grow,
  show_grow_stats_publicly,
  created_at,
  updated_at,
  account_type,
  profile_type,
  is_verified,
  reserved_grow_id
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

comment on column public.public_member_profiles.profile_type is
  'Grow profile identity type. Normal user profiles default to grower; verified organizations may be assigned by administrators.';

comment on column public.public_member_profiles.account_type is
  'User-facing Grow account type selected during onboarding. Kept in sync with profile_type for compatibility.';

comment on column public.public_member_profiles.is_verified is
  'Administrator-controlled verification flag for official Grow identity profiles.';

comment on column public.public_member_profiles.reserved_grow_id is
  'Administrator-controlled flag allowing a profile to hold a reserved Grow ID.';

comment on column public.profiles.profile_setup_complete is
  'Private onboarding completion flag. Once true, Grow Profile Setup no longer gates normal app navigation.';
