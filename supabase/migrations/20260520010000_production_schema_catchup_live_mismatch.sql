-- Production catch-up for frontend/live Supabase schema drift.
--
-- This migration is intentionally self-contained because production may be
-- missing one or more prior migrations even after deploy. It reasserts only
-- additive columns/RPCs used by the current frontend and does not touch CSTP,
-- auth users, admin roles, app settings, or production config tables.

alter table public.grow_sessions
  add column if not exists excluded_from_analytics boolean not null default false,
  add column if not exists analytics_excluded_reason text not null default '',
  add column if not exists analytics_excluded_at timestamptz,
  add column if not exists user_deleted boolean not null default false,
  add column if not exists user_deleted_at timestamptz,
  add column if not exists is_deleted boolean not null default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists visibility_status text not null default 'active';

alter table public.grow_gallery_snapshots
  add column if not exists status text not null default 'private',
  add column if not exists is_mock boolean not null default false,
  add column if not exists status_is_mock boolean not null default false,
  add column if not exists analytics_excluded boolean not null default false,
  add column if not exists analytics_excluded_reason text not null default '',
  add column if not exists analytics_excluded_at timestamptz;

update public.grow_gallery_snapshots
set status_is_mock = coalesce(is_mock, false)
where status_is_mock is distinct from coalesce(is_mock, false);

create or replace function public.sync_grow_gallery_snapshot_status_is_mock()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.status_is_mock := coalesce(new.is_mock, false);
  return new;
end;
$$;

drop trigger if exists grow_gallery_snapshots_status_is_mock_sync on public.grow_gallery_snapshots;
create trigger grow_gallery_snapshots_status_is_mock_sync
before insert or update of is_mock, status
on public.grow_gallery_snapshots
for each row
execute function public.sync_grow_gallery_snapshot_status_is_mock();

create index if not exists grow_gallery_snapshots_status_is_mock_idx
  on public.grow_gallery_snapshots (status, status_is_mock, created_at desc);

