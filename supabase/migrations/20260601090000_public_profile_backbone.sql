-- Step 2A.1: public profile backbone fields for Community Grow.
-- Additive only; keeps public reads constrained to safe profile columns through RLS.

alter table public.public_member_profiles
  add column if not exists bio text default '';

alter table public.public_member_profiles
  add column if not exists public_handle text;

alter table public.public_member_profiles
  add column if not exists location_region text default '';

alter table public.public_member_profiles
  add column if not exists profile_visibility text not null default 'public';

update public.public_member_profiles
set bio = coalesce(bio, ''),
    public_handle = nullif(lower(regexp_replace(regexp_replace(coalesce(public_handle, ''), '^@+', ''), '[^a-zA-Z0-9_-]+', '-', 'g')), ''),
    location_region = coalesce(location_region, ''),
    profile_visibility = case
      when coalesce(show_profile_in_community_grow, true) = false then 'private'
      when lower(coalesce(profile_visibility, 'public')) = 'private' then 'private'
      else 'public'
    end,
    updated_at = timezone('utc', now());

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'public_member_profiles_visibility_check'
      and conrelid = 'public.public_member_profiles'::regclass
  ) then
    alter table public.public_member_profiles
      add constraint public_member_profiles_visibility_check
      check (profile_visibility in ('public', 'private'));
  end if;
end
$$;

create unique index if not exists public_member_profiles_public_handle_unique_idx
  on public.public_member_profiles (lower(public_handle))
  where public_handle is not null and btrim(public_handle) <> '';

create index if not exists public_member_profiles_public_handle_lookup_idx
  on public.public_member_profiles (lower(public_handle), profile_visibility, show_profile_in_community_grow);

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
  new.public_handle = nullif(lower(regexp_replace(regexp_replace(coalesce(new.public_handle, ''), '^@+', ''), '[^a-zA-Z0-9_-]+', '-', 'g')), '');
  new.profile_visibility = case
    when coalesce(new.show_profile_in_community_grow, true) = false then 'private'
    when lower(coalesce(new.profile_visibility, 'public')) = 'private' then 'private'
    else 'public'
  end;

  return new;
end;
$$;

revoke select on table public.public_member_profiles from anon;
grant select (
  id,
  user_id,
  display_name,
  avatar_url,
  bio,
  public_handle,
  location_region,
  profile_visibility,
  joined_at,
  show_profile_in_community_grow,
  show_grow_stats_publicly,
  created_at,
  updated_at
) on public.public_member_profiles to anon;

drop policy if exists "Visible public member profiles can be read" on public.public_member_profiles;
create policy "Visible public member profiles can be read"
on public.public_member_profiles
for select
to public
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
  or (
    coalesce(show_profile_in_community_grow, true) = true
    and coalesce(profile_visibility, 'public') = 'public'
    and nullif(btrim(coalesce(display_name, '')), '') is not null
    and exists (
      select 1
      from public.profiles
      where profiles.id = public_member_profiles.user_id
        and coalesce(profiles.account_status, 'active') = 'active'
        and coalesce(profiles.deletion_status, '') <> 'deleted'
    )
  )
);

comment on column public.public_member_profiles.bio is
  'Optional public-safe grower bio. Never use for private notes, CSTP internals, emails, or admin data.';

comment on column public.public_member_profiles.public_handle is
  'Optional public profile slug used by #members/{handle}. Unique when present.';

comment on column public.public_member_profiles.location_region is
  'Optional coarse region label supplied by the member; do not store precise addresses here.';

comment on column public.public_member_profiles.profile_visibility is
  'Public/private profile switch. Private rows remain owner/admin-readable but are hidden from public profile lookup.';
