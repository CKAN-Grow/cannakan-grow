-- Grow Session Analytics Eligibility Protection
-- Production analytics should use only valid completed, non-deleted, non-mock grow sessions.

alter table public.grow_gallery_snapshots
  add column if not exists analytics_excluded boolean not null default false,
  add column if not exists analytics_excluded_reason text not null default '',
  add column if not exists analytics_excluded_at timestamptz;

create index if not exists grow_gallery_snapshots_analytics_idx
  on public.grow_gallery_snapshots (analytics_excluded, status, is_published, published_at desc);

drop policy if exists "Anyone can view published gallery snapshots" on public.grow_gallery_snapshots;
create policy "Anyone can view published gallery snapshots"
on public.grow_gallery_snapshots
for select
using (
  (status = 'approved' and coalesce(analytics_excluded, false) = false)
  or auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Visible grow gallery likes can be read" on public.grow_gallery_snapshot_likes;
create policy "Visible grow gallery likes can be read"
on public.grow_gallery_snapshot_likes
for select
using (
  exists (
    select 1
    from public.grow_gallery_snapshots
    where grow_gallery_snapshots.id = snapshot_id
      and (
        (grow_gallery_snapshots.status = 'approved' and coalesce(grow_gallery_snapshots.analytics_excluded, false) = false)
        or auth.uid() = grow_gallery_snapshots.user_id
        or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
        or exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "Users can like visible gallery snapshots" on public.grow_gallery_snapshot_likes;
create policy "Users can like visible gallery snapshots"
on public.grow_gallery_snapshot_likes
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.grow_gallery_snapshots
    where grow_gallery_snapshots.id = snapshot_id
      and (
        (grow_gallery_snapshots.status = 'approved' and coalesce(grow_gallery_snapshots.analytics_excluded, false) = false)
        or auth.uid() = grow_gallery_snapshots.user_id
        or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
        or exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      )
  )
);

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
    when coalesce(grow_sessions.is_deleted, false) = true
      or lower(coalesce(grow_sessions.visibility_status, '')) in ('deleted', 'archived') then 'deleted_session'
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

create or replace function public.is_grow_session_analytics_eligible(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_grow_session_analytics_exclusion_reason(p_session_id), 'missing_session') = '';
$$;

revoke all on function public.get_grow_session_analytics_exclusion_reason(uuid) from public;
revoke all on function public.is_grow_session_analytics_eligible(uuid) from public;
grant execute on function public.get_grow_session_analytics_exclusion_reason(uuid) to authenticated;
grant execute on function public.is_grow_session_analytics_eligible(uuid) to authenticated;

create or replace function public.sync_gallery_snapshot_analytics_exclusion_for_session(p_session_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  exclusion_reason text := coalesce(public.get_grow_session_analytics_exclusion_reason(p_session_id), 'missing_session');
  affected_count integer := 0;
begin
  if p_session_id is null then
    return 0;
  end if;

  update public.grow_gallery_snapshots
  set
    analytics_excluded = exclusion_reason <> '',
    analytics_excluded_reason = exclusion_reason,
    analytics_excluded_at = case when exclusion_reason <> '' then timezone('utc', now()) else null end,
    updated_at = timezone('utc', now())
  where session_id = p_session_id
    and coalesce(is_mock, false) = false;

  get diagnostics affected_count = row_count;

  if exclusion_reason <> '' then
    delete from public.community_activity
    where session_id = p_session_id::text;

    if to_regclass('public.cstp_report_sessions') is not null then
      execute
        'update public.cstp_report_sessions
         set
           included_in_report = false,
           frozen_session_summary = coalesce(frozen_session_summary, ''{}''::jsonb)
             || jsonb_build_object(
               ''analyticsEligible'', false,
               ''analyticsExcludedReason'', $2,
               ''includedInReportRequested'', true
             )
         where grow_session_id = $1
           and included_in_report = true'
      using p_session_id, exclusion_reason;
    end if;
  end if;

  return coalesce(affected_count, 0);
end;
$$;

revoke all on function public.sync_gallery_snapshot_analytics_exclusion_for_session(uuid) from public;
grant execute on function public.sync_gallery_snapshot_analytics_exclusion_for_session(uuid) to authenticated;

create or replace function public.enforce_cstp_report_session_analytics_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  exclusion_reason text := '';
begin
  if new.grow_session_id is null then
    return new;
  end if;

  exclusion_reason := coalesce(public.get_grow_session_analytics_exclusion_reason(new.grow_session_id), 'missing_session');
  new.frozen_session_summary = coalesce(new.frozen_session_summary, '{}'::jsonb)
    || jsonb_build_object(
      'analyticsEligible', exclusion_reason = '',
      'analyticsExcludedReason', exclusion_reason
    );

  if coalesce(new.included_in_report, false) = true
    and exclusion_reason <> '' then
    new.included_in_report := false;
    new.frozen_session_summary = coalesce(new.frozen_session_summary, '{}'::jsonb)
      || jsonb_build_object('includedInReportRequested', true);
  end if;

  return new;
end;
$$;

do $$
begin
  if to_regclass('public.cstp_report_sessions') is not null then
    execute 'drop trigger if exists cstp_report_sessions_analytics_eligibility on public.cstp_report_sessions';
    execute 'create trigger cstp_report_sessions_analytics_eligibility
      before insert or update of grow_session_id, included_in_report
      on public.cstp_report_sessions
      for each row
      execute function public.enforce_cstp_report_session_analytics_eligibility()';
  end if;
end $$;

create or replace function public.enforce_grow_session_analytics_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_gallery_snapshot_analytics_exclusion_for_session(new.id);
  return new;
end;
$$;

drop trigger if exists grow_sessions_analytics_eligibility_sync on public.grow_sessions;
create trigger grow_sessions_analytics_eligibility_sync
after insert or update of session_status, completed_at, session_started_at, soak_started_at, germination_started_at, is_mock, is_deleted, visibility_status, deleted_at
on public.grow_sessions
for each row
execute function public.enforce_grow_session_analytics_eligibility();

create or replace function public.enforce_gallery_snapshot_analytics_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  exclusion_reason text := '';
begin
  if coalesce(new.is_mock, false) = true then
    new.analytics_excluded := true;
    new.analytics_excluded_reason := 'mock_snapshot';
    new.analytics_excluded_at := coalesce(new.analytics_excluded_at, timezone('utc', now()));
    return new;
  end if;

  if new.session_id is not null then
    exclusion_reason := coalesce(public.get_grow_session_analytics_exclusion_reason(new.session_id), 'missing_session');
    new.analytics_excluded := exclusion_reason <> '';
    new.analytics_excluded_reason := exclusion_reason;
    new.analytics_excluded_at := case when exclusion_reason <> '' then coalesce(new.analytics_excluded_at, timezone('utc', now())) else null end;
  end if;

  return new;
end;
$$;

drop trigger if exists grow_gallery_snapshots_analytics_eligibility on public.grow_gallery_snapshots;
create trigger grow_gallery_snapshots_analytics_eligibility
before insert or update of session_id, is_mock, status, is_published
on public.grow_gallery_snapshots
for each row
execute function public.enforce_gallery_snapshot_analytics_eligibility();

create or replace function public.clear_community_activity_for_session(activity_session_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_session_id text := btrim(coalesce(activity_session_id, ''));
  normalized_session_uuid uuid;
  deleted_count integer := 0;
begin
  if normalized_session_id = '' then
    return 0;
  end if;

  if normalized_session_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    normalized_session_uuid := normalized_session_id::uuid;
  end if;

  if normalized_session_uuid is not null
    and not (
      exists (
        select 1
        from public.grow_sessions
        where grow_sessions.id = normalized_session_uuid
          and grow_sessions.user_id = auth.uid()
      )
      or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
      or exists (
        select 1
        from public.admin_users
        where admin_users.user_id = auth.uid()
      )
    ) then
    raise exception 'You can only clear activity for your own grow sessions.' using errcode = '42501';
  end if;

  delete from public.community_activity
  where session_id = normalized_session_id;

  get diagnostics deleted_count = row_count;
  return coalesce(deleted_count, 0);
end;
$$;

revoke all on function public.clear_community_activity_for_session(text) from public;
grant execute on function public.clear_community_activity_for_session(text) to authenticated;

create or replace function public.record_community_activity(
  activity_user_id uuid,
  activity_type text,
  activity_session_id text default '',
  activity_snapshot_id text default '',
  activity_title text default '',
  activity_summary text default '',
  activity_metadata jsonb default '{}'::jsonb,
  activity_visibility text default 'public'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_activity_type text := lower(coalesce(activity_type, ''));
  normalized_session_id text := btrim(coalesce(activity_session_id, ''));
  normalized_snapshot_id text := btrim(coalesce(activity_snapshot_id, ''));
  normalized_session_uuid uuid;
  normalized_snapshot_uuid uuid;
  normalized_visibility text := case
    when lower(coalesce(activity_visibility, 'public')) = 'public' then 'public'
    else 'private'
  end;
  resulting_id uuid;
begin
  if activity_user_id is null or normalized_activity_type = '' then
    return null;
  end if;

  if normalized_session_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    normalized_session_uuid := normalized_session_id::uuid;
  end if;

  if normalized_snapshot_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    normalized_snapshot_uuid := normalized_snapshot_id::uuid;
  end if;

  if normalized_session_uuid is not null
    and not public.is_grow_session_analytics_eligible(normalized_session_uuid) then
    return null;
  end if;

  if normalized_snapshot_uuid is not null
    and exists (
      select 1
      from public.grow_gallery_snapshots
      where grow_gallery_snapshots.id = normalized_snapshot_uuid
        and coalesce(grow_gallery_snapshots.analytics_excluded, false) = true
    ) then
    return null;
  end if;

  insert into public.community_activity (
    user_id,
    activity_type,
    session_id,
    snapshot_id,
    title,
    summary,
    metadata,
    visibility
  )
  values (
    activity_user_id,
    normalized_activity_type,
    normalized_session_id,
    normalized_snapshot_id,
    coalesce(activity_title, ''),
    coalesce(activity_summary, ''),
    coalesce(activity_metadata, '{}'::jsonb),
    normalized_visibility
  )
  on conflict (user_id, activity_type, session_id, snapshot_id)
  do update set
    title = excluded.title,
    summary = excluded.summary,
    metadata = excluded.metadata,
    visibility = excluded.visibility
  returning id into resulting_id;

  return resulting_id;
end;
$$;

revoke all on function public.record_community_activity(uuid, text, text, text, text, text, jsonb, text) from public;
grant execute on function public.record_community_activity(uuid, text, text, text, text, text, jsonb, text) to authenticated;

update public.grow_gallery_snapshots
set
  analytics_excluded = true,
  analytics_excluded_reason = 'mock_snapshot',
  analytics_excluded_at = coalesce(analytics_excluded_at, timezone('utc', now()))
where coalesce(is_mock, false) = true;

update public.grow_gallery_snapshots
set
  analytics_excluded = coalesce(public.get_grow_session_analytics_exclusion_reason(session_id), 'missing_session') <> '',
  analytics_excluded_reason = coalesce(public.get_grow_session_analytics_exclusion_reason(session_id), 'missing_session'),
  analytics_excluded_at = case
    when coalesce(public.get_grow_session_analytics_exclusion_reason(session_id), 'missing_session') <> ''
      then coalesce(analytics_excluded_at, timezone('utc', now()))
    else null
  end
where session_id is not null
  and coalesce(is_mock, false) = false;

delete from public.community_activity
where session_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and not public.is_grow_session_analytics_eligible(session_id::uuid);

do $$
begin
  if to_regclass('public.cstp_report_sessions') is not null then
    execute
      'update public.cstp_report_sessions
       set
         included_in_report = false,
         frozen_session_summary = coalesce(frozen_session_summary, ''{}''::jsonb)
           || jsonb_build_object(
             ''analyticsEligible'', false,
             ''analyticsExcludedReason'', coalesce(public.get_grow_session_analytics_exclusion_reason(grow_session_id), ''missing_session''),
             ''includedInReportRequested'', true
           )
       where included_in_report = true
         and not public.is_grow_session_analytics_eligible(grow_session_id)';
  end if;
end $$;

comment on column public.grow_sessions.session_status is
  'Grow session lifecycle input. Analytics state is normalized as draft, active, completed, abandoned, or deleted; only completed eligible sessions count in production metrics.';

comment on column public.grow_gallery_snapshots.analytics_excluded is
  'True when the linked grow session is mock, incomplete, abandoned, deleted, or has an invalid timeline. Excluded snapshots must not count in Community Grow analytics or leaderboards.';