create table if not exists public.grow_session_cleanup_audit (
  id uuid primary key default gen_random_uuid(),
  action_type text not null default 'founder_test_grow_session_cleanup',
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text not null default '',
  target_user_id uuid references auth.users(id) on delete set null,
  dry_run boolean not null default true,
  confirmation_matched boolean not null default false,
  include_explicit_unmarked boolean not null default false,
  legacy_created_before timestamptz,
  requested_session_ids uuid[] not null default '{}'::uuid[],
  candidate_session_ids uuid[] not null default '{}'::uuid[],
  deleted_counts jsonb not null default '{}'::jsonb,
  reason text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.grow_session_cleanup_audit
  add column if not exists action_type text not null default 'founder_test_grow_session_cleanup',
  add column if not exists actor_user_id uuid references auth.users(id) on delete set null,
  add column if not exists actor_email text not null default '',
  add column if not exists target_user_id uuid references auth.users(id) on delete set null,
  add column if not exists dry_run boolean not null default true,
  add column if not exists confirmation_matched boolean not null default false,
  add column if not exists include_explicit_unmarked boolean not null default false,
  add column if not exists legacy_created_before timestamptz,
  add column if not exists requested_session_ids uuid[] not null default '{}'::uuid[],
  add column if not exists candidate_session_ids uuid[] not null default '{}'::uuid[],
  add column if not exists deleted_counts jsonb not null default '{}'::jsonb,
  add column if not exists reason text not null default '',
  add column if not exists created_at timestamptz not null default timezone('utc', now());

create index if not exists grow_session_cleanup_audit_target_created_idx
  on public.grow_session_cleanup_audit (target_user_id, created_at desc);

create index if not exists grow_session_cleanup_audit_actor_created_idx
  on public.grow_session_cleanup_audit (actor_user_id, created_at desc);

alter table public.grow_session_cleanup_audit enable row level security;

alter table public.grow_sessions
  add column if not exists is_mock boolean not null default false,
  add column if not exists is_test boolean not null default false,
  add column if not exists excluded_from_analytics boolean not null default false,
  add column if not exists analytics_excluded_reason text not null default '',
  add column if not exists analytics_excluded_at timestamptz,
  add column if not exists user_deleted boolean not null default false,
  add column if not exists user_deleted_at timestamptz,
  add column if not exists is_deleted boolean not null default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists visibility_status text not null default 'active';

alter table public.grow_gallery_snapshots
  add column if not exists is_mock boolean not null default false,
  add column if not exists analytics_excluded boolean not null default false,
  add column if not exists analytics_excluded_reason text not null default '',
  add column if not exists analytics_excluded_at timestamptz;

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

drop function if exists public.cleanup_founder_test_grow_sessions(uuid, uuid[], boolean, text, boolean, text);
drop function if exists public.cleanup_founder_test_grow_sessions(uuid, uuid[], boolean, text, boolean, text, timestamptz);
drop function if exists public.cleanup_founder_test_grow_sessions(uuid[], text, boolean, boolean, timestamptz, text, uuid);

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
  related_record record;
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
    table_name text primary key,
    deleted_count integer not null default 0
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

  select coalesce(array_agg(session_id order by session_id), '{}'::uuid[])
  into candidate_ids
  from pg_temp.cleanup_founder_test_session_candidates;

  select count(*)::integer
  into affected_count
  from pg_temp.cleanup_founder_test_session_candidates;
  insert into pg_temp.cleanup_founder_test_delete_counts values ('grow_sessions', affected_count);

  select count(*)::integer
  into affected_count
  from public.grow_gallery_snapshot_likes
  where exists (
    select 1
    from public.grow_gallery_snapshots
    where grow_gallery_snapshots.id = grow_gallery_snapshot_likes.snapshot_id
      and grow_gallery_snapshots.session_id = any (candidate_ids)
  );
  insert into pg_temp.cleanup_founder_test_delete_counts values ('grow_gallery_snapshot_likes', affected_count);

  select count(*)::integer
  into affected_count
  from public.community_activity
  where community_activity.session_id in (select session_id::text from pg_temp.cleanup_founder_test_session_candidates)
    or exists (
      select 1
      from public.grow_gallery_snapshots
      where grow_gallery_snapshots.id::text = community_activity.snapshot_id
        and grow_gallery_snapshots.session_id = any (candidate_ids)
    );
  insert into pg_temp.cleanup_founder_test_delete_counts values ('community_activity', affected_count);

  select count(*)::integer
  into affected_count
  from public.grow_gallery_snapshots
  where grow_gallery_snapshots.session_id = any (candidate_ids);
  insert into pg_temp.cleanup_founder_test_delete_counts values ('grow_gallery_snapshots', affected_count);

  select count(*)::integer
  into affected_count
  from public.grow_session_reminder_events
  where grow_session_reminder_events.session_id = any (candidate_ids);
  insert into pg_temp.cleanup_founder_test_delete_counts values ('grow_session_reminder_events', affected_count);

  select count(*)::integer
  into affected_count
  from public.push_notification_deliveries
  where push_notification_deliveries.session_id = any (candidate_ids);
  insert into pg_temp.cleanup_founder_test_delete_counts values ('push_notification_deliveries', affected_count);

  for related_record in
    select *
    from (values
      ('grow_session_partitions'),
      ('grow_session_stage_history'),
      ('grow_session_stage_events'),
      ('grow_session_events'),
      ('grow_session_timeline_events'),
      ('grow_session_progress_events'),
      ('grow_session_artifacts'),
      ('grow_session_notifications')
    ) as related_tables(table_name)
  loop
    related_column := '';
    if to_regclass(format('public.%I', related_record.table_name)) is not null then
      if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = related_record.table_name
          and column_name = 'session_id'
      ) then
        related_column := 'session_id';
      elsif exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = related_record.table_name
          and column_name = 'grow_session_id'
      ) then
        related_column := 'grow_session_id';
      end if;
    end if;

    if related_column <> '' then
      execute format(
        'select count(*)::integer from public.%I where %I::text in (select session_id::text from pg_temp.cleanup_founder_test_session_candidates)',
        related_record.table_name,
        related_column
      )
      into affected_count;
    else
      affected_count := 0;
    end if;

    insert into pg_temp.cleanup_founder_test_delete_counts values (related_record.table_name, affected_count)
    on conflict (table_name) do update set deleted_count = excluded.deleted_count;
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
    update pg_temp.cleanup_founder_test_delete_counts set deleted_count = affected_count where table_name = 'grow_gallery_snapshot_likes';

    delete from public.community_activity
    where community_activity.session_id in (select session_id::text from pg_temp.cleanup_founder_test_session_candidates)
      or exists (
        select 1
        from public.grow_gallery_snapshots
        where grow_gallery_snapshots.id::text = community_activity.snapshot_id
          and grow_gallery_snapshots.session_id = any (candidate_ids)
      );
    get diagnostics affected_count = row_count;
    update pg_temp.cleanup_founder_test_delete_counts set deleted_count = affected_count where table_name = 'community_activity';

    for related_record in
      select *
      from (values
        ('grow_session_partitions'),
        ('grow_session_stage_history'),
        ('grow_session_stage_events'),
        ('grow_session_events'),
        ('grow_session_timeline_events'),
        ('grow_session_progress_events'),
        ('grow_session_artifacts'),
        ('grow_session_notifications')
      ) as related_tables(table_name)
    loop
      related_column := '';
      if to_regclass(format('public.%I', related_record.table_name)) is not null then
        if exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = related_record.table_name
            and column_name = 'session_id'
        ) then
          related_column := 'session_id';
        elsif exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = related_record.table_name
            and column_name = 'grow_session_id'
        ) then
          related_column := 'grow_session_id';
        end if;
      end if;

      if related_column <> '' then
        execute format(
          'delete from public.%I where %I::text in (select session_id::text from pg_temp.cleanup_founder_test_session_candidates)',
          related_record.table_name,
          related_column
        );
        get diagnostics affected_count = row_count;
        update pg_temp.cleanup_founder_test_delete_counts set deleted_count = affected_count where table_name = related_record.table_name;
      end if;
    end loop;

    delete from public.grow_session_reminder_events
    where grow_session_reminder_events.session_id = any (candidate_ids);
    get diagnostics affected_count = row_count;
    update pg_temp.cleanup_founder_test_delete_counts set deleted_count = affected_count where table_name = 'grow_session_reminder_events';

    delete from public.push_notification_deliveries
    where push_notification_deliveries.session_id = any (candidate_ids);
    get diagnostics affected_count = row_count;
    update pg_temp.cleanup_founder_test_delete_counts set deleted_count = affected_count where table_name = 'push_notification_deliveries';

    delete from public.grow_gallery_snapshots
    where grow_gallery_snapshots.session_id = any (candidate_ids);
    get diagnostics affected_count = row_count;
    update pg_temp.cleanup_founder_test_delete_counts set deleted_count = affected_count where table_name = 'grow_gallery_snapshots';

    delete from public.grow_sessions
    where grow_sessions.id = any (candidate_ids);
    get diagnostics affected_count = row_count;
    update pg_temp.cleanup_founder_test_delete_counts set deleted_count = affected_count where table_name = 'grow_sessions';
  end if;

  select coalesce(jsonb_object_agg(table_name, deleted_count), '{}'::jsonb)
  into audit_counts
  from pg_temp.cleanup_founder_test_delete_counts;

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
    select cleanup_counts.table_name, cleanup_counts.deleted_count
    from pg_temp.cleanup_founder_test_delete_counts cleanup_counts
    order by cleanup_counts.table_name;
