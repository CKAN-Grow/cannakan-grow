-- Legacy-compatible Explorer completed-session aggregates
--
-- Corrects 20260713133000_explorer_completed_session_aggregates.sql by avoiding
-- the stricter gallery/CSTP analytics eligibility function for Explorer totals.
-- Explorer intelligence may include legitimate completed private/unpublished
-- sessions, but this RPC still returns only anonymous grouped statistics.

create or replace function public.get_explorer_completed_session_aggregates()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  aggregate_payload jsonb;
begin
  with session_candidates as (
    select
      grow_sessions.id,
      coalesce(nullif(grow_sessions.system_type, ''), 'Grow Session') as method_type,
      grow_sessions.partitions,
      lower(coalesce(grow_sessions.session_status, '')) as normalized_status,
      lower(coalesce(grow_sessions.visibility_status, 'active')) as normalized_visibility_status,
      coalesce(grow_sessions.is_mock, false) as is_mock,
      coalesce(grow_sessions.is_test, false) as is_test,
      coalesce(grow_sessions.excluded_from_analytics, false) as excluded_from_analytics,
      coalesce(grow_sessions.is_deleted, false) as is_deleted,
      coalesce(grow_sessions.user_deleted, false) as user_deleted,
      grow_sessions.deleted_at,
      grow_sessions.user_deleted_at,
      grow_sessions.session_started_at,
      grow_sessions.soak_started_at,
      grow_sessions.germination_started_at,
      grow_sessions.completed_at
    from public.grow_sessions
  ),
  classified_sessions as (
    select
      session_candidates.*,
      case
        when session_candidates.is_mock then 'mock_session'
        when session_candidates.is_test then 'test_session'
        when session_candidates.excluded_from_analytics then 'analytics_excluded'
        when session_candidates.is_deleted
          or session_candidates.user_deleted
          or session_candidates.deleted_at is not null
          or session_candidates.user_deleted_at is not null
          or session_candidates.normalized_visibility_status in ('deleted', 'archived', 'archived_test')
          or session_candidates.normalized_status in ('deleted', 'archived', 'archived_test') then 'deleted_session'
        when session_candidates.normalized_status in ('abandoned', 'failed', 'canceled', 'cancelled') then 'abandoned_session'
        when session_candidates.normalized_status not in ('completed', 'complete')
          and session_candidates.completed_at is null then 'incomplete_session'
        when session_candidates.session_started_at is not null
          and session_candidates.soak_started_at is not null
          and session_candidates.soak_started_at < session_candidates.session_started_at then 'invalid_timeline'
        when session_candidates.soak_started_at is not null
          and session_candidates.germination_started_at is not null
          and session_candidates.soak_started_at > session_candidates.germination_started_at then 'invalid_timeline'
        when session_candidates.germination_started_at is not null
          and session_candidates.completed_at is not null
          and session_candidates.germination_started_at > session_candidates.completed_at then 'invalid_timeline'
        when session_candidates.session_started_at is not null
          and session_candidates.completed_at is not null
          and session_candidates.completed_at < session_candidates.session_started_at then 'invalid_timeline'
        else ''
      end as explorer_exclusion_reason
    from session_candidates
  ),
  eligible_sessions as (
    select
      classified_sessions.id,
      classified_sessions.method_type,
      classified_sessions.partitions
    from classified_sessions
    where classified_sessions.explorer_exclusion_reason = ''
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
    'seed_records', '[]'::jsonb,
    'source_records', '[]'::jsonb,
    'total_breeders_logged', 0,
    'total_varieties_logged', 0,
    'total_completed_sessions', 0
  ));
