do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'member_follows'
  ) and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'grow_follows'
  ) then
    alter table public.member_follows rename to grow_follows;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'grow_follows'
      and column_name = 'follower_user_id'
  ) then
    alter table public.grow_follows rename column follower_user_id to follower_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'grow_follows'
      and column_name = 'followed_user_id'
  ) then
    alter table public.grow_follows rename column followed_user_id to following_id;
  end if;
end
$$;

drop index if exists public.member_follows_follower_followed_idx;
drop index if exists public.member_follows_followed_created_idx;
drop index if exists public.member_follows_follower_created_idx;

create table if not exists public.grow_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists grow_follows_follower_following_idx
  on public.grow_follows (follower_id, following_id);

create index if not exists grow_follows_following_created_idx
  on public.grow_follows (following_id, created_at desc);

create index if not exists grow_follows_follower_created_idx
  on public.grow_follows (follower_id, created_at desc);

create or replace function public.get_public_member_follow_summary(target_user_id uuid)
returns table (
  follower_count bigint,
  following_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (
      select count(*)::bigint
      from public.grow_follows
      inner join public.public_member_profiles
        on public_member_profiles.id = grow_follows.follower_id
      where grow_follows.following_id = target_user_id
    ) as follower_count,
    (
      select count(*)::bigint
      from public.grow_follows
      inner join public.public_member_profiles
        on public_member_profiles.id = grow_follows.following_id
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
  with requested_users as (
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
    inner join public.public_member_profiles
      on public_member_profiles.id = grow_follows.follower_id
    where grow_follows.following_id = any (coalesce(target_user_ids, '{}'::uuid[]))
    group by grow_follows.following_id
  ) as follower_counts
    on follower_counts.user_id = requested_users.user_id
  left join (
    select
      grow_follows.follower_id as user_id,
      count(*)::bigint as following_count
    from public.grow_follows
    inner join public.public_member_profiles
      on public_member_profiles.id = grow_follows.following_id
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
  with normalized_relationship as (
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
    public_member_profiles.display_name,
    public_member_profiles.avatar_url,
    public_member_profiles.joined_at,
    requested_members.relationship_type,
    requested_members.created_at
  from requested_members
  inner join public.public_member_profiles
    on public_member_profiles.id = requested_members.member_id
  order by requested_members.created_at desc, lower(public_member_profiles.display_name) asc;
$$;

revoke all on function public.get_public_member_follow_members(uuid, text) from public;
grant execute on function public.get_public_member_follow_members(uuid, text) to anon;
grant execute on function public.get_public_member_follow_members(uuid, text) to authenticated;

alter table public.grow_follows enable row level security;

drop policy if exists "Users can view their own follow relationships" on public.grow_follows;
create policy "Users can view their own follow relationships"
on public.grow_follows
for select
to authenticated
using (
  auth.uid() = follower_id
  or auth.uid() = following_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can follow other members" on public.grow_follows;
create policy "Users can follow other members"
on public.grow_follows
for insert
to authenticated
with check (
  auth.uid() = follower_id
  and follower_id is distinct from following_id
);

drop policy if exists "Users can unfollow members" on public.grow_follows;
create policy "Users can unfollow members"
on public.grow_follows
for delete
to authenticated
using (
  auth.uid() = follower_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