end;
$$;

revoke all on function public.cleanup_founder_test_grow_sessions(uuid[], text, boolean, boolean, timestamptz, text, uuid) from public;
grant execute on function public.cleanup_founder_test_grow_sessions(uuid[], text, boolean, boolean, timestamptz, text, uuid) to authenticated;

revoke all on table public.grow_session_cleanup_audit from public;
grant select on table public.grow_session_cleanup_audit to authenticated;

comment on table public.grow_session_cleanup_audit is
  'Append-only audit log for admin grow-session cleanup previews and executions. Internal-only via RLS; does not expose CSTP/auth/admin/settings/config data.';

comment on function public.cleanup_founder_test_grow_sessions(uuid[], text, boolean, boolean, timestamptz, text, uuid) is
  'Admin-only grow-session cleanup RPC for founder personal test/bad data. Defaults to dry-run, requires DELETE TEST SESSION for execution, excludes CSTP-linked sessions, marks candidates test/mock/excluded before deletion, deletes related grow-session artifacts, and never deletes auth, admin, settings, config, source, or CSTP records.';

create or replace function public.clear_community_activity_for_snapshot(activity_snapshot_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_snapshot_id text := btrim(coalesce(activity_snapshot_id, ''));
  normalized_snapshot_uuid uuid;
  deleted_count integer := 0;
begin
  if normalized_snapshot_id = '' then
    return 0;
  end if;

  if normalized_snapshot_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    normalized_snapshot_uuid := normalized_snapshot_id::uuid;
  end if;

  if normalized_snapshot_uuid is not null
    and not (
      exists (
        select 1
        from public.grow_gallery_snapshots
        where grow_gallery_snapshots.id = normalized_snapshot_uuid
          and grow_gallery_snapshots.user_id = auth.uid()
      )
      or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
      or exists (
        select 1
        from public.admin_users
        where admin_users.user_id = auth.uid()
      )
    ) then
    raise exception 'You can only clear activity for your own Community Grow snapshots.' using errcode = '42501';
  end if;

  delete from public.community_activity
  where snapshot_id = normalized_snapshot_id;

  get diagnostics deleted_count = row_count;
  return coalesce(deleted_count, 0);
end;
$$;

revoke all on function public.clear_community_activity_for_snapshot(text) from public;
grant execute on function public.clear_community_activity_for_snapshot(text) to authenticated;

create or replace function public.cleanup_founder_clear_community_activity_for_snapshot(activity_snapshot_id text)
returns integer
language sql
security definer
set search_path = public
as $$
  select public.clear_community_activity_for_snapshot(activity_snapshot_id);
$$;

revoke all on function public.cleanup_founder_clear_community_activity_for_snapshot(text) from public;
grant execute on function public.cleanup_founder_clear_community_activity_for_snapshot(text) to authenticated;

comment on function public.clear_community_activity_for_snapshot(text) is
  'Owner/admin-safe cleanup RPC used by the frontend to remove Community Grow activity rows for one snapshot.';

comment on function public.cleanup_founder_clear_community_activity_for_snapshot(text) is
  'Compatibility wrapper for founder/admin snapshot activity cleanup; delegates to clear_community_activity_for_snapshot(text).';

notify pgrst, 'reload schema';
