create table if not exists public.member_follows (
  id uuid primary key default gen_random_uuid(),
  follower_user_id uuid not null references auth.users(id) on delete cascade,
  followed_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists member_follows_follower_followed_idx
  on public.member_follows (follower_user_id, followed_user_id);

create index if not exists member_follows_followed_created_idx
  on public.member_follows (followed_user_id, created_at desc);

create index if not exists member_follows_follower_created_idx
  on public.member_follows (follower_user_id, created_at desc);

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
      from public.member_follows
      where member_follows.followed_user_id = target_user_id
    ) as follower_count,
    (
      select count(*)::bigint
      from public.member_follows
      where member_follows.follower_user_id = target_user_id
    ) as following_count;
$$;

revoke all on function public.get_public_member_follow_summary(uuid) from public;
grant execute on function public.get_public_member_follow_summary(uuid) to anon;
grant execute on function public.get_public_member_follow_summary(uuid) to authenticated;

alter table public.member_follows enable row level security;

drop policy if exists "Users can view their own follow relationships" on public.member_follows;
create policy "Users can view their own follow relationships"
on public.member_follows
for select
to authenticated
using (
  auth.uid() = follower_user_id
  or auth.uid() = followed_user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can follow other members" on public.member_follows;
create policy "Users can follow other members"
on public.member_follows
for insert
to authenticated
with check (
  auth.uid() = follower_user_id
  and follower_user_id is distinct from followed_user_id
);

drop policy if exists "Users can unfollow members" on public.member_follows;
create policy "Users can unfollow members"
on public.member_follows
for delete
to authenticated
using (
  auth.uid() = follower_user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
