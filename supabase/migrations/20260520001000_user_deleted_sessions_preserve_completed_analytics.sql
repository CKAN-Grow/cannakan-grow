-- Preserve completed real-session analytics when users hide/delete sessions.
-- Regular user deletion is a visibility action (`user_deleted`), not a
-- production analytics exclusion. Founder/admin cleanup still uses
-- excluded_from_analytics/is_test/is_mock/session_status=archived_test.

alter table public.grow_sessions
  add column if not exists user_deleted boolean not null default false,
  add column if not exists user_deleted_at timestamptz;

create index if not exists grow_sessions_user_deleted_idx
  on public.grow_sessions (user_id, user_deleted, created_at desc);

create or replace function public.is_grow_session_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    );
$$;

revoke all on function public.is_grow_session_admin() from public;
grant execute on function public.is_grow_session_admin() to authenticated;

create or replace function public.enforce_grow_session_regular_delete_policy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  actor_is_admin boolean := public.is_grow_session_admin();
begin
  if actor_id is null or actor_is_admin then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    raise exception 'Regular users cannot permanently delete grow sessions. Use user_deleted soft delete.' using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    new.is_mock := false;
    new.is_test := false;
    new.excluded_from_analytics := false;
    new.analytics_excluded_reason := '';
    new.analytics_excluded_at := null;
    new.is_deleted := false;
    new.deleted_at := null;
    if coalesce(new.user_deleted, false) = true then
      new.user_deleted_at := coalesce(new.user_deleted_at, timezone('utc', now()));
      new.visibility_status := 'hidden';
    elsif lower(coalesce(new.visibility_status, '')) in ('deleted', 'archived', 'archived_test', 'hidden') then
      new.visibility_status := 'active';
    end if;
    return new;
  end if;

  if coalesce(old.user_deleted, false) = true
    or coalesce(old.is_deleted, false) = true
    or lower(coalesce(old.visibility_status, '')) in ('hidden', 'deleted', 'archived', 'archived_test') then
    raise exception 'Hidden grow sessions cannot be reopened or edited.' using errcode = '42501';
  end if;

  if new.is_mock is distinct from old.is_mock
    or new.is_test is distinct from old.is_test
    or new.excluded_from_analytics is distinct from old.excluded_from_analytics
    or new.analytics_excluded_reason is distinct from old.analytics_excluded_reason
    or new.analytics_excluded_at is distinct from old.analytics_excluded_at
    or new.is_deleted is distinct from old.is_deleted
    or new.deleted_at is distinct from old.deleted_at then
    raise exception 'Founder/admin cleanup is required to permanently exclude grow sessions from analytics.' using errcode = '42501';
  end if;

  if lower(coalesce(new.session_status, '')) in ('deleted', 'archived', 'archived_test')
    and new.session_status is distinct from old.session_status then
    raise exception 'Founder/admin cleanup is required to archive grow sessions for analytics exclusion.' using errcode = '42501';
  end if;

  if coalesce(new.user_deleted, false) = true and coalesce(old.user_deleted, false) = false then
    new.user_deleted_at := coalesce(new.user_deleted_at, timezone('utc', now()));
    new.visibility_status := 'hidden';
    return new;
  end if;

  if new.user_deleted is distinct from old.user_deleted
    or new.user_deleted_at is distinct from old.user_deleted_at
    or new.visibility_status is distinct from old.visibility_status then
    raise exception 'Regular users can only hide sessions through user_deleted soft delete.' using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function public.get_grow_session_analytics_exclusion_reason(p_session_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when grow_sessions.id is null then 'missing_session'
    when coalesce(grow_sessions.is_mock, false) = true then 'mock_session'
    when coalesce(grow_sessions.is_test, false) = true then 'test_session'
    when coalesce(grow_sessions.excluded_from_analytics, false) = true then coalesce(nullif(grow_sessions.analytics_excluded_reason, ''), 'analytics_excluded')
    when lower(coalesce(grow_sessions.session_status, '')) in ('deleted', 'archived', 'archived_test') then 'deleted_session'
    when lower(coalesce(grow_sessions.session_status, '')) in ('abandoned', 'failed', 'canceled', 'cancelled') then 'abandoned_session'
    when lower(coalesce(grow_sessions.session_status, '')) <> 'completed' then 'incomplete_session'
    when grow_sessions.completed_at is null then 'missing_completed_at'
    when grow_sessions.session_started_at is not null
      and grow_sessions.soak_started_at is not null
      and grow_sessions.soak_started_at < grow_sessions.session_started_at then 'invalid_timeline'
    when grow_sessions.soak_started_at is not null
      and grow_sessions.germination_started_at is not null
      and grow_sessions.soak_started_at > grow_sessions.germination_started_at then 'invalid_timeline'
    when grow_sessions.germination_started_at is not null
      and grow_sessions.completed_at is not null
      and grow_sessions.germination_started_at > grow_sessions.completed_at then 'invalid_timeline'
    when grow_sessions.session_started_at is not null
      and grow_sessions.completed_at is not null
      and grow_sessions.completed_at < grow_sessions.session_started_at then 'invalid_timeline'
    else ''
  end
  from public.grow_sessions
  where grow_sessions.id = p_session_id;
$$;

drop trigger if exists grow_sessions_analytics_eligibility_sync on public.grow_sessions;
create trigger grow_sessions_analytics_eligibility_sync
after insert or update of session_status, completed_at, session_started_at, soak_started_at, germination_started_at, is_mock, is_test, excluded_from_analytics, is_deleted, visibility_status, deleted_at, user_deleted, user_deleted_at
on public.grow_sessions
for each row
execute function public.enforce_grow_session_analytics_eligibility();

drop trigger if exists grow_sessions_regular_delete_policy on public.grow_sessions;
create trigger grow_sessions_regular_delete_policy
before insert or update or delete
on public.grow_sessions
for each row
execute function public.enforce_grow_session_regular_delete_policy();

drop policy if exists "Users can delete their own grow sessions" on public.grow_sessions;
drop policy if exists "Admins can permanently delete grow sessions" on public.grow_sessions;
create policy "Admins can permanently delete grow sessions"
on public.grow_sessions
for delete
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

comment on column public.grow_sessions.user_deleted is
  'True when the owner hides a session from normal history. Completed real sessions may still contribute anonymized analytics unless explicitly excluded.';
