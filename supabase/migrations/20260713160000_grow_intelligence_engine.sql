-- Grow Intelligence Engine (GIE)
--
-- The Grow Intelligence Engine uses anonymous completed-session aggregates. This
-- migration centralizes the lifecycle resolver so Seed Explorer, Source
-- Explorer, diagnostics, cleanup validation, reporting, rankings, and future
-- analytics do not drift.
--
-- Session lifecycle contract:
-- Created -> In Progress -> Completed -> Published optional -> Community
-- Snapshot optional. GIE eligibility begins at Completed.
-- Session-level removal by user, Founder Cleanup, admin, or archive excludes
-- the session. Account deletion does not exclude otherwise valid completed
-- sessions because the aggregate is anonymous. Community snapshot deletion
-- controls public evidence only and must not exclude the underlying session.

create or replace function public.get_grow_session_lifecycle_exclusion_reason(p_session_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  session_record record;
  cleanup_deleted boolean := false;
  normalized_status text := '';
  normalized_visibility_status text := '';
begin
  if p_session_id is null then
    return 'missing_session';
  end if;

  select
    grow_sessions.id,
    grow_sessions.session_status,
    grow_sessions.visibility_status,
    coalesce(grow_sessions.is_mock, false) as is_mock,
    coalesce(grow_sessions.is_test, false) as is_test,
    coalesce(grow_sessions.excluded_from_analytics, false) as excluded_from_analytics,
    coalesce(grow_sessions.analytics_excluded_reason, '') as analytics_excluded_reason,
    coalesce(grow_sessions.is_deleted, false) as is_deleted,
    coalesce(grow_sessions.user_deleted, false) as user_deleted,
    grow_sessions.deleted_at,
    grow_sessions.user_deleted_at,
    grow_sessions.session_started_at,
    grow_sessions.soak_started_at,
    grow_sessions.germination_started_at,
    grow_sessions.completed_at
  into session_record
  from public.grow_sessions
  where grow_sessions.id = p_session_id;

  if not found then
    return 'missing_session';
  end if;

  select exists (
    select 1
    from public.grow_session_cleanup_audit cleanup_audit
    where coalesce(cleanup_audit.dry_run, true) = false
      and coalesce(cleanup_audit.confirmation_matched, false) = true
      and p_session_id = any (coalesce(cleanup_audit.candidate_session_ids, '{}'::uuid[]))
  )
  into cleanup_deleted;

  if cleanup_deleted then
    return 'cleanup_deleted_session';
  end if;

  normalized_status := lower(trim(coalesce(session_record.session_status, '')));
  normalized_visibility_status := lower(trim(coalesce(session_record.visibility_status, 'active')));

  if session_record.is_mock then
    return 'mock_session';
  end if;

  if session_record.is_test then
    return 'test_session';
  end if;

  if session_record.excluded_from_analytics then
    return coalesce(nullif(session_record.analytics_excluded_reason, ''), 'analytics_excluded');
  end if;

  if session_record.is_deleted
    or session_record.user_deleted
    or session_record.deleted_at is not null
    or session_record.user_deleted_at is not null
    or normalized_visibility_status in ('deleted', 'hidden', 'archived', 'archived_test')
    or normalized_status in ('deleted', 'archived', 'archived_test') then
    return 'deleted_session';
  end if;

  if normalized_status = 'abandoned' then
    return 'abandoned';
  end if;

  if normalized_status = 'failed' then
    return 'failed';
  end if;

  if normalized_status in ('canceled', 'cancelled') then
    return 'canceled';
  end if;

  if normalized_status not in ('completed', 'complete')
    and session_record.completed_at is null then
    return 'incomplete_session';
  end if;

  if session_record.session_started_at is not null
    and session_record.soak_started_at is not null
    and session_record.soak_started_at < session_record.session_started_at then
    return 'invalid_timeline';
  end if;

  if session_record.soak_started_at is not null
    and session_record.germination_started_at is not null
    and session_record.soak_started_at > session_record.germination_started_at then
    return 'invalid_timeline';
  end if;

  if session_record.germination_started_at is not null
    and session_record.completed_at is not null
    and session_record.germination_started_at > session_record.completed_at then
    return 'invalid_timeline';
  end if;

  if session_record.session_started_at is not null
    and session_record.completed_at is not null
    and session_record.completed_at < session_record.session_started_at then
    return 'invalid_timeline';
  end if;

  return '';
end;
$$;

create or replace function public.resolve_grow_session_lifecycle(p_session_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  session_record record;
  exclusion_reason text := public.get_grow_session_lifecycle_exclusion_reason(p_session_id);
  lifecycle_state text := 'completed';
  eligibility_state text := 'included';
  deletion_source text := '';
begin
  select
    grow_sessions.id,
    grow_sessions.session_status,
    grow_sessions.visibility_status,
    coalesce(grow_sessions.user_deleted, false) as user_deleted,
    coalesce(grow_sessions.is_deleted, false) as is_deleted,
    grow_sessions.deleted_at,
    grow_sessions.user_deleted_at,
    coalesce(grow_sessions.is_mock, false) as is_mock,
    coalesce(grow_sessions.is_test, false) as is_test,
    coalesce(grow_sessions.excluded_from_analytics, false) as excluded_from_analytics
  into session_record
  from public.grow_sessions
  where grow_sessions.id = p_session_id;

  if exclusion_reason = '' then
    return jsonb_build_object(
      'lifecycle_state', 'completed',
      'eligibility_state', 'included',
      'eligibility_reason', '',
      'deletion_source', '',
      'included', true
    );
  end if;

  eligibility_state := 'excluded';

  lifecycle_state := case
    when exclusion_reason = 'missing_session' then 'missing'
    when exclusion_reason = 'cleanup_deleted_session' then 'deleted_founder_cleanup'
    when exclusion_reason = 'mock_session' then 'mock'
    when exclusion_reason = 'test_session' then 'test'
    when exclusion_reason in ('analytics_excluded', 'founder_personal_test_cleanup') then 'analytics_disabled'
    when exclusion_reason = 'deleted_session'
      and found
      and (session_record.user_deleted or session_record.user_deleted_at is not null or lower(coalesce(session_record.visibility_status, '')) = 'hidden') then 'deleted_user'
    when exclusion_reason = 'deleted_session'
      and found
      and lower(coalesce(session_record.visibility_status, '')) in ('archived', 'archived_test') then 'archived'
    when exclusion_reason = 'deleted_session' then 'deleted_admin'
    when exclusion_reason in ('abandoned', 'failed', 'canceled') then exclusion_reason
    when exclusion_reason = 'incomplete_session' then 'incomplete'
    when exclusion_reason = 'invalid_timeline' then 'timeline_invalid'
    else 'analytics_disabled'
  end;

  deletion_source := case
    when lifecycle_state = 'deleted_founder_cleanup' then 'founder_cleanup'
    when lifecycle_state = 'deleted_user' then 'user'
    when lifecycle_state = 'deleted_admin' then 'admin_or_system'
    when lifecycle_state = 'archived'
      and found
      and lower(coalesce(session_record.visibility_status, '')) = 'archived_test' then 'founder_cleanup'
    when lifecycle_state = 'archived' then 'archive'
    else ''
  end;

  return jsonb_build_object(
    'lifecycle_state', lifecycle_state,
    'eligibility_state', eligibility_state,
    'eligibility_reason', exclusion_reason,
    'deletion_source', deletion_source,
    'included', false
  );
end;
$$;

create or replace function public.is_community_intelligence_session_eligible(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_grow_session_lifecycle_exclusion_reason(p_session_id) = '';
$$;

create or replace function public.get_explorer_grow_session_exclusion_reason(p_session_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.get_grow_session_lifecycle_exclusion_reason(p_session_id);
$$;

create or replace function public.is_explorer_grow_session_eligible(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_community_intelligence_session_eligible(p_session_id);
$$;

revoke all on function public.get_grow_session_lifecycle_exclusion_reason(uuid) from public;
revoke all on function public.resolve_grow_session_lifecycle(uuid) from public;
revoke all on function public.is_community_intelligence_session_eligible(uuid) from public;
revoke all on function public.get_explorer_grow_session_exclusion_reason(uuid) from public;
revoke all on function public.is_explorer_grow_session_eligible(uuid) from public;
grant execute on function public.get_grow_session_lifecycle_exclusion_reason(uuid) to service_role;
grant execute on function public.resolve_grow_session_lifecycle(uuid) to service_role;
grant execute on function public.is_community_intelligence_session_eligible(uuid) to service_role;
grant execute on function public.get_explorer_grow_session_exclusion_reason(uuid) to service_role;
grant execute on function public.is_explorer_grow_session_eligible(uuid) to service_role;

create or replace function public.get_grow_intelligence_engine_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  aggregate_payload jsonb;
begin
  with eligible_sessions as (
    select
      grow_sessions.id,
      coalesce(nullif(grow_sessions.system_type, ''), 'Grow Session') as method_type,
      grow_sessions.partitions
    from public.grow_sessions
    where public.is_community_intelligence_session_eligible(grow_sessions.id)
  ),
  partition_rows as (
    select
      eligible_sessions.id as session_id,
      eligible_sessions.method_type,
      partition_value as partition,
      greatest(0, coalesce(
        case when coalesce(partition_value ->> 'seedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'seedCount')::integer else null end,
        case when coalesce(partition_value ->> 'seed_count', '') ~ '^[0-9]+$' then (partition_value ->> 'seed_count')::integer else null end,
        case when coalesce(partition_value ->> 'totalSeeds', '') ~ '^[0-9]+$' then (partition_value ->> 'totalSeeds')::integer else null end,
        case when coalesce(partition_value ->> 'total_seeds', '') ~ '^[0-9]+$' then (partition_value ->> 'total_seeds')::integer else null end,
        case when coalesce(partition_value ->> 'seedsStarted', '') ~ '^[0-9]+$' then (partition_value ->> 'seedsStarted')::integer else null end,
        case when coalesce(partition_value ->> 'seeds_started', '') ~ '^[0-9]+$' then (partition_value ->> 'seeds_started')::integer else null end,
        case when coalesce(partition_value ->> 'seeds', '') ~ '^[0-9]+$' then (partition_value ->> 'seeds')::integer else null end,
        0
      )) as seed_count,
      greatest(0, coalesce(
        case when coalesce(partition_value ->> 'plantedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'plantedCount')::integer else null end,
        case when coalesce(partition_value ->> 'planted_count', '') ~ '^[0-9]+$' then (partition_value ->> 'planted_count')::integer else null end,
        case when coalesce(partition_value ->> 'germinatedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'germinatedCount')::integer else null end,
        case when coalesce(partition_value ->> 'germinated_count', '') ~ '^[0-9]+$' then (partition_value ->> 'germinated_count')::integer else null end,
        case when coalesce(partition_value ->> 'totalGerminated', '') ~ '^[0-9]+$' then (partition_value ->> 'totalGerminated')::integer else null end,
        case when coalesce(partition_value ->> 'total_germinated', '') ~ '^[0-9]+$' then (partition_value ->> 'total_germinated')::integer else null end,
        case when coalesce(partition_value ->> 'germinatedSeeds', '') ~ '^[0-9]+$' then (partition_value ->> 'germinatedSeeds')::integer else null end,
        case when coalesce(partition_value ->> 'germinated_seeds', '') ~ '^[0-9]+$' then (partition_value ->> 'germinated_seeds')::integer else null end,
        0
      )) as germinated_count
    from eligible_sessions
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(coalesce(eligible_sessions.partitions, '[]'::jsonb)) = 'array'
          then coalesce(eligible_sessions.partitions, '[]'::jsonb)
        when jsonb_typeof(coalesce(eligible_sessions.partitions, '{}'::jsonb)) = 'object'
          and jsonb_typeof(eligible_sessions.partitions -> 'partitions') = 'array'
          then eligible_sessions.partitions -> 'partitions'
        when jsonb_typeof(coalesce(eligible_sessions.partitions, '{}'::jsonb)) = 'object'
          and jsonb_typeof(eligible_sessions.partitions -> 'rows') = 'array'
          then eligible_sessions.partitions -> 'rows'
        else '[]'::jsonb
      end
    ) as partition_value
  ),
  normalized_rows as (
    select
      partition_rows.session_id,
      partition_rows.method_type,
      partition_rows.seed_count,
      least(partition_rows.seed_count, partition_rows.germinated_count) as germinated_count,
      nullif(trim(coalesce(
        partition_rows.partition ->> 'sourceDisplayName',
        partition_rows.partition ->> 'source_display_name',
        partition_rows.partition ->> 'sourceCanonicalName',
        partition_rows.partition ->> 'source_canonical_name',
        partition_rows.partition ->> 'sourceName',
        partition_rows.partition ->> 'source_name',
        partition_rows.partition ->> 'source',
        partition_rows.partition ->> 'breeder'
      )), '') as source_name,
      nullif(trim(coalesce(
        partition_rows.partition ->> 'seedVarietyDisplayName',
        partition_rows.partition ->> 'seed_variety_display_name',
        partition_rows.partition ->> 'seedVarietyCanonicalName',
        partition_rows.partition ->> 'seed_variety_canonical_name',
        partition_rows.partition ->> 'seedVariety',
        partition_rows.partition ->> 'seed_variety',
        partition_rows.partition ->> 'varietyName',
        partition_rows.partition ->> 'variety_name',
        partition_rows.partition ->> 'variety',
        partition_rows.partition ->> 'strain',
        partition_rows.partition ->> 'seedName',
        partition_rows.partition ->> 'seed_name'
      )), '') as variety_name,
      nullif(trim(coalesce(
        partition_rows.partition ->> 'sourceCanonicalId',
        partition_rows.partition ->> 'source_canonical_id'
      )), '') as source_canonical_id,
      nullif(trim(coalesce(
        partition_rows.partition ->> 'seedVarietyCanonicalId',
        partition_rows.partition ->> 'seed_variety_canonical_id'
      )), '') as variety_canonical_id,
      nullif(trim(coalesce(
        partition_rows.partition ->> 'seedType',
        partition_rows.partition ->> 'seed_type',
        partition_rows.partition ->> 'type'
      )), '') as seed_type,
      nullif(trim(coalesce(
        partition_rows.partition ->> 'sex',
        partition_rows.partition ->> 'feminized',
        partition_rows.partition ->> 'seedSex',
        partition_rows.partition ->> 'seed_sex'
      )), '') as seed_sex,
      case
        when coalesce(partition_rows.partition ->> 'seedAgeYears', partition_rows.partition ->> 'seed_age_years', '') ~ '^[0-9]+(\.[0-9]+)?$'
          then (coalesce(partition_rows.partition ->> 'seedAgeYears', partition_rows.partition ->> 'seed_age_years'))::numeric
        else null
      end as seed_age_years
    from partition_rows
  ),
  valid_rows as (
    select
      normalized_rows.*,
      coalesce(
        normalized_rows.source_canonical_id,
        nullif(trim(regexp_replace(lower(coalesce(normalized_rows.source_name, '')), '[^a-z0-9]+', ' ', 'g')), '')
      ) as source_key,
      coalesce(
        normalized_rows.variety_canonical_id,
        nullif(trim(regexp_replace(lower(coalesce(normalized_rows.variety_name, '')), '[^a-z0-9]+', ' ', 'g')), '')
      ) as variety_key
    from normalized_rows
    where normalized_rows.seed_count > 0
      and normalized_rows.variety_name is not null
      and normalized_rows.germinated_count between 0 and normalized_rows.seed_count
  ),
  variety_sources as (
    select
      variety_key,
      source_key,
      max(source_name) as source_name,
      sum(seed_count) as source_seed_count
    from valid_rows
    where source_key is not null
    group by variety_key, source_key
  ),
  variety_primary_sources as (
    select distinct on (variety_key)
      variety_key,
      source_key,
      source_name
    from variety_sources
    order by variety_key, source_seed_count desc, source_name asc
  ),
  variety_aggregate as (
    select
      valid_rows.variety_key,
      max(valid_rows.variety_name) as variety_name,
      coalesce(
        case when count(distinct valid_rows.source_key) > 1 then 'Multiple Sources' else max(variety_primary_sources.source_name) end,
        'Community Sources'
      ) as source_name,
      case when count(distinct valid_rows.source_key) = 1 then max(variety_primary_sources.source_key) else '' end as source_key,
      coalesce(nullif(mode() within group (order by valid_rows.seed_type), ''), 'Seed') as seed_type,
      coalesce(nullif(mode() within group (order by valid_rows.seed_sex), ''), '') as seed_sex,
      count(distinct valid_rows.session_id) as community_sessions,
      sum(valid_rows.seed_count) as total_seeds,
      sum(valid_rows.germinated_count) as total_germinated,
      min(valid_rows.seed_age_years) as min_seed_age,
      max(valid_rows.seed_age_years) as max_seed_age,
      array_remove(array_agg(distinct valid_rows.method_type), null) as methods
    from valid_rows
    left join variety_primary_sources
      on variety_primary_sources.variety_key = valid_rows.variety_key
    where valid_rows.variety_key is not null
    group by valid_rows.variety_key
  ),
  source_aggregate as (
    select
      valid_rows.source_key,
      max(valid_rows.source_name) as source_name,
      count(distinct valid_rows.session_id) as sessions_logged,
      sum(valid_rows.seed_count) as total_seeds,
      sum(valid_rows.germinated_count) as total_germinated,
      jsonb_agg(distinct valid_rows.variety_name) filter (where valid_rows.variety_name is not null) as varieties
    from valid_rows
    where valid_rows.source_key is not null
    group by valid_rows.source_key
  ),
  source_seed_type_aggregate as (
    select
      valid_rows.source_key,
      coalesce(nullif(valid_rows.seed_type, ''), 'unknown') as seed_type,
      sum(valid_rows.seed_count) as total_seeds,
      sum(valid_rows.germinated_count) as total_germinated
    from valid_rows
    where valid_rows.source_key is not null
    group by valid_rows.source_key, coalesce(nullif(valid_rows.seed_type, ''), 'unknown')
  ),
  source_records as (
    select
      source_aggregate.source_key,
      source_aggregate.source_name,
      source_aggregate.sessions_logged,
      source_aggregate.total_seeds,
      source_aggregate.total_germinated,
      source_aggregate.varieties,
      coalesce(
        (
          select jsonb_object_agg(
            source_seed_type_aggregate.seed_type,
            jsonb_build_object(
              'totalSeeds', source_seed_type_aggregate.total_seeds,
              'totalGerminated', source_seed_type_aggregate.total_germinated
            )
          )
          from source_seed_type_aggregate
          where source_seed_type_aggregate.source_key = source_aggregate.source_key
        ),
        '{}'::jsonb
      ) as seed_type_stats
    from source_aggregate
  )
  select jsonb_build_object(
    'engine_version', 'gie.v1',
    'schema_version', '2026-07-13.1',
    'generated_at', timezone('utc', now()),
    'seed_records',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', variety_aggregate.variety_key,
          'varietyName', variety_aggregate.variety_name,
          'source', variety_aggregate.source_name,
          'sourceId', variety_aggregate.source_key,
          'seedType', variety_aggregate.seed_type,
          'sex', variety_aggregate.seed_sex,
          'batchAge', case
            when variety_aggregate.min_seed_age is null then 'Age not tracked'
            when variety_aggregate.max_seed_age <= 1 then 'Fresh to 1 year'
            when variety_aggregate.min_seed_age >= 3 then 'Archive / older lots'
            when variety_aggregate.max_seed_age <= 2 then '1-2 years'
            else 'Mixed ages'
          end,
          'communitySessions', variety_aggregate.community_sessions,
          'seedsTracked', variety_aggregate.total_seeds,
          'totalGerminated', variety_aggregate.total_germinated,
          'germinationSuccess', case
            when variety_aggregate.total_seeds > 0
              then round((variety_aggregate.total_germinated::numeric / variety_aggregate.total_seeds::numeric) * 100)::integer
            else 0
          end,
          'summary', variety_aggregate.variety_name || ' is represented by ' || variety_aggregate.total_seeds || ' seeds across ' || variety_aggregate.community_sessions || ' completed session' || case when variety_aggregate.community_sessions = 1 then '' else 's' end || '.',
          'sourceRelationship', case
            when variety_aggregate.source_name = 'Multiple Sources' then 'This variety has completed-session evidence across multiple sources.'
            else 'Completed-session evidence is currently tied to ' || variety_aggregate.source_name || '.'
          end,
          'growInsight', case
            when cardinality(variety_aggregate.methods) > 0 then 'Observed through ' || array_to_string(variety_aggregate.methods[1:3], ', ') || case when cardinality(variety_aggregate.methods) > 3 then ', and other methods.' else '.' end
            else 'Grow-method distribution will expand as more completed sessions are added.'
          end,
          'isAnonymizedAggregate', true,
          'publicEvidenceCount', 0
        )
        order by variety_aggregate.community_sessions desc, variety_aggregate.total_seeds desc, variety_aggregate.variety_name asc
      )
      from variety_aggregate
    ), '[]'::jsonb),
    'source_records',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'key', source_records.source_key,
          'name', source_records.source_name,
          'sessionsLogged', source_records.sessions_logged,
          'totalSeeds', source_records.total_seeds,
          'totalGerminated', source_records.total_germinated,
          'varieties', coalesce(source_records.varieties, '[]'::jsonb),
          'seedTypeStats', coalesce(source_records.seed_type_stats, '{}'::jsonb),
          'lastLoggedAt', ''
        )
        order by source_records.sessions_logged desc, source_records.total_seeds desc, source_records.source_name asc
      )
      from source_records
    ), '[]'::jsonb),
    'total_breeders_logged',
    (select count(distinct coalesce(source_key, source_name)) from valid_rows where source_name is not null),
    'total_varieties_logged',
    (select count(distinct variety_key) from valid_rows where variety_key is not null),
    'total_completed_sessions',
    (select count(distinct session_id) from valid_rows)
  )
  into aggregate_payload;

  return coalesce(aggregate_payload, jsonb_build_object(
    'engine_version', 'gie.v1',
    'schema_version', '2026-07-13.1',
    'generated_at', timezone('utc', now()),
    'seed_records', '[]'::jsonb,
    'source_records', '[]'::jsonb,
    'total_breeders_logged', 0,
    'total_varieties_logged', 0,
    'total_completed_sessions', 0
  ));
