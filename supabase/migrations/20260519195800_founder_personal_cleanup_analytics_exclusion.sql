-- Founder personal grow-session cleanup and analytics exclusion hardening.
-- Scope:
-- - Normal personal grow sessions only.
-- - CSTP records, auth users, admin roles, app settings, and public config are untouched.

alter table public.grow_sessions
  add column if not exists is_test boolean not null default false,
  add column if not exists excluded_from_analytics boolean not null default false,
  add column if not exists analytics_excluded_reason text not null default '',
  add column if not exists analytics_excluded_at timestamptz;

create index if not exists grow_sessions_analytics_exclusion_idx
  on public.grow_sessions (excluded_from_analytics, is_test, is_deleted, session_status, created_at desc);

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
    when coalesce(grow_sessions.is_deleted, false) = true
      or lower(coalesce(grow_sessions.visibility_status, '')) in ('deleted', 'archived', 'archived_test') then 'deleted_session'
    when lower(coalesce(grow_sessions.session_status, '')) in ('abandoned', 'failed', 'canceled', 'cancelled', 'archived_test') then 'abandoned_session'
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
after insert or update of session_status, completed_at, session_started_at, soak_started_at, germination_started_at, is_mock, is_test, excluded_from_analytics, is_deleted, visibility_status, deleted_at
on public.grow_sessions
for each row
execute function public.enforce_grow_session_analytics_eligibility();

