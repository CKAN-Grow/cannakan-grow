-- Grow Intelligence Engine canonical metrics and data quality contract.
-- Keeps the existing aggregate implementation as an internal core, then adds
-- canonical top-level analytics and quality fields for every consumer.

create table if not exists public.grow_intelligence_engine_config (
  singleton boolean primary key default true check (singleton),
  source_attribution_healthy_threshold numeric not null default 95 check (source_attribution_healthy_threshold between 0 and 100),
  source_attribution_warning_threshold numeric not null default 90 check (source_attribution_warning_threshold between 0 and 100),
  source_attribution_needs_attention_threshold numeric not null default 80 check (source_attribution_needs_attention_threshold between 0 and 100),
  updated_at timestamptz not null default timezone('utc', now()),
  check (source_attribution_healthy_threshold >= source_attribution_warning_threshold),
  check (source_attribution_warning_threshold >= source_attribution_needs_attention_threshold)
);

insert into public.grow_intelligence_engine_config (singleton)
values (true)
on conflict (singleton) do nothing;

revoke all on table public.grow_intelligence_engine_config from public;
grant select, insert, update on table public.grow_intelligence_engine_config to service_role;

do $$
begin
  if to_regprocedure('public.get_grow_intelligence_engine_analytics_core_v1()') is null
    and to_regprocedure('public.get_grow_intelligence_engine_analytics()') is not null then
    alter function public.get_grow_intelligence_engine_analytics()
      rename to get_grow_intelligence_engine_analytics_core_v1;
  end if;
end;
$$;

revoke all on function public.get_grow_intelligence_engine_analytics_core_v1() from public;
revoke all on function public.get_grow_intelligence_engine_analytics_core_v1() from anon;
revoke all on function public.get_grow_intelligence_engine_analytics_core_v1() from authenticated;

