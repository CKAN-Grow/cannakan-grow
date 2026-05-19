-- ============================================================================
-- Founder Real Grow Data Protection
-- ============================================================================
--
-- Purpose:
-- - Mark dev/demo/mock grow data explicitly.
-- - Keep real logged-in grow-session records as the default.
-- - Provide an admin-only cleanup path that removes only mock grow data.
--
-- Boundary:
-- - No public CSTP scope changes.
-- - CSTP/admin records are never deleted by the cleanup function.
-- - Real users, real sessions, real Community Grow snapshots, and real sources
--   remain untouched during demo resets.

alter table public.grow_sessions
  add column if not exists is_mock boolean not null default false;

alter table public.grow_gallery_snapshots
  add column if not exists is_mock boolean not null default false;

alter table public.community_activity
  add column if not exists is_mock boolean not null default false;

alter table public.sources
  add column if not exists is_mock boolean not null default false;

comment on column public.grow_sessions.is_mock is
  'True only for seeded/dev/demo Grow sessions. Real logged-in user sessions default to false and are preserved by demo resets.';

comment on column public.grow_gallery_snapshots.is_mock is
  'True only for seeded/dev/demo Community Grow snapshots. Real user snapshots default to false and are preserved by demo resets.';

comment on column public.community_activity.is_mock is
  'True only for seeded/dev/demo Community Grow activity rows. Real user activity defaults to false and is preserved by demo resets.';

comment on column public.sources.is_mock is
  'True only for seeded/dev/demo Source Directory records. Real/admin-managed sources default to false and are preserved by demo resets.';

create index if not exists grow_sessions_is_mock_idx
  on public.grow_sessions (is_mock, created_at desc);

create index if not exists grow_gallery_snapshots_is_mock_idx
  on public.grow_gallery_snapshots (is_mock, created_at desc);

create index if not exists community_activity_is_mock_idx
  on public.community_activity (is_mock, created_at desc);

create index if not exists sources_is_mock_idx
  on public.sources (is_mock, created_at desc);

update public.community_activity
set is_mock = true
where coalesce(community_activity.is_mock, false) = false
  and (
    exists (
      select 1
      from public.grow_gallery_snapshots
      where grow_gallery_snapshots.id::text = community_activity.snapshot_id
        and coalesce(grow_gallery_snapshots.is_mock, false) = true
    )
    or exists (
      select 1
      from public.grow_sessions
      where grow_sessions.id::text = community_activity.session_id
        and coalesce(grow_sessions.is_mock, false) = true
    )
  );