end;
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
  if current_user not in ('postgres', 'service_role')
    and not exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    ) then
    raise exception 'Admin or service-role access is required'
      using errcode = '42501';
  end if;

  with session_candidates as (
    select
      grow_sessions.id,
      grow_sessions.partitions,
      lower(coalesce(grow_sessions.session_status, '')) as normalized_status,
      lower(coalesce(grow_sessions.visibility_status, 'active')) as normalized_visibility_status,
      coalesce(grow_sessions.is_mock, false) as is_mock,
      coalesce(grow_sessions.is_test, false) as is_test,
      coalesce(grow_sessions.excluded_from_analytics, false) as excluded_from_analytics,
      coalesce(grow_sessions.is_deleted, false) as is_deleted,
      coalesce(grow_sessions.user_deleted, false) as user_deleted,
      grow_sessions.deleted_at,
      grow_sessions.user_deleted_at,
      grow_sessions.session_started_at,
      grow_sessions.soak_started_at,
      grow_sessions.germination_started_at,
      grow_sessions.completed_at
    from public.grow_sessions
  ),
  classified_sessions as (
    select
      session_candidates.*,
      case
        when session_candidates.is_mock then 'mock_session'
        when session_candidates.is_test then 'test_session'
        when session_candidates.excluded_from_analytics then 'analytics_excluded'
        when session_candidates.is_deleted
          or session_candidates.user_deleted
          or session_candidates.deleted_at is not null
          or session_candidates.user_deleted_at is not null
          or session_candidates.normalized_visibility_status in ('deleted', 'archived', 'archived_test')
          or session_candidates.normalized_status in ('deleted', 'archived', 'archived_test') then 'deleted_session'
        when session_candidates.normalized_status in ('abandoned', 'failed', 'canceled', 'cancelled') then 'abandoned_session'
        when session_candidates.normalized_status not in ('completed', 'complete')
          and session_candidates.completed_at is null then 'incomplete_session'
        when session_candidates.session_started_at is not null
          and session_candidates.soak_started_at is not null
          and session_candidates.soak_started_at < session_candidates.session_started_at then 'invalid_timeline'
        when session_candidates.soak_started_at is not null
          and session_candidates.germination_started_at is not null
          and session_candidates.soak_started_at > session_candidates.germination_started_at then 'invalid_timeline'
        when session_candidates.germination_started_at is not null
          and session_candidates.completed_at is not null
          and session_candidates.germination_started_at > session_candidates.completed_at then 'invalid_timeline'
        when session_candidates.session_started_at is not null
          and session_candidates.completed_at is not null
          and session_candidates.completed_at < session_candidates.session_started_at then 'invalid_timeline'
        else ''
      end as explorer_exclusion_reason
    from session_candidates
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
  )
  select jsonb_build_object(
    'total_sessions_inspected', (select count(*) from classified_sessions),
    'completed_sessions_found', (select count(*) from classified_sessions where normalized_status in ('completed', 'complete') or completed_at is not null),
    'sessions_excluded_by_reason', coalesce((select jsonb_object_agg(reason, count) from exclusion_counts), '{}'::jsonb),
    'eligible_sessions', (select count(*) from classified_sessions where explorer_exclusion_reason = ''),
    'partition_rows_found', (select count(*) from partition_rows where explorer_exclusion_reason = ''),
    'eligible_result_rows', (select count(*) from eligible_result_rows),
    'result_rows_missing_variety', (select count(*) from partition_rows where explorer_exclusion_reason = '' and seed_count > 0 and variety_name is null),
    'result_rows_missing_source', (select count(*) from eligible_result_rows where source_name is null),
    'result_rows_without_seed_count', (select count(*) from partition_rows where explorer_exclusion_reason = '' and seed_count <= 0),
    'variety_count', (select count(distinct lower(regexp_replace(variety_name, '[^a-z0-9]+', ' ', 'g'))) from eligible_result_rows),
    'source_count', (select count(distinct lower(regexp_replace(source_name, '[^a-z0-9]+', ' ', 'g'))) from eligible_result_rows where source_name is not null)
  )
  into diagnostics;

  return diagnostics;
end;
$$;

revoke all on function public.get_explorer_completed_session_aggregate_diagnostics() from public;
grant execute on function public.get_explorer_completed_session_aggregate_diagnostics() to authenticated;
grant execute on function public.get_explorer_completed_session_aggregate_diagnostics() to service_role;

comment on function public.get_explorer_completed_session_aggregates() is
  'Returns anonymized completed-session aggregate intelligence for Seed Explorer and Source Explorer. Supports legacy completed sessions with missing completed_at when status is completed/complete. Does not expose users, profiles, session titles, dates, notes, images, or private report links.';

comment on function public.get_explorer_completed_session_aggregate_diagnostics() is
  'Admin/service-role diagnostic for anonymous Explorer aggregate eligibility counts. Does not return user IDs, session IDs, titles, notes, images, or profile details.';