end;
$$;

revoke all on function public.get_grow_intelligence_engine_analytics() from public;
grant execute on function public.get_grow_intelligence_engine_analytics() to anon;
grant execute on function public.get_grow_intelligence_engine_analytics() to authenticated;

create or replace function public.get_explorer_completed_session_aggregates()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select public.get_grow_intelligence_engine_analytics();
$$;

revoke all on function public.get_explorer_completed_session_aggregates() from public;
grant execute on function public.get_explorer_completed_session_aggregates() to anon;
grant execute on function public.get_explorer_completed_session_aggregates() to authenticated;

create or replace function public.get_explorer_completed_session_aggregate_diagnostics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  diagnostics jsonb;
begin
  if not exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
    and coalesce(auth.role(), '') <> 'service_role'
    and session_user not in ('postgres', 'service_role') then
    raise exception 'Admin or service-role access is required'
      using errcode = '42501';
  end if;

  with session_base as (
    select
      grow_sessions.id,
      grow_sessions.user_id,
      coalesce(nullif(grow_sessions.session_name, ''), nullif(grow_sessions.custom_session_name, ''), grow_sessions.id::text) as session_label,
      grow_sessions.created_at,
      grow_sessions.completed_at,
      grow_sessions.session_status,
      grow_sessions.visibility_status,
      grow_sessions.partitions,
      public.resolve_grow_session_lifecycle(grow_sessions.id) as lifecycle_result
    from public.grow_sessions
  ),
  lifecycle_sessions as (
    select
      session_base.*,
      session_base.lifecycle_result ->> 'lifecycle_state' as lifecycle_state,
      session_base.lifecycle_result ->> 'eligibility_state' as eligibility_state,
      session_base.lifecycle_result ->> 'eligibility_reason' as explorer_exclusion_reason,
      session_base.lifecycle_result ->> 'deletion_source' as deletion_source,
      coalesce((session_base.lifecycle_result ->> 'included')::boolean, false) as included
    from session_base
  ),
  result_row_counts as (
    select
      lifecycle_sessions.id as session_id,
      count(*) filter (
        where seed_count > 0
          and variety_name is not null
          and germinated_count between 0 and seed_count
      ) as valid_result_rows,
      coalesce(sum(seed_count) filter (
        where seed_count > 0
          and variety_name is not null
          and germinated_count between 0 and seed_count
      ), 0) as seeds_tested,
      coalesce(sum(least(seed_count, germinated_count)) filter (
        where seed_count > 0
          and variety_name is not null
          and germinated_count between 0 and seed_count
      ), 0) as seeds_germinated
    from lifecycle_sessions
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(coalesce(lifecycle_sessions.partitions, '[]'::jsonb)) = 'array'
          then coalesce(lifecycle_sessions.partitions, '[]'::jsonb)
        when jsonb_typeof(coalesce(lifecycle_sessions.partitions, '{}'::jsonb)) = 'object'
          and jsonb_typeof(lifecycle_sessions.partitions -> 'partitions') = 'array'
          then lifecycle_sessions.partitions -> 'partitions'
        when jsonb_typeof(coalesce(lifecycle_sessions.partitions, '{}'::jsonb)) = 'object'
          and jsonb_typeof(lifecycle_sessions.partitions -> 'rows') = 'array'
          then lifecycle_sessions.partitions -> 'rows'
        else '[]'::jsonb
      end
    ) as partition_value
    cross join lateral (
      select
        greatest(0, coalesce(
          case when coalesce(partition_value ->> 'seedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'seedCount')::integer else null end,
          case when coalesce(partition_value ->> 'seed_count', '') ~ '^[0-9]+$' then (partition_value ->> 'seed_count')::integer else null end,
          case when coalesce(partition_value ->> 'totalSeeds', '') ~ '^[0-9]+$' then (partition_value ->> 'totalSeeds')::integer else null end,
          case when coalesce(partition_value ->> 'total_seeds', '') ~ '^[0-9]+$' then (partition_value ->> 'total_seeds')::integer else null end,
          case when coalesce(partition_value ->> 'seedsStarted', '') ~ '^[0-9]+$' then (partition_value ->> 'seedsStarted')::integer else null end,
          case when coalesce(partition_value ->> 'seeds_started', '') ~ '^[0-9]+$' then (partition_value ->> 'seeds_started')::integer else null end,
          case when coalesce(partition_value ->> 'seeds', '') ~ '^[0-9]+$' then (partition_value ->> 'seeds')::integer else null end,
          0
        )) as seed_count,
        greatest(0, coalesce(
          case when coalesce(partition_value ->> 'plantedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'plantedCount')::integer else null end,
          case when coalesce(partition_value ->> 'planted_count', '') ~ '^[0-9]+$' then (partition_value ->> 'planted_count')::integer else null end,
          case when coalesce(partition_value ->> 'germinatedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'germinatedCount')::integer else null end,
          case when coalesce(partition_value ->> 'germinated_count', '') ~ '^[0-9]+$' then (partition_value ->> 'germinated_count')::integer else null end,
          case when coalesce(partition_value ->> 'totalGerminated', '') ~ '^[0-9]+$' then (partition_value ->> 'totalGerminated')::integer else null end,
          case when coalesce(partition_value ->> 'total_germinated', '') ~ '^[0-9]+$' then (partition_value ->> 'total_germinated')::integer else null end,
          0
        )) as germinated_count,
        nullif(trim(coalesce(
          partition_value ->> 'seedVarietyDisplayName',
          partition_value ->> 'seed_variety_display_name',
          partition_value ->> 'seedVariety',
          partition_value ->> 'seed_variety',
          partition_value ->> 'varietyName',
          partition_value ->> 'variety_name',
          partition_value ->> 'variety',
          partition_value ->> 'strain',
          partition_value ->> 'seedName',
          partition_value ->> 'seed_name'
        )), '') as variety_name
    ) row_values
    group by lifecycle_sessions.id
  ),
  classified_sessions_with_counts as (
    select
      lifecycle_sessions.*,
      coalesce(result_row_counts.valid_result_rows, 0) as valid_result_rows,
      coalesce(result_row_counts.seeds_tested, 0) as seeds_tested,
      coalesce(result_row_counts.seeds_germinated, 0) as seeds_germinated
    from lifecycle_sessions
    left join result_row_counts
      on result_row_counts.session_id = lifecycle_sessions.id
  ),
  classified_sessions as (
    select *
    from classified_sessions_with_counts
  ),
  partition_rows as (
    select
      classified_sessions.id as session_id,
      classified_sessions.explorer_exclusion_reason,
      partition_value as partition,
      greatest(0, coalesce(
        case when coalesce(partition_value ->> 'seedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'seedCount')::integer else null end,
        case when coalesce(partition_value ->> 'seed_count', '') ~ '^[0-9]+$' then (partition_value ->> 'seed_count')::integer else null end,
        case when coalesce(partition_value ->> 'totalSeeds', '') ~ '^[0-9]+$' then (partition_value ->> 'totalSeeds')::integer else null end,
        case when coalesce(partition_value ->> 'total_seeds', '') ~ '^[0-9]+$' then (partition_value ->> 'total_seeds')::integer else null end,
        case when coalesce(partition_value ->> 'seedsStarted', '') ~ '^[0-9]+$' then (partition_value ->> 'seedsStarted')::integer else null end,
        case when coalesce(partition_value ->> 'seeds_started', '') ~ '^[0-9]+$' then (partition_value ->> 'seeds_started')::integer else null end,
        case when coalesce(partition_value ->> 'seeds', '') ~ '^[0-9]+$' then (partition_value ->> 'seeds')::integer else null end,
        0
      )) as seed_count,
      greatest(0, coalesce(
        case when coalesce(partition_value ->> 'plantedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'plantedCount')::integer else null end,
        case when coalesce(partition_value ->> 'planted_count', '') ~ '^[0-9]+$' then (partition_value ->> 'planted_count')::integer else null end,
        case when coalesce(partition_value ->> 'germinatedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'germinatedCount')::integer else null end,
        case when coalesce(partition_value ->> 'germinated_count', '') ~ '^[0-9]+$' then (partition_value ->> 'germinated_count')::integer else null end,
        case when coalesce(partition_value ->> 'totalGerminated', '') ~ '^[0-9]+$' then (partition_value ->> 'totalGerminated')::integer else null end,
        case when coalesce(partition_value ->> 'total_germinated', '') ~ '^[0-9]+$' then (partition_value ->> 'total_germinated')::integer else null end,
        0
      )) as germinated_count,
      nullif(trim(coalesce(
        partition_value ->> 'seedVarietyDisplayName',
        partition_value ->> 'seed_variety_display_name',
        partition_value ->> 'seedVariety',
        partition_value ->> 'seed_variety',
        partition_value ->> 'varietyName',
        partition_value ->> 'variety_name',
        partition_value ->> 'variety',
        partition_value ->> 'strain',
        partition_value ->> 'seedName',
        partition_value ->> 'seed_name'
      )), '') as variety_name,
      nullif(trim(coalesce(
        partition_value ->> 'sourceDisplayName',
        partition_value ->> 'source_display_name',
        partition_value ->> 'sourceName',
        partition_value ->> 'source_name',
        partition_value ->> 'source',
        partition_value ->> 'breeder'
      )), '') as source_name
    from classified_sessions
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(coalesce(classified_sessions.partitions, '[]'::jsonb)) = 'array'
          then coalesce(classified_sessions.partitions, '[]'::jsonb)
        when jsonb_typeof(coalesce(classified_sessions.partitions, '{}'::jsonb)) = 'object'
          and jsonb_typeof(classified_sessions.partitions -> 'partitions') = 'array'
          then classified_sessions.partitions -> 'partitions'
        when jsonb_typeof(coalesce(classified_sessions.partitions, '{}'::jsonb)) = 'object'
          and jsonb_typeof(classified_sessions.partitions -> 'rows') = 'array'
          then classified_sessions.partitions -> 'rows'
        else '[]'::jsonb
      end
    ) as partition_value
  ),
  eligible_result_rows as (
    select *
    from partition_rows
    where explorer_exclusion_reason = ''
      and seed_count > 0
      and variety_name is not null
      and germinated_count between 0 and seed_count
  ),
  exclusion_counts as (
    select
      coalesce(nullif(explorer_exclusion_reason, ''), 'eligible') as reason,
      count(*) as count
    from classified_sessions
    group by coalesce(nullif(explorer_exclusion_reason, ''), 'eligible')
  ),
  included_session_audit as (
    select
      jsonb_agg(
        jsonb_build_object(
          'session_id', classified_sessions.id,
          'session_name', classified_sessions.session_label,
          'lifecycle_state', classified_sessions.lifecycle_state,
          'eligibility_state', classified_sessions.eligibility_state,
          'eligibility_reason', classified_sessions.explorer_exclusion_reason,
          'deletion_source', classified_sessions.deletion_source,
          'included', classified_sessions.included,
          'session_status', classified_sessions.session_status,
          'visibility_status', classified_sessions.visibility_status,
          'completed_at', classified_sessions.completed_at,
          'result_rows', classified_sessions.valid_result_rows,
          'seeds_tested', classified_sessions.seeds_tested,
          'seeds_germinated', classified_sessions.seeds_germinated
        )
        order by classified_sessions.completed_at desc nulls last, classified_sessions.created_at desc nulls last
      ) as rows
    from classified_sessions
    where classified_sessions.explorer_exclusion_reason = ''
  ),
  excluded_session_audit as (
    select
      jsonb_agg(
        jsonb_build_object(
          'session_id', classified_sessions.id,
          'session_name', classified_sessions.session_label,
          'lifecycle_state', classified_sessions.lifecycle_state,
          'eligibility_state', classified_sessions.eligibility_state,
          'eligibility_reason', classified_sessions.explorer_exclusion_reason,
          'deletion_source', classified_sessions.deletion_source,
          'included', classified_sessions.included,
          'session_status', classified_sessions.session_status,
          'visibility_status', classified_sessions.visibility_status,
          'completed_at', classified_sessions.completed_at,
          'result_rows', classified_sessions.valid_result_rows,
          'seeds_tested', classified_sessions.seeds_tested,
          'seeds_germinated', classified_sessions.seeds_germinated
        )
        order by classified_sessions.explorer_exclusion_reason asc, classified_sessions.completed_at desc nulls last, classified_sessions.created_at desc nulls last
      ) as rows
    from classified_sessions
    where classified_sessions.explorer_exclusion_reason <> ''
  )
  select jsonb_build_object(
    'health_status', case
      when (select count(*) from classified_sessions where explorer_exclusion_reason = '' and valid_result_rows <= 0) > 0 then 'needs_review'
      else 'healthy'
    end,
    'engine_version', 'gie.v1',
    'schema_version', '2026-07-13.1',
    'generated_at', timezone('utc', now()),
    'integrity_score', case
      when (select count(*) from classified_sessions where explorer_exclusion_reason = '') = 0 then 100
      else round(
        (
          (select count(*) from classified_sessions where explorer_exclusion_reason = '' and valid_result_rows > 0)::numeric
          / nullif((select count(*) from classified_sessions where explorer_exclusion_reason = ''), 0)::numeric
        ) * 100
      )::integer
    end,
    'total_sessions_inspected', (select count(*) from classified_sessions),
    'included_completed_sessions', (select count(distinct session_id) from eligible_result_rows),
    'excluded_deleted_sessions', (select count(*) from classified_sessions where explorer_exclusion_reason = 'deleted_session'),
    'excluded_cleanup_deleted_sessions', (select count(*) from classified_sessions where explorer_exclusion_reason = 'cleanup_deleted_session'),
    'excluded_test_mock_qa_demo_sessions', (select count(*) from classified_sessions where explorer_exclusion_reason in ('mock_session', 'test_session')),
    'excluded_incomplete_sessions', (select count(*) from classified_sessions where explorer_exclusion_reason = 'incomplete_session'),
    'excluded_abandoned_failed_canceled_sessions', (select count(*) from classified_sessions where explorer_exclusion_reason in ('abandoned', 'failed', 'canceled')),
    'excluded_analytics_disabled_sessions', (select count(*) from classified_sessions where explorer_exclusion_reason not in ('', 'mock_session', 'test_session', 'deleted_session', 'cleanup_deleted_session', 'abandoned', 'failed', 'canceled', 'incomplete_session', 'invalid_timeline')),
    'excluded_invalid_timeline_sessions', (select count(*) from classified_sessions where explorer_exclusion_reason = 'invalid_timeline'),
    'retained_deleted_account_sessions', (
      select count(*)
      from classified_sessions
      where classified_sessions.explorer_exclusion_reason = ''
        and classified_sessions.user_id is not null
        and not exists (
          select 1
          from auth.users
          where users.id = classified_sessions.user_id
        )
    ),
    'aggregate_seed_record_count', (select count(distinct lower(regexp_replace(variety_name, '[^a-z0-9]+', ' ', 'g'))) from eligible_result_rows),
    'aggregate_source_record_count', (select count(distinct lower(regexp_replace(source_name, '[^a-z0-9]+', ' ', 'g'))) from eligible_result_rows where source_name is not null),
    'eligible_result_rows', (select count(*) from eligible_result_rows),
    'result_rows_missing_variety', (select count(*) from partition_rows where explorer_exclusion_reason = '' and seed_count > 0 and variety_name is null),
    'result_rows_missing_source', (select count(*) from eligible_result_rows where source_name is null),
    'result_rows_without_seed_count', (select count(*) from partition_rows where explorer_exclusion_reason = '' and seed_count <= 0),
    'sessions_excluded_by_reason', coalesce((select jsonb_object_agg(reason, count) from exclusion_counts), '{}'::jsonb),
    'included_session_audit', coalesce((select rows from included_session_audit), '[]'::jsonb),
    'excluded_session_audit', coalesce((select rows from excluded_session_audit), '[]'::jsonb)
  )
  into diagnostics;

  return diagnostics;
end;
$$;

revoke all on function public.get_explorer_completed_session_aggregate_diagnostics() from public;
grant execute on function public.get_explorer_completed_session_aggregate_diagnostics() to authenticated;
grant execute on function public.get_explorer_completed_session_aggregate_diagnostics() to service_role;

create or replace function public.get_grow_intelligence_engine_diagnostics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
    and coalesce(auth.role(), '') <> 'service_role'
    and session_user not in ('postgres', 'service_role') then
    raise exception 'Admin or service-role access is required'
      using errcode = '42501';
  end if;

  return public.get_explorer_completed_session_aggregate_diagnostics();
end;
$$;

revoke all on function public.get_grow_intelligence_engine_diagnostics() from public;
grant execute on function public.get_grow_intelligence_engine_diagnostics() to authenticated;
grant execute on function public.get_grow_intelligence_engine_diagnostics() to service_role;

comment on function public.get_explorer_grow_session_exclusion_reason(uuid) is
  'Backward-compatible wrapper around the canonical Grow Session lifecycle resolver exclusion reason.';

comment on function public.is_explorer_grow_session_eligible(uuid) is
  'Backward-compatible wrapper around the canonical Community Intelligence session eligibility predicate.';

comment on function public.get_grow_session_lifecycle_exclusion_reason(uuid) is
  'Canonical Grow Session lifecycle exclusion reason. Empty string means the completed session can contribute anonymous Community Intelligence aggregates.';

comment on function public.resolve_grow_session_lifecycle(uuid) is
  'Canonical Grow Session lifecycle resolver returning lifecycle_state, eligibility_state, eligibility_reason, deletion_source, and included.';

comment on function public.is_community_intelligence_session_eligible(uuid) is
  'Boolean wrapper for Grow Intelligence Engine aggregate eligibility. All aggregate consumers should use this lifecycle-backed predicate.';

comment on function public.get_grow_intelligence_engine_analytics() is
  'Canonical Grow Intelligence Engine v1 analytics payload. All analytics consumers should read this output rather than recomputing statistics.';

comment on function public.get_explorer_completed_session_aggregates() is
  'Backward-compatible wrapper around get_grow_intelligence_engine_analytics for Seed Explorer and Source Explorer.';

comment on function public.get_explorer_completed_session_aggregate_diagnostics() is
  'Backward-compatible admin/service-role diagnostic wrapper for Grow Intelligence Engine data health.';

comment on function public.get_grow_intelligence_engine_diagnostics() is
  'Admin/service-role Grow Intelligence Engine data health diagnostic. Includes session audit details for admins only; public aggregate output remains anonymous.';

notify pgrst, 'reload schema';