create or replace function public.backfill_community_activity_snapshot_posts()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
begin
  insert into public.community_activity (
    user_id,
    activity_type,
    session_id,
    snapshot_id,
    title,
    summary,
    metadata,
    visibility,
    is_mock,
    created_at
  )
  select
    grow_gallery_snapshots.user_id,
    'snapshot_posted',
    coalesce(grow_gallery_snapshots.session_id::text, ''),
    grow_gallery_snapshots.id::text,
    coalesce(nullif(btrim(grow_gallery_snapshots.snapshot_title), ''), 'Grow Snapshot'),
    'Approved public Community Grow snapshot.',
    jsonb_build_object(
      'activityTypeLabel', 'New approved Community Grow snapshot',
      'germinationRate', greatest(0, coalesce(grow_gallery_snapshots.success_percent, 0)),
      'germinationRateLabel', concat(greatest(0, coalesce(grow_gallery_snapshots.success_percent, 0))::text, '%'),
      'sourceLabel', coalesce(nullif(btrim(grow_gallery_snapshots.source_name), ''), 'Not shared'),
      'sessionDateLabel', coalesce(
        to_char(grow_gallery_snapshots.session_date::timestamp, 'Mon FMDD, YYYY'),
        to_char(coalesce(grow_gallery_snapshots.published_at, grow_gallery_snapshots.created_at), 'Mon FMDD, YYYY')
      ),
      'systemLabel', case
        when upper(coalesce(grow_gallery_snapshots.system_type, 'KAN')) = 'TRA' then 'TRā™'
        else 'KAN®'
      end,
      'seedAgeTrackingEnabled', coalesce(grow_gallery_snapshots.seed_age_tracking_enabled, false),
      'seedAgeMode', coalesce(grow_gallery_snapshots.seed_age_mode, ''),
      'sessionSeedAgeYears', grow_gallery_snapshots.session_seed_age_years,
      'seedAgeSummaryKey', case
        when coalesce(grow_gallery_snapshots.seed_age_tracking_enabled, false) = true
          and lower(coalesce(grow_gallery_snapshots.seed_age_mode, '')) = 'same'
          and grow_gallery_snapshots.session_seed_age_years is not null then 'same'
        when coalesce(grow_gallery_snapshots.seed_age_tracking_enabled, false) = true
          and lower(coalesce(grow_gallery_snapshots.seed_age_mode, '')) = 'mixed' then 'mixed'
        else 'unknown'
      end,
      'seedAgeSummaryLabel', case
        when coalesce(grow_gallery_snapshots.seed_age_tracking_enabled, false) = true
          and lower(coalesce(grow_gallery_snapshots.seed_age_mode, '')) = 'same'
          and grow_gallery_snapshots.session_seed_age_years is not null
          then concat(
            'Same age: ',
            trim(trailing '.' from trim(trailing '0' from grow_gallery_snapshots.session_seed_age_years::text)),
            ' years'
          )
        when coalesce(grow_gallery_snapshots.seed_age_tracking_enabled, false) = true
          and lower(coalesce(grow_gallery_snapshots.seed_age_mode, '')) = 'mixed' then 'Mixed ages'
        else 'Unknown'
      end
    ),
    'public',
    coalesce(grow_gallery_snapshots.is_mock, false),
    coalesce(grow_gallery_snapshots.published_at, grow_gallery_snapshots.created_at, timezone('utc', now()))
  from public.grow_gallery_snapshots
  where grow_gallery_snapshots.status = 'approved'
    and coalesce(grow_gallery_snapshots.is_published, false) = true
    and not exists (
      select 1
      from public.community_activity
      where community_activity.snapshot_id = grow_gallery_snapshots.id::text
        and lower(coalesce(community_activity.activity_type, '')) in ('snapshot_posted', 'snapshot_approved')
    );

  get diagnostics inserted_count = row_count;
  return coalesce(inserted_count, 0);
end;
$$;