create or replace function public.get_grow_intelligence_engine_data_quality()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with eligible_sessions as (
    select grow_sessions.id, grow_sessions.partitions
    from public.grow_sessions
    where public.is_community_intelligence_session_eligible(grow_sessions.id)
  ),
  partition_rows as (
    select
      eligible_sessions.id as session_id,
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
        when jsonb_typeof(coalesce(eligible_sessions.partitions, '[]'::jsonb)) = 'array' then coalesce(eligible_sessions.partitions, '[]'::jsonb)
        when jsonb_typeof(coalesce(eligible_sessions.partitions, '{}'::jsonb)) = 'object' and jsonb_typeof(eligible_sessions.partitions -> 'partitions') = 'array' then eligible_sessions.partitions -> 'partitions'
        when jsonb_typeof(coalesce(eligible_sessions.partitions, '{}'::jsonb)) = 'object' and jsonb_typeof(eligible_sessions.partitions -> 'rows') = 'array' then eligible_sessions.partitions -> 'rows'
        else '[]'::jsonb
      end
    ) partition_value
  ),
  normalized_rows as (
    select
      partition_rows.session_id,
      partition_rows.seed_count,
      least(partition_rows.seed_count, partition_rows.germinated_count) as germinated_count,
      nullif(trim(coalesce(
        partition ->> 'sourceDisplayName', partition ->> 'source_display_name',
        partition ->> 'sourceCanonicalName', partition ->> 'source_canonical_name',
        partition ->> 'sourceName', partition ->> 'source_name', partition ->> 'source', partition ->> 'breeder'
      )), '') as source_name,
      nullif(trim(coalesce(partition ->> 'sourceCanonicalId', partition ->> 'source_canonical_id')), '') as source_canonical_id,
      nullif(trim(coalesce(
        partition ->> 'seedVarietyDisplayName', partition ->> 'seed_variety_display_name',
        partition ->> 'seedVarietyCanonicalName', partition ->> 'seed_variety_canonical_name',
        partition ->> 'seedVariety', partition ->> 'seed_variety', partition ->> 'varietyName',
        partition ->> 'variety_name', partition ->> 'variety', partition ->> 'strain',
        partition ->> 'seedName', partition ->> 'seed_name'
      )), '') as variety_name,
      nullif(trim(coalesce(partition ->> 'seedVarietyCanonicalId', partition ->> 'seed_variety_canonical_id')), '') as variety_canonical_id
    from partition_rows
  ),
  classified_rows as (
    select
      normalized_rows.*,
      coalesce(source_canonical_id, nullif(trim(regexp_replace(lower(coalesce(source_name, '')), '[^a-z0-9]+', ' ', 'g')), '')) as source_key,
      coalesce(variety_canonical_id, nullif(trim(regexp_replace(lower(coalesce(variety_name, '')), '[^a-z0-9]+', ' ', 'g')), '')) as variety_key
    from normalized_rows
  ),
  valid_rows as (
    select *
    from classified_rows
    where seed_count > 0
      and variety_name is not null
      and germinated_count between 0 and seed_count
  ),
  metrics as (
    select
      coalesce(sum(seed_count), 0)::integer as total_seeds_tested,
      coalesce(sum(germinated_count), 0)::integer as total_seeds_germinated,
      coalesce(sum(seed_count) filter (where source_key is not null), 0)::integer as total_seeds_with_source,
      coalesce(sum(seed_count) filter (where source_key is null), 0)::integer as total_seeds_without_source,
      (count(distinct variety_key) filter (where source_key is null))::integer as varieties_missing_source,
      (count(*) filter (where source_key is null))::integer as unknown_sources
    from valid_rows
  ),
  duplicate_metrics as (
    select count(*)::integer as duplicate_sources
    from (
      select source_key
      from valid_rows
      where source_key is not null
      group by source_key
      having count(distinct lower(source_name)) > 1
    ) duplicate_source_keys
  ),
  thresholds as (
    select
      source_attribution_healthy_threshold as healthy,
      source_attribution_warning_threshold as warning,
      source_attribution_needs_attention_threshold as needs_attention
    from public.grow_intelligence_engine_config
    where singleton
  ),
  resolved as (
    select
      metrics.*,
      duplicate_metrics.duplicate_sources,
      (select count(*) from classified_rows where seed_count > 0 and variety_name is null)::integer as unknown_varieties,
      case when metrics.total_seeds_tested > 0 then round((metrics.total_seeds_germinated::numeric / metrics.total_seeds_tested::numeric) * 100)::integer else 0 end as overall_germination_rate,
      case when metrics.total_seeds_tested > 0 then round((metrics.total_seeds_with_source::numeric / metrics.total_seeds_tested::numeric) * 100)::integer else 0 end as source_attribution_rate,
      thresholds.healthy,
      thresholds.warning,
      thresholds.needs_attention
    from metrics
    cross join duplicate_metrics
    cross join thresholds
  )
  select jsonb_build_object(
    'total_seeds_tested', total_seeds_tested,
    'total_seeds_germinated', total_seeds_germinated,
    'overall_germination_rate', overall_germination_rate,
    'total_seeds_with_source', total_seeds_with_source,
    'total_seeds_without_source', total_seeds_without_source,
    'source_attribution_rate', source_attribution_rate,
    'source_attribution_status', case when source_attribution_rate >= healthy then 'Healthy' when source_attribution_rate >= warning then 'Warning' else 'Needs Attention' end,
    'source_attribution_thresholds', jsonb_build_object('healthy', healthy, 'warning', warning, 'needs_attention', needs_attention),
    'varieties_missing_source', varieties_missing_source,
    'duplicate_sources', duplicate_sources,
    'unknown_sources', unknown_sources,
    'unknown_varieties', unknown_varieties
  )
  from resolved;
$$;

revoke all on function public.get_grow_intelligence_engine_data_quality() from public;

create or replace function public.get_grow_intelligence_engine_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  payload jsonb := public.get_grow_intelligence_engine_analytics_core_v1();
  quality jsonb := public.get_grow_intelligence_engine_data_quality();
  completed_sessions integer := coalesce((payload ->> 'total_completed_sessions')::integer, 0);
  seeds_tested integer := coalesce((quality ->> 'total_seeds_tested')::integer, 0);
  confidence text;
begin
  confidence := case
    when completed_sessions >= 500 and seeds_tested >= 10000 then 'Very High'
    when completed_sessions >= 200 and seeds_tested >= 4000 then 'High'
    when completed_sessions >= 75 and seeds_tested >= 1500 then 'Moderate'
    when completed_sessions > 0 or seeds_tested > 0 then 'Growing'
    else 'Limited'
  end;

  return payload || quality || jsonb_build_object(
    'engine_version', 'gie.v1',
    'schema_version', '2026-07-13.2',
    'generated_at', timezone('utc', now()),
    'community_confidence', confidence,
    'community_confidence_percent', case confidence when 'Very High' then 94 when 'High' then 78 when 'Moderate' then 58 when 'Growing' then 38 else 22 end
  );
end;
$$;

revoke all on function public.get_grow_intelligence_engine_analytics() from public;
grant execute on function public.get_grow_intelligence_engine_analytics() to anon;
grant execute on function public.get_grow_intelligence_engine_analytics() to authenticated;

comment on function public.get_grow_intelligence_engine_analytics() is
  'Canonical Grow Intelligence Engine analytics and data-quality payload. UI consumers must render these values without recomputing them.';

notify pgrst, 'reload schema';