create or replace function public.cleanup_founder_test_grow_sessions(
  target_user_id uuid default null,
  candidate_session_ids uuid[] default null,
  include_explicit_unmarked boolean default false,
  confirmation_phrase text default '',
  dry_run boolean default true,
  reason text default '',
  legacy_created_before timestamptz default '2026-05-19 23:58:00+00'::timestamptz
)
returns table (
  table_name text,
  deleted_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  required_confirmation constant text := 'DELETE OLD FOUNDER TEST SESSIONS';
  actor_id uuid := auth.uid();
  actor_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  normalized_target_user_id uuid := coalesce(target_user_id, auth.uid());
  requested_ids uuid[] := coalesce(candidate_session_ids, '{}'::uuid[]);
  confirmation_matches boolean := btrim(coalesce(confirmation_phrase, '')) = required_confirmation;
  normalized_legacy_created_before timestamptz := coalesce(legacy_created_before, '2026-05-19 23:58:00+00'::timestamptz);
  is_authorized_admin boolean := false;
  has_requested_ids boolean := cardinality(coalesce(candidate_session_ids, '{}'::uuid[])) > 0;
  candidate_ids uuid[] := '{}'::uuid[];
  sessions_count integer := 0;
  snapshots_count integer := 0;
  likes_count integer := 0;
  activity_count integer := 0;
  reminder_events_count integer := 0;
  push_deliveries_count integer := 0;
  audit_counts jsonb := '{}'::jsonb;
begin
  is_authorized_admin := (
    actor_email = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = actor_id
    )
  );

  if not is_authorized_admin then
    raise exception 'Only admins can clean up founder test grow sessions.' using errcode = '42501';
  end if;

  if normalized_target_user_id is null then
    raise exception 'A target user id is required for founder test grow session cleanup.' using errcode = '22023';
  end if;

  if coalesce(dry_run, true) = false and not confirmation_matches then
    raise exception 'Confirmation phrase mismatch. Use DELETE OLD FOUNDER TEST SESSIONS to execute cleanup.' using errcode = '22023';
  end if;

  drop table if exists pg_temp.cleanup_founder_test_session_candidates;
  create temporary table cleanup_founder_test_session_candidates (
    session_id uuid primary key
  ) on commit drop;

  insert into cleanup_founder_test_session_candidates (session_id)
  select grow_sessions.id
  from public.grow_sessions
  where grow_sessions.user_id = normalized_target_user_id
    and (
      coalesce(grow_sessions.is_mock, false) = true
      or coalesce(grow_sessions.is_test, false) = true
      or coalesce(grow_sessions.excluded_from_analytics, false) = true
      or coalesce(grow_sessions.is_deleted, false) = true
      or lower(coalesce(grow_sessions.visibility_status, '')) in ('deleted', 'archived', 'archived_test')
      or (
        coalesce(include_explicit_unmarked, false) = true
        and has_requested_ids
        and grow_sessions.id = any (requested_ids)
        and coalesce(grow_sessions.created_at, 'infinity'::timestamptz) < normalized_legacy_created_before
      )
    )
    and (
      not has_requested_ids
      or grow_sessions.id = any (requested_ids)
    );

  if to_regclass('public.cstp_test_sessions') is not null then
    execute $sql$
      delete from pg_temp.cleanup_founder_test_session_candidates candidates
      where exists (
        select 1
        from public.cstp_test_sessions
        where cstp_test_sessions.session_id = candidates.session_id
      )
    $sql$;
  end if;

  if to_regclass('public.cstp_report_sessions') is not null then
    execute $sql$
      delete from pg_temp.cleanup_founder_test_session_candidates candidates
      where exists (
        select 1
        from public.cstp_report_sessions
        where cstp_report_sessions.grow_session_id = candidates.session_id
      )
    $sql$;
  end if;

  select coalesce(array_agg(session_id order by session_id), '{}'::uuid[])
  into candidate_ids
  from pg_temp.cleanup_founder_test_session_candidates;

  select count(*)::integer
  into sessions_count
  from pg_temp.cleanup_founder_test_session_candidates;

  select count(*)::integer
  into snapshots_count
  from public.grow_gallery_snapshots
  where grow_gallery_snapshots.session_id = any (candidate_ids)
    and (
      coalesce(grow_gallery_snapshots.is_mock, false) = true
      or coalesce(include_explicit_unmarked, false) = true
    );

  select count(*)::integer
  into likes_count
  from public.grow_gallery_snapshot_likes
  where exists (
    select 1
    from public.grow_gallery_snapshots
    where grow_gallery_snapshots.id = grow_gallery_snapshot_likes.snapshot_id
      and grow_gallery_snapshots.session_id = any (candidate_ids)
      and (
        coalesce(grow_gallery_snapshots.is_mock, false) = true
        or coalesce(include_explicit_unmarked, false) = true
      )
  );

  select count(*)::integer
  into activity_count
  from public.community_activity
  where community_activity.session_id in (select session_id::text from pg_temp.cleanup_founder_test_session_candidates)
    or exists (
      select 1
      from public.grow_gallery_snapshots
      where grow_gallery_snapshots.id::text = community_activity.snapshot_id
        and grow_gallery_snapshots.session_id = any (candidate_ids)
        and (
          coalesce(grow_gallery_snapshots.is_mock, false) = true
          or coalesce(include_explicit_unmarked, false) = true
        )
    );

  select count(*)::integer
  into reminder_events_count
  from public.grow_session_reminder_events
  where grow_session_reminder_events.session_id = any (candidate_ids);

  select count(*)::integer
  into push_deliveries_count
  from public.push_notification_deliveries
  where push_notification_deliveries.session_id = any (candidate_ids);

  if coalesce(dry_run, true) = false then
    update public.grow_sessions
    set
      session_status = 'archived_test',
      visibility_status = 'archived_test',
      is_mock = true,
      is_test = true,
      excluded_from_analytics = true,
      analytics_excluded_reason = 'founder_personal_test_cleanup',
      analytics_excluded_at = timezone('utc', now()),
      is_deleted = true,
      deleted_at = coalesce(deleted_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
    where grow_sessions.id = any (candidate_ids);

    update public.grow_gallery_snapshots
    set
      is_mock = true,
      analytics_excluded = true,
      analytics_excluded_reason = 'founder_personal_test_cleanup',
      analytics_excluded_at = coalesce(analytics_excluded_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
    where grow_gallery_snapshots.session_id = any (candidate_ids);

    delete from public.grow_gallery_snapshot_likes
    where exists (
      select 1
      from public.grow_gallery_snapshots
      where grow_gallery_snapshots.id = grow_gallery_snapshot_likes.snapshot_id
        and grow_gallery_snapshots.session_id = any (candidate_ids)
        and (
          coalesce(grow_gallery_snapshots.is_mock, false) = true
          or coalesce(include_explicit_unmarked, false) = true
        )
    );
    get diagnostics likes_count = row_count;

    delete from public.community_activity
    where community_activity.session_id in (select session_id::text from pg_temp.cleanup_founder_test_session_candidates)
      or exists (
        select 1
        from public.grow_gallery_snapshots
        where grow_gallery_snapshots.id::text = community_activity.snapshot_id
          and grow_gallery_snapshots.session_id = any (candidate_ids)
          and (
            coalesce(grow_gallery_snapshots.is_mock, false) = true
            or coalesce(include_explicit_unmarked, false) = true
          )
      );
    get diagnostics activity_count = row_count;

    delete from public.grow_gallery_snapshots
    where grow_gallery_snapshots.session_id = any (candidate_ids)
      and (
        coalesce(grow_gallery_snapshots.is_mock, false) = true
        or coalesce(include_explicit_unmarked, false) = true
      );
    get diagnostics snapshots_count = row_count;

    delete from public.grow_session_reminder_events
    where grow_session_reminder_events.session_id = any (candidate_ids);
    get diagnostics reminder_events_count = row_count;

    delete from public.push_notification_deliveries
    where push_notification_deliveries.session_id = any (candidate_ids);
    get diagnostics push_deliveries_count = row_count;

    delete from public.grow_sessions
    where grow_sessions.id = any (candidate_ids);
    get diagnostics sessions_count = row_count;
  end if;

  audit_counts := jsonb_build_object(
    'grow_sessions', sessions_count,
    'grow_gallery_snapshots', snapshots_count,
    'grow_gallery_snapshot_likes', likes_count,
    'community_activity', activity_count,
    'grow_session_reminder_events', reminder_events_count,
    'push_notification_deliveries', push_deliveries_count
  );

  insert into public.grow_session_cleanup_audit (
    actor_user_id,
    actor_email,
    target_user_id,
    dry_run,
    confirmation_matched,
    include_explicit_unmarked,
    legacy_created_before,
    requested_session_ids,
    candidate_session_ids,
    deleted_counts,
    reason
  )
  values (
    actor_id,
    actor_email,
    normalized_target_user_id,
    coalesce(dry_run, true),
    confirmation_matches,
    coalesce(include_explicit_unmarked, false),
    normalized_legacy_created_before,
    requested_ids,
    candidate_ids,
    audit_counts,
    left(coalesce(reason, ''), 500)
  );

  return query
    select 'grow_sessions'::text, sessions_count
    union all select 'grow_gallery_snapshots'::text, snapshots_count
    union all select 'grow_gallery_snapshot_likes'::text, likes_count
    union all select 'community_activity'::text, activity_count
    union all select 'grow_session_reminder_events'::text, reminder_events_count
    union all select 'push_notification_deliveries'::text, push_deliveries_count;
end;
$$;

revoke all on function public.cleanup_founder_test_grow_sessions(uuid, uuid[], boolean, text, boolean, text, timestamptz) from public;
grant execute on function public.cleanup_founder_test_grow_sessions(uuid, uuid[], boolean, text, boolean, text, timestamptz) to authenticated;

comment on column public.grow_sessions.is_test is
  'True for founder/admin personal test grow sessions. Test sessions must not count in production analytics.';

comment on column public.grow_sessions.excluded_from_analytics is
  'Internal analytics guardrail. True sessions are hidden from production germination rates, rankings, leaderboards, Community Grow analytics, and CSTP calculations.';

comment on function public.cleanup_founder_test_grow_sessions(uuid, uuid[], boolean, text, boolean, text, timestamptz) is
  'Admin-only grow-session cleanup for founder personal test/mock data. Defaults to dry-run and requires exact confirmation before deletion. Marks candidates as archived_test, is_test, is_mock, and excluded_from_analytics before removal, excludes CSTP-linked sessions, caps explicit unmarked cleanup to the legacy cutoff, and never deletes auth, admin, settings, config, source, or CSTP records.';