create or replace function public.cleanup_mock_grow_data(dry_run boolean default true)
returns table (
  table_name text,
  deleted_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer := 0;
  source_cleanup_sql text := '';
begin
  if not (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  ) then
    raise exception 'Only admins can clean up mock grow data.' using errcode = '42501';
  end if;

  if coalesce(dry_run, true) then
    return query
      select 'grow_gallery_snapshot_likes'::text, count(*)::integer
      from public.grow_gallery_snapshot_likes
      where exists (
        select 1
        from public.grow_gallery_snapshots
        where grow_gallery_snapshots.id = grow_gallery_snapshot_likes.snapshot_id
          and coalesce(grow_gallery_snapshots.is_mock, false) = true
      )
      union all
      select 'community_activity'::text, count(*)::integer
      from public.community_activity
      where coalesce(community_activity.is_mock, false) = true
        or exists (
          select 1
          from public.grow_gallery_snapshots
          where grow_gallery_snapshots.id::text = community_activity.snapshot_id
            and coalesce(grow_gallery_snapshots.is_mock, false) = true
        )
        or exists (
          select 1
          from public.grow_sessions
          where grow_sessions.id::text = community_activity.session_id
            and coalesce(grow_sessions.is_mock, false) = true
        )
      union all
      select 'grow_gallery_snapshots'::text, count(*)::integer
      from public.grow_gallery_snapshots
      where coalesce(grow_gallery_snapshots.is_mock, false) = true
      union all
      select 'grow_session_reminder_events'::text, count(*)::integer
      from public.grow_session_reminder_events
      where exists (
        select 1
        from public.grow_sessions
        where grow_sessions.id = grow_session_reminder_events.session_id
          and coalesce(grow_sessions.is_mock, false) = true
      )
      union all
      select 'grow_sessions'::text, count(*)::integer
      from public.grow_sessions
      where coalesce(grow_sessions.is_mock, false) = true
      ;

    source_cleanup_sql := $source_sql$
      select count(*)::integer
      from public.sources
      where coalesce(sources.is_mock, false) = true
        and not exists (
          select 1
          from public.grow_gallery_snapshots
          where grow_gallery_snapshots.source_id = sources.id
            and coalesce(grow_gallery_snapshots.is_mock, false) = false
        )
    $source_sql$;

    if to_regclass('public.cstp_requests') is not null then
      source_cleanup_sql := source_cleanup_sql || '
        and not exists (
          select 1
          from public.cstp_requests
          where cstp_requests.source_id = sources.id
        )';
    end if;

    if to_regclass('public.cstp_tests') is not null then
      source_cleanup_sql := source_cleanup_sql || '
        and not exists (
          select 1
          from public.cstp_tests
          where cstp_tests.source_id = sources.id
        )';
    end if;

    execute source_cleanup_sql into affected_count;
    table_name := 'sources';
    deleted_count := affected_count;
    return next;
    return;
  end if;

  delete from public.grow_gallery_snapshot_likes
  where exists (
    select 1
    from public.grow_gallery_snapshots
    where grow_gallery_snapshots.id = grow_gallery_snapshot_likes.snapshot_id
      and coalesce(grow_gallery_snapshots.is_mock, false) = true
  );
  get diagnostics affected_count = row_count;
  table_name := 'grow_gallery_snapshot_likes';
  deleted_count := affected_count;
  return next;

  delete from public.community_activity
  where coalesce(community_activity.is_mock, false) = true
    or exists (
      select 1
      from public.grow_gallery_snapshots
      where grow_gallery_snapshots.id::text = community_activity.snapshot_id
        and coalesce(grow_gallery_snapshots.is_mock, false) = true
    )
    or exists (
      select 1
      from public.grow_sessions
      where grow_sessions.id::text = community_activity.session_id
        and coalesce(grow_sessions.is_mock, false) = true
    );
  get diagnostics affected_count = row_count;
  table_name := 'community_activity';
  deleted_count := affected_count;
  return next;

  delete from public.grow_gallery_snapshots
  where coalesce(grow_gallery_snapshots.is_mock, false) = true;
  get diagnostics affected_count = row_count;
  table_name := 'grow_gallery_snapshots';
  deleted_count := affected_count;
  return next;

  delete from public.grow_session_reminder_events
  where exists (
    select 1
    from public.grow_sessions
    where grow_sessions.id = grow_session_reminder_events.session_id
      and coalesce(grow_sessions.is_mock, false) = true
  );
  get diagnostics affected_count = row_count;
  table_name := 'grow_session_reminder_events';
  deleted_count := affected_count;
  return next;

  delete from public.grow_sessions
  where coalesce(grow_sessions.is_mock, false) = true;
  get diagnostics affected_count = row_count;
  table_name := 'grow_sessions';
  deleted_count := affected_count;
  return next;

  source_cleanup_sql := $source_sql$
    delete from public.sources
    where coalesce(sources.is_mock, false) = true
      and not exists (
        select 1
        from public.grow_gallery_snapshots
        where grow_gallery_snapshots.source_id = sources.id
          and coalesce(grow_gallery_snapshots.is_mock, false) = false
      )
  $source_sql$;

  if to_regclass('public.cstp_requests') is not null then
    source_cleanup_sql := source_cleanup_sql || '
      and not exists (
        select 1
        from public.cstp_requests
        where cstp_requests.source_id = sources.id
      )';
  end if;

  if to_regclass('public.cstp_tests') is not null then
    source_cleanup_sql := source_cleanup_sql || '
      and not exists (
        select 1
        from public.cstp_tests
        where cstp_tests.source_id = sources.id
      )';
  end if;

  execute source_cleanup_sql;
  get diagnostics affected_count = row_count;
  table_name := 'sources';
  deleted_count := affected_count;
  return next;
end;
$$;

revoke all on function public.cleanup_mock_grow_data(boolean) from public;
grant execute on function public.cleanup_mock_grow_data(boolean) to authenticated;

comment on function public.cleanup_mock_grow_data(boolean) is
  'Admin-only cleanup for mock Grow data. Defaults to dry-run. Never deletes users, non-mock sessions/snapshots/sources, or CSTP/admin records.';
