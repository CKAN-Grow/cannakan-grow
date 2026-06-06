-- Add country-code support for Community Grow public profiles.
-- Additive only: legacy location_region is preserved for compatibility.

alter table public.public_member_profiles
  add column if not exists country_code text;

update public.public_member_profiles
set country_code = case
    when country_code is not null and btrim(country_code) ~* '^[a-z]{2}$' then upper(btrim(country_code))
    when btrim(coalesce(location_region, '')) ~* '^[a-z]{2}$' then upper(btrim(location_region))
    when lower(btrim(coalesce(location_region, ''))) in ('america', 'usa', 'u.s.a.', 'u.s.', 'us', 'united states', 'united states of america') then 'US'
    when lower(btrim(coalesce(location_region, ''))) in ('canada', 'ca') then 'CA'
    when lower(btrim(coalesce(location_region, ''))) in ('germany', 'deutschland', 'de') then 'DE'
    when lower(btrim(coalesce(location_region, ''))) in ('austria', 'osterreich', 'at') then 'AT'
    when lower(btrim(coalesce(location_region, ''))) in ('united kingdom', 'uk', 'great britain', 'england', 'scotland', 'wales', 'gb') then 'GB'
    when lower(btrim(coalesce(location_region, ''))) in ('ireland', 'ie') then 'IE'
    when lower(btrim(coalesce(location_region, ''))) in ('france', 'fr') then 'FR'
    when lower(btrim(coalesce(location_region, ''))) in ('spain', 'es') then 'ES'
    when lower(btrim(coalesce(location_region, ''))) in ('italy', 'it') then 'IT'
    when lower(btrim(coalesce(location_region, ''))) in ('netherlands', 'holland', 'nl') then 'NL'
    when lower(btrim(coalesce(location_region, ''))) in ('belgium', 'be') then 'BE'
    when lower(btrim(coalesce(location_region, ''))) in ('switzerland', 'ch') then 'CH'
    when lower(btrim(coalesce(location_region, ''))) in ('australia', 'au') then 'AU'
    when lower(btrim(coalesce(location_region, ''))) in ('new zealand', 'nz') then 'NZ'
    when lower(btrim(coalesce(location_region, ''))) in ('mexico', 'mx') then 'MX'
    when lower(btrim(coalesce(location_region, ''))) in ('brazil', 'br') then 'BR'
    else null
  end,
  updated_at = timezone('utc', now())
where country_code is null
  and nullif(btrim(coalesce(location_region, '')), '') is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'public_member_profiles_country_code_check'
      and conrelid = 'public.public_member_profiles'::regclass
  ) then
    alter table public.public_member_profiles
      add constraint public_member_profiles_country_code_check
      check (country_code is null or country_code ~ '^[A-Z]{2}$');
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
  new.public_handle = nullif(lower(regexp_replace(regexp_replace(coalesce(new.public_handle, ''), '^@+', ''), '[^a-zA-Z0-9_-]+', '-', 'g')), '');
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

comment on column public.public_member_profiles.country_code is
  'Optional ISO 3166-1 alpha-2 country code used to render public Community Grow country flags.';

drop function if exists public.get_public_member_follow_members(uuid, text);

create or replace function public.get_public_member_follow_members(target_user_id uuid, relationship_type text default 'followers')
returns table (
  member_id uuid,
  display_name text,
  avatar_url text,
  country_code text,
  joined_at timestamptz,
  relationship_type text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  with visible_public_member_profiles as (
    select
      public_member_profiles.id,
      public_member_profiles.display_name,
      public_member_profiles.avatar_url,
      public_member_profiles.country_code,
      public_member_profiles.joined_at
    from public.public_member_profiles
    inner join public.profiles
      on profiles.id = public_member_profiles.id
    where coalesce(public_member_profiles.show_profile_in_community_grow, true) = true
      and coalesce(public_member_profiles.profile_visibility, 'public') = 'public'
      and nullif(btrim(coalesce(public_member_profiles.display_name, '')), '') is not null
      and coalesce(profiles.account_status, 'active') = 'active'
      and coalesce(profiles.deletion_status, '') <> 'deleted'
  ),
  normalized_relationship as (
    select case
      when lower(coalesce($2, '')) = 'following' then 'following'
      else 'followers'
    end as relationship_type
  ),
  requested_members as (
    select
      case
        when normalized_relationship.relationship_type = 'following' then grow_follows.following_id
        else grow_follows.follower_id
      end as member_id,
      normalized_relationship.relationship_type,
      grow_follows.created_at
    from public.grow_follows
    cross join normalized_relationship
    where (
      normalized_relationship.relationship_type = 'following'
      and grow_follows.follower_id = target_user_id
    ) or (
      normalized_relationship.relationship_type = 'followers'
      and grow_follows.following_id = target_user_id
    )
  )
  select
    requested_members.member_id,
    visible_public_member_profiles.display_name,
    visible_public_member_profiles.avatar_url,
    visible_public_member_profiles.country_code,
    visible_public_member_profiles.joined_at,
    requested_members.relationship_type,
    requested_members.created_at
  from requested_members
  inner join visible_public_member_profiles
    on visible_public_member_profiles.id = requested_members.member_id
  order by requested_members.created_at desc, lower(visible_public_member_profiles.display_name) asc;
$$;

revoke all on function public.get_public_member_follow_members(uuid, text) from public;
grant execute on function public.get_public_member_follow_members(uuid, text) to anon;
grant execute on function public.get_public_member_follow_members(uuid, text) to authenticated;
