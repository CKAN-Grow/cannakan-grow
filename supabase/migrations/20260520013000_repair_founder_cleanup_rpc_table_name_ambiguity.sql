-- Repair cleanup_founder_test_grow_sessions table_name ambiguity.
--
-- The RPC returns a column named table_name, which also becomes a PL/pgSQL
-- output variable. Keep the public RPC signature unchanged, but avoid using
-- table_name/deleted_count as internal temp-table column names.

create or replace function public.cleanup_founder_test_grow_sessions(
  candidate_session_ids uuid[] default null,
  confirmation_phrase text default '',
  dry_run boolean default true,
  include_explicit_unmarked boolean default false,
  legacy_created_before timestamptz default '2026-05-20 04:00:00+00'::timestamptz,
  reason text default '',
  target_user_id uuid default null
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
  required_confirmation constant text := 'DELETE TEST SESSION';
  actor_id uuid := auth.uid();
  actor_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  normalized_target_user_id uuid := coalesce(target_user_id, auth.uid());
  requested_ids uuid[] := coalesce(candidate_session_ids, '{}'::uuid[]);
  confirmation_matches boolean := btrim(coalesce(confirmation_phrase, '')) = required_confirmation;
  normalized_legacy_created_before timestamptz := coalesce(legacy_created_before, '2026-05-20 04:00:00+00'::timestamptz);
  is_authorized_admin boolean := false;
  has_requested_ids boolean := cardinality(coalesce(candidate_session_ids, '{}'::uuid[])) > 0;
  candidate_ids uuid[] := '{}'::uuid[];
  affected_count integer := 0;
  related_table_name text := '';
  related_column text := '';
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
    raise exception 'Confirmation phrase mismatch. Use DELETE TEST SESSION to execute cleanup.' using errcode = '22023';
  end if;

  drop table if exists pg_temp.cleanup_founder_test_session_candidates;
  create temporary table cleanup_founder_test_session_candidates (
    session_id uuid primary key
  ) on commit drop;

  drop table if exists pg_temp.cleanup_founder_test_delete_counts;
  create temporary table cleanup_founder_test_delete_counts (
    cleanup_table_name text primary key,
    cleanup_deleted_count integer not null default 0
  ) on commit drop;

  insert into pg_temp.cleanup_founder_test_session_candidates (session_id)
  select grow_sessions.id
  from public.grow_sessions
  where grow_sessions.user_id = normalized_target_user_id
    and (
      coalesce(grow_sessions.is_mock, false) = true
      or coalesce(grow_sessions.is_test, false) = true
      or coalesce(grow_sessions.excluded_from_analytics, false) = true
      or coalesce(grow_sessions.is_deleted, false) = true
      or coalesce(grow_sessions.user_deleted, false) = true
      or lower(coalesce(grow_sessions.visibility_status, '')) in ('deleted', 'hidden', 'archived', 'archived_test')
      or lower(coalesce(grow_sessions.session_status, '')) in ('deleted', 'archived', 'archived_test')
      or (
        coalesce(include_explicit_unmarked, false) = true
        and has_requested_ids
        and grow_sessions.id = any (requested_ids)
        and (
          grow_sessions.user_id = actor_id
          or coalesce(grow_sessions.created_at, 'infinity'::timestamptz) < normalized_legacy_created_before
        )
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

  select coalesce(array_agg(candidates.session_id order by candidates.session_id), '{}'::uuid[])
  into candidate_ids
  from pg_temp.cleanup_founder_test_session_candidates candidates;

  select count(*)::integer
  into affected_count
  from pg_temp.cleanup_founder_test_session_candidates;
  insert into pg_temp.cleanup_founder_test_delete_counts (cleanup_table_name, cleanup_deleted_count)
  values ('grow_sessions', affected_count);

  select count(*)::integer
  into affected_count
  from public.grow_gallery_snapshot_likes
  where exists (
    select 1
    from public.grow_gallery_snapshots
    where grow_gallery_snapshots.id = grow_gallery_snapshot_likes.snapshot_id
      and grow_gallery_snapshots.session_id = any (candidate_ids)
  );
  insert into pg_temp.cleanup_founder_test_delete_counts (cleanup_table_name, cleanup_deleted_count)
  values ('grow_gallery_snapshot_likes', affected_count);

  select count(*)::integer
  into affected_count
  from public.community_activity
  where community_activity.session_id in (
    select candidates.session_id::text
    from pg_temp.cleanup_founder_test_session_candidates candidates
  )
    or exists (
      select 1
      from public.grow_gallery_snapshots
      where grow_gallery_snapshots.id::text = community_activity.snapshot_id
        and grow_gallery_snapshots.session_id = any (candidate_ids)
    );
  insert into pg_temp.cleanup_founder_test_delete_counts (cleanup_table_name, cleanup_deleted_count)
  values ('community_activity', affected_count);

  select count(*)::integer
  into affected_count
  from public.grow_gallery_snapshots
  where grow_gallery_snapshots.session_id = any (candidate_ids);
  insert into pg_temp.cleanup_founder_test_delete_counts (cleanup_table_name, cleanup_deleted_count)
  values ('grow_gallery_snapshots', affected_count);

  select count(*)::integer
  into affected_count
  from public.grow_session_reminder_events
  where grow_session_reminder_events.session_id = any (candidate_ids);
  insert into pg_temp.cleanup_founder_test_delete_counts (cleanup_table_name, cleanup_deleted_count)
  values ('grow_session_reminder_events', affected_count);

  select count(*)::integer
  into affected_count
  from public.push_notification_deliveries
  where push_notification_deliveries.session_id = any (candidate_ids);
  insert into pg_temp.cleanup_founder_test_delete_counts (cleanup_table_name, cleanup_deleted_count)
  values ('push_notification_deliveries', affected_count);

  for related_table_name in
    select related_tables.related_table_name
    from (values
      ('grow_session_partitions'),
      ('grow_session_stage_history'),
      ('grow_session_stage_events'),
      ('grow_session_events'),
      ('grow_session_timeline_events'),
      ('grow_session_progress_events'),
      ('grow_session_artifacts'),
      ('grow_session_notifications')
    ) as related_tables(related_table_name)
  loop
    related_column := '';
    if to_regclass(format('public.%I', related_table_name)) is not null then
      if exists (
        select 1
        from information_schema.columns info_columns
        where info_columns.table_schema = 'public'
          and info_columns.table_name = related_table_name
          and info_columns.column_name = 'session_id'
      ) then
        related_column := 'session_id';
      elsif exists (
        select 1
        from information_schema.columns info_columns
        where info_columns.table_schema = 'public'
          and info_columns.table_name = related_table_name
          and info_columns.column_name = 'grow_session_id'
      ) then
        related_column := 'grow_session_id';
      end if;
    end if;

    if related_column <> '' then
      execute format(
        'select count(*)::integer from public.%I where %I::text in (select candidates.session_id::text from pg_temp.cleanup_founder_test_session_candidates candidates)',
        related_table_name,
        related_column
      )
      into affected_count;
    else
      affected_count := 0;
    end if;

    insert into pg_temp.cleanup_founder_test_delete_counts (cleanup_table_name, cleanup_deleted_count)
    values (related_table_name, affected_count)
    on conflict (cleanup_table_name) do update
      set cleanup_deleted_count = excluded.cleanup_deleted_count;
  end loop;

  if coalesce(dry_run, true) = false and cardinality(candidate_ids) > 0 then
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
      user_deleted = true,
      user_deleted_at = coalesce(user_deleted_at, timezone('utc', now())),
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
    );
    get diagnostics affected_count = row_count;
    update pg_temp.cleanup_founder_test_delete_counts cleanup_counts
    set cleanup_deleted_count = affected_count
    where cleanup_counts.cleanup_table_name = 'grow_gallery_snapshot_likes';

    delete from public.community_activity
    where community_activity.session_id in (
      select candidates.session_id::text
      from pg_temp.cleanup_founder_test_session_candidates candidates
    )
      or exists (
        select 1
        from public.grow_gallery_snapshots
        where grow_gallery_snapshots.id::text = community_activity.snapshot_id
          and grow_gallery_snapshots.session_id = any (candidate_ids)
      );
    get diagnostics affected_count = row_count;
    update pg_temp.cleanup_founder_test_delete_counts cleanup_counts
    set cleanup_deleted_count = affected_count
    where cleanup_counts.cleanup_table_name = 'community_activity';

    for related_table_name in
      select related_tables.related_table_name
      from (values
        ('grow_session_partitions'),
        ('grow_session_stage_history'),
        ('grow_session_stage_events'),
        ('grow_session_events'),
        ('grow_session_timeline_events'),
        ('grow_session_progress_events'),
        ('grow_session_artifacts'),
        ('grow_session_notifications')
      ) as related_tables(related_table_name)
    loop
      related_column := '';
      if to_regclass(format('public.%I', related_table_name)) is not null then
        if exists (
          select 1
          from information_schema.columns info_columns
          where info_columns.table_schema = 'public'
            and info_columns.table_name = related_table_name
            and info_columns.column_name = 'session_id'
        ) then
          related_column := 'session_id';
        elsif exists (
          select 1
          from information_schema.columns info_columns
          where info_columns.table_schema = 'public'
            and info_columns.table_name = related_table_name
            and info_columns.column_name = 'grow_session_id'
        ) then
          related_column := 'grow_session_id';
        end if;
      end if;

      if related_column <> '' then
        execute format(
          'delete from public.%I where %I::text in (select candidates.session_id::text from pg_temp.cleanup_founder_test_session_candidates candidates)',
          related_table_name,
          related_column
        );
        get diagnostics affected_count = row_count;
        update pg_temp.cleanup_founder_test_delete_counts cleanup_counts
        set cleanup_deleted_count = affected_count
        where cleanup_counts.cleanup_table_name = related_table_name;
      end if;
    end loop;

    delete from public.grow_session_reminder_events
    where grow_session_reminder_events.session_id = any (candidate_ids);
    get diagnostics affected_count = row_count;
    update pg_temp.cleanup_founder_test_delete_counts cleanup_counts
    set cleanup_deleted_count = affected_count
    where cleanup_counts.cleanup_table_name = 'grow_session_reminder_events';

    delete from public.push_notification_deliveries
    where push_notification_deliveries.session_id = any (candidate_ids);
    get diagnostics affected_count = row_count;
    update pg_temp.cleanup_founder_test_delete_counts cleanup_counts
    set cleanup_deleted_count = affected_count
    where cleanup_counts.cleanup_table_name = 'push_notification_deliveries';

    delete from public.grow_gallery_snapshots
    where grow_gallery_snapshots.session_id = any (candidate_ids);
    get diagnostics affected_count = row_count;
    update pg_temp.cleanup_founder_test_delete_counts cleanup_counts
    set cleanup_deleted_count = affected_count
    where cleanup_counts.cleanup_table_name = 'grow_gallery_snapshots';

    delete from public.grow_sessions
    where grow_sessions.id = any (candidate_ids);
    get diagnostics affected_count = row_count;
    update pg_temp.cleanup_founder_test_delete_counts cleanup_counts
    set cleanup_deleted_count = affected_count
    where cleanup_counts.cleanup_table_name = 'grow_sessions';
  end if;

  select coalesce(jsonb_object_agg(cleanup_counts.cleanup_table_name, cleanup_counts.cleanup_deleted_count), '{}'::jsonb)
  into audit_counts
  from pg_temp.cleanup_founder_test_delete_counts cleanup_counts;

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
    select
      cleanup_counts.cleanup_table_name as table_name,
      cleanup_counts.cleanup_deleted_count as deleted_count
    from pg_temp.cleanup_founder_test_delete_counts cleanup_counts
    order by cleanup_counts.cleanup_table_name;
end;
$$;

revoke all on function public.cleanup_founder_test_grow_sessions(uuid[], text, boolean, boolean, timestamptz, text, uuid) from public;
grant execute on function public.cleanup_founder_test_grow_sessions(uuid[], text, boolean, boolean, timestamptz, text, uuid) to authenticated;

comment on function public.cleanup_founder_test_grow_sessions(uuid[], text, boolean, boolean, timestamptz, text, uuid) is
  'Admin-only grow-session cleanup RPC for founder personal test/bad data. Defaults to dry-run, requires DELETE TEST SESSION for execution, excludes CSTP-linked sessions, marks candidates test/mock/excluded before deletion, deletes related grow-session artifacts, and never deletes auth, admin, settings, config, source, or CSTP records. Reissued to remove PL/pgSQL table_name ambiguity.';

notify pgrst, 'reload schema';
