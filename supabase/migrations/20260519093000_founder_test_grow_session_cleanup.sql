-- ============================================================================
-- Founder Test Grow Session Cleanup
-- ============================================================================
--
-- Purpose:
-- - Admin-only cleanup for one account's old test/mock Grow sessions.
-- - Preview by default, require an exact confirmation phrase before deletion.
-- - Keep scope limited to Grow session data and directly related mock/session
--   child rows.
--
-- Boundary:
-- - Never deletes auth users, profiles, admin roles, settings, production config,
--   Source Directory records, or CSTP records.
-- - Excludes sessions linked to CSTP tables when those tables exist.
-- - Future real sessions remain untouched unless explicitly listed with the
--   unmarked-test override and confirmation.

create table if not exists public.grow_session_cleanup_audit (
  id uuid primary key default gen_random_uuid(),
  action_type text not null default 'founder_test_grow_session_cleanup',
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text not null default '',
  target_user_id uuid references auth.users(id) on delete set null,
  dry_run boolean not null default true,
  confirmation_matched boolean not null default false,
  include_explicit_unmarked boolean not null default false,
  requested_session_ids uuid[] not null default '{}'::uuid[],
  candidate_session_ids uuid[] not null default '{}'::uuid[],
  deleted_counts jsonb not null default '{}'::jsonb,
  reason text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.grow_session_cleanup_audit is
  'Append-only audit log for admin grow-session cleanup previews and executions. This table records cleanup intent and counts without deleting account, admin, settings, config, or CSTP data.';

create index if not exists grow_session_cleanup_audit_target_created_idx
  on public.grow_session_cleanup_audit (target_user_id, created_at desc);

create index if not exists grow_session_cleanup_audit_actor_created_idx
  on public.grow_session_cleanup_audit (actor_user_id, created_at desc);

alter table public.grow_session_cleanup_audit enable row level security;

drop policy if exists "Admins can view grow session cleanup audit" on public.grow_session_cleanup_audit;
create policy "Admins can view grow session cleanup audit"
on public.grow_session_cleanup_audit
for select
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create or replace function public.cleanup_founder_test_grow_sessions(
  target_user_id uuid default null,
  candidate_session_ids uuid[] default null,
  include_explicit_unmarked boolean default false,
  confirmation_phrase text default '',
  dry_run boolean default true,
  reason text default ''
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
      or (
        coalesce(include_explicit_unmarked, false) = true
        and has_requested_ids
        and grow_sessions.id = any (requested_ids)
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

revoke all on table public.grow_session_cleanup_audit from public;
grant select on table public.grow_session_cleanup_audit to authenticated;

revoke all on function public.cleanup_founder_test_grow_sessions(uuid, uuid[], boolean, text, boolean, text) from public;
grant execute on function public.cleanup_founder_test_grow_sessions(uuid, uuid[], boolean, text, boolean, text) to authenticated;

comment on function public.cleanup_founder_test_grow_sessions(uuid, uuid[], boolean, text, boolean, text) is
  'Admin-only grow-session cleanup for founder test/mock data. Defaults to dry-run and requires exact confirmation before deletion. Excludes CSTP-linked sessions and never deletes auth, admin, settings, config, source, or CSTP records.';
