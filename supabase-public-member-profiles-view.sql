-- Legacy filename retained for compatibility.
-- This script now migrates the old view-based `public_member_profiles` surface
-- into a writable table so the app can save Grow Network profile settings.

drop function if exists public.get_public_member_follow_members(uuid, text);
drop function if exists public.get_public_member_follow_summaries(uuid[]);
drop function if exists public.get_public_member_follow_summary(uuid);

do $$
begin
  if exists (
    select 1
    from pg_class c
    inner join pg_namespace n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'public_member_profiles'
      and c.relkind = 'v'
  ) then
    execute 'drop view public.public_member_profiles';
  end if;
end
$$;

create table if not exists public.public_member_profiles (
  id uuid primary key,
  user_id uuid unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text default '',
  joined_at timestamptz not null default timezone('utc', now()),
  notify_community_activity boolean not null default true,
  show_profile_in_community_grow boolean not null default true,
  allow_followers boolean not null default true,
  show_grow_stats_publicly boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.public_member_profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.public_member_profiles
  add column if not exists display_name text;

alter table public.public_member_profiles
  add column if not exists avatar_url text default '';

alter table public.public_member_profiles
  add column if not exists joined_at timestamptz not null default timezone('utc', now());

alter table public.public_member_profiles
  add column if not exists notify_community_activity boolean not null default true;

alter table public.public_member_profiles
  add column if not exists show_profile_in_community_grow boolean not null default true;

alter table public.public_member_profiles
  add column if not exists allow_followers boolean not null default true;

alter table public.public_member_profiles
  add column if not exists show_grow_stats_publicly boolean not null default true;

alter table public.public_member_profiles
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.public_member_profiles
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.public_member_profiles
set id = coalesce(id, user_id),
    user_id = coalesce(user_id, id),
    avatar_url = coalesce(avatar_url, ''),
    joined_at = coalesce(joined_at, created_at, timezone('utc', now())),
    created_at = coalesce(created_at, timezone('utc', now())),
    updated_at = coalesce(updated_at, timezone('utc', now()));

insert into public.public_member_profiles (
  id,
  user_id,
  display_name,
  avatar_url,
  joined_at,
  notify_community_activity,
  show_profile_in_community_grow,
  allow_followers,
  show_grow_stats_publicly,
  created_at,
  updated_at
)
select
  profiles.id,
  profiles.id,
  nullif(btrim(profiles.username), ''),
  coalesce(profiles.avatar_url, ''),
  coalesce(profiles.created_at, timezone('utc', now())),
  true,
  true,
  true,
  true,
  coalesce(profiles.created_at, timezone('utc', now())),
  timezone('utc', now())
from public.profiles
where coalesce(profiles.account_status, 'active') = 'active'
  and coalesce(profiles.deletion_status, '') <> 'deleted'
on conflict (id) do update
set user_id = excluded.user_id,
    display_name = coalesce(nullif(public.public_member_profiles.display_name, ''), excluded.display_name),
    avatar_url = case
      when coalesce(public.public_member_profiles.avatar_url, '') = '' then excluded.avatar_url
      else public.public_member_profiles.avatar_url
    end,
    joined_at = coalesce(public.public_member_profiles.joined_at, excluded.joined_at),
    updated_at = timezone('utc', now());

alter table public.public_member_profiles
  alter column user_id set not null;

create unique index if not exists public_member_profiles_user_id_idx
  on public.public_member_profiles (user_id);

create index if not exists public_member_profiles_display_name_idx
  on public.public_member_profiles (lower(coalesce(display_name, '')));

comment on table public.public_member_profiles is
  'Writable replacement for the old public_member_profiles view. Stores public profile and Grow Network preference fields while keeping Community Grow lookups on the same surface.';

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

  return new;
end;
$$;

create or replace function public.set_public_member_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists public_member_profiles_identity_sync on public.public_member_profiles;
create trigger public_member_profiles_identity_sync
before insert or update on public.public_member_profiles
for each row
execute procedure public.sync_public_member_profiles_identity();

drop trigger if exists public_member_profiles_set_updated_at on public.public_member_profiles;
create trigger public_member_profiles_set_updated_at
before update on public.public_member_profiles
for each row
execute procedure public.set_public_member_profiles_updated_at();

revoke all on table public.public_member_profiles from public;
grant select on table public.public_member_profiles to anon;
grant select, insert, update on table public.public_member_profiles to authenticated;

alter table public.public_member_profiles enable row level security;

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

drop policy if exists "Users can create their own public member profile" on public.public_member_profiles;
create policy "Users can create their own public member profile"
on public.public_member_profiles
for insert
to authenticated
with check (
  auth.uid() = coalesce(user_id, id)
);

drop policy if exists "Users can update their own public member profile" on public.public_member_profiles;
create policy "Users can update their own public member profile"
on public.public_member_profiles
for update
to authenticated
using (
  auth.uid() = user_id
  or auth.uid() = id
)
with check (
  auth.uid() = coalesce(user_id, id)
);

create or replace function public.get_public_member_follow_summary(target_user_id uuid)
returns table (
  follower_count bigint,
  following_count bigint
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
      public_member_profiles.joined_at
    from public.public_member_profiles
    inner join public.profiles
      on profiles.id = public_member_profiles.id
    where coalesce(public_member_profiles.show_profile_in_community_grow, true) = true
      and nullif(btrim(coalesce(public_member_profiles.display_name, '')), '') is not null
      and coalesce(profiles.account_status, 'active') = 'active'
      and coalesce(profiles.deletion_status, '') <> 'deleted'
  )
  select
    (
      select count(*)::bigint
      from public.grow_follows
      inner join visible_public_member_profiles
        on visible_public_member_profiles.id = grow_follows.follower_id
      where grow_follows.following_id = target_user_id
    ) as follower_count,
    (
      select count(*)::bigint
      from public.grow_follows
      inner join visible_public_member_profiles
        on visible_public_member_profiles.id = grow_follows.following_id
      where grow_follows.follower_id = target_user_id
    ) as following_count;
$$;

revoke all on function public.get_public_member_follow_summary(uuid) from public;
grant execute on function public.get_public_member_follow_summary(uuid) to anon;
grant execute on function public.get_public_member_follow_summary(uuid) to authenticated;

create or replace function public.get_public_member_follow_summaries(target_user_ids uuid[])
returns table (
  user_id uuid,
  follower_count bigint,
  following_count bigint
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
      public_member_profiles.joined_at
    from public.public_member_profiles
    inner join public.profiles
      on profiles.id = public_member_profiles.id
    where coalesce(public_member_profiles.show_profile_in_community_grow, true) = true
      and nullif(btrim(coalesce(public_member_profiles.display_name, '')), '') is not null
      and coalesce(profiles.account_status, 'active') = 'active'
      and coalesce(profiles.deletion_status, '') <> 'deleted'
  ),
  requested_users as (
    select distinct unnest(coalesce(target_user_ids, '{}'::uuid[])) as user_id
  )
  select
    requested_users.user_id,
    coalesce(follower_counts.follower_count, 0)::bigint as follower_count,
    coalesce(following_counts.following_count, 0)::bigint as following_count
  from requested_users
  left join (
    select
      grow_follows.following_id as user_id,
      count(*)::bigint as follower_count
    from public.grow_follows
    inner join visible_public_member_profiles
      on visible_public_member_profiles.id = grow_follows.follower_id
    where grow_follows.following_id = any (coalesce(target_user_ids, '{}'::uuid[]))
    group by grow_follows.following_id
  ) as follower_counts
    on follower_counts.user_id = requested_users.user_id
  left join (
    select
      grow_follows.follower_id as user_id,
      count(*)::bigint as following_count
    from public.grow_follows
    inner join visible_public_member_profiles
      on visible_public_member_profiles.id = grow_follows.following_id
    where grow_follows.follower_id = any (coalesce(target_user_ids, '{}'::uuid[]))
    group by grow_follows.follower_id
  ) as following_counts
    on following_counts.user_id = requested_users.user_id;
$$;

revoke all on function public.get_public_member_follow_summaries(uuid[]) from public;
grant execute on function public.get_public_member_follow_summaries(uuid[]) to anon;
grant execute on function public.get_public_member_follow_summaries(uuid[]) to authenticated;

create or replace function public.get_public_member_follow_members(target_user_id uuid, relationship_type text default 'followers')
returns table (
  member_id uuid,
  display_name text,
  avatar_url text,
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
      public_member_profiles.joined_at
    from public.public_member_profiles
    inner join public.profiles
      on profiles.id = public_member_profiles.id
    where coalesce(public_member_profiles.show_profile_in_community_grow, true) = true
      and nullif(btrim(coalesce(public_member_profiles.display_name, '')), '') is not null
      and coalesce(profiles.account_status, 'active') = 'active'
      and coalesce(profiles.deletion_status, '') <> 'deleted'
  ),
  normalized_relationship as (
    select case
      when lower(coalesce(relationship_type, '')) = 'following' then 'following'
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
