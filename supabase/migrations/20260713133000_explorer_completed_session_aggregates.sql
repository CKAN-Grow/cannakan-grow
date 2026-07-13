-- Explorer completed-session aggregate intelligence
--
-- Completed Grow Session results may contribute anonymized aggregate Explorer
-- intelligence even when the session/profile/snapshot is private. Individual
-- public evidence remains limited to approved Community Grow snapshots in app
-- code and is intentionally not returned here.

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
  with eligible_sessions as (
    select
      grow_sessions.id,
      coalesce(nullif(grow_sessions.system_type, ''), 'Grow Session') as method_type,
      grow_sessions.partitions
    from public.grow_sessions
    where public.is_grow_session_analytics_eligible(grow_sessions.id)
      and coalesce(grow_sessions.is_mock, false) = false
      and coalesce(grow_sessions.is_test, false) = false
      and coalesce(grow_sessions.excluded_from_analytics, false) = false
  ),
  partition_rows as (
    select
      eligible_sessions.id as session_id,
      eligible_sessions.method_type,
      partition_value as partition,
      greatest(0, coalesce(
        case when coalesce(partition_value ->> 'seedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'seedCount')::integer else null end,
        case when coalesce(partition_value ->> 'seed_count', '') ~ '^[0-9]+$' then (partition_value ->> 'seed_count')::integer else null end,
        0
      )) as seed_count,
      greatest(0, coalesce(
        case when coalesce(partition_value ->> 'plantedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'plantedCount')::integer else null end,
        case when coalesce(partition_value ->> 'planted_count', '') ~ '^[0-9]+$' then (partition_value ->> 'planted_count')::integer else null end,
        0
      )) as germinated_count
    from eligible_sessions
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(coalesce(eligible_sessions.partitions, '[]'::jsonb)) = 'array'
          then coalesce(eligible_sessions.partitions, '[]'::jsonb)
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
        partition_rows.partition ->> 'source'
      )), '') as source_name,
      nullif(trim(coalesce(
        partition_rows.partition ->> 'seedVarietyDisplayName',
        partition_rows.partition ->> 'seed_variety_display_name',
        partition_rows.partition ->> 'seedVarietyCanonicalName',
        partition_rows.partition ->> 'seed_variety_canonical_name',
        partition_rows.partition ->> 'seedVariety',
        partition_rows.partition ->> 'seed_variety'
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
        partition_rows.partition ->> 'seed_type'
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

comment on function public.get_explorer_completed_session_aggregates() is
  'Returns anonymized completed-session aggregate intelligence for Seed Explorer and Source Explorer. Does not expose users, profiles, session titles, dates, notes, images, or private report links.';
