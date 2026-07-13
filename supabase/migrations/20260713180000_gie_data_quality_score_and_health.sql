-- GIE data-quality score v1 and Grow Intelligence Health diagnostics.
-- Additive only: eligibility, lifecycle resolution, normalization, sessions,
-- publication behavior, and anonymous public aggregate records are unchanged.

alter table public.grow_intelligence_engine_config
  add column if not exists data_quality_excellent_threshold numeric not null default 95 check (data_quality_excellent_threshold between 0 and 100),
  add column if not exists data_quality_good_threshold numeric not null default 90 check (data_quality_good_threshold between 0 and 100),
  add column if not exists data_quality_needs_attention_threshold numeric not null default 80 check (data_quality_needs_attention_threshold between 0 and 100),
  add column if not exists data_quality_version text not null default 'gie-dq.v1',
  add column if not exists data_quality_weights jsonb not null default jsonb_build_object(
    'source_attribution', 70,
    'varieties_missing_source', 5,
    'unknown_sources', 5,
    'unknown_varieties', 4,
    'duplicate_sources', 3,
    'duplicate_varieties', 3,
    'invalid_seed_counts', 3,
    'germinated_bounds', 2,
    'orphaned_aggregates', 2,
    'duplicate_result_rows', 1,
    'missing_required_fields', 2
  );

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gie_data_quality_threshold_order'
      and conrelid = 'public.grow_intelligence_engine_config'::regclass
  ) then
    alter table public.grow_intelligence_engine_config
      add constraint gie_data_quality_threshold_order check (
        data_quality_excellent_threshold >= data_quality_good_threshold
        and data_quality_good_threshold >= data_quality_needs_attention_threshold
      );
  end if;
end;
$$;

create or replace function public.get_grow_intelligence_engine_quality_observations()
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
      result_rows.result_ordinal,
      result_rows.partition_value as partition,
      greatest(0, coalesce(
        case when coalesce(result_rows.partition_value ->> 'seedCount', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'seedCount')::integer else null end,
        case when coalesce(result_rows.partition_value ->> 'seed_count', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'seed_count')::integer else null end,
        case when coalesce(result_rows.partition_value ->> 'totalSeeds', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'totalSeeds')::integer else null end,
        case when coalesce(result_rows.partition_value ->> 'total_seeds', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'total_seeds')::integer else null end,
        case when coalesce(result_rows.partition_value ->> 'seedsStarted', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'seedsStarted')::integer else null end,
        case when coalesce(result_rows.partition_value ->> 'seeds_started', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'seeds_started')::integer else null end,
        case when coalesce(result_rows.partition_value ->> 'seeds', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'seeds')::integer else null end,
        0
      )) as seed_count,
      greatest(0, coalesce(
        case when coalesce(result_rows.partition_value ->> 'plantedCount', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'plantedCount')::integer else null end,
        case when coalesce(result_rows.partition_value ->> 'planted_count', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'planted_count')::integer else null end,
        case when coalesce(result_rows.partition_value ->> 'germinatedCount', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'germinatedCount')::integer else null end,
        case when coalesce(result_rows.partition_value ->> 'germinated_count', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'germinated_count')::integer else null end,
        case when coalesce(result_rows.partition_value ->> 'totalGerminated', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'totalGerminated')::integer else null end,
        case when coalesce(result_rows.partition_value ->> 'total_germinated', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'total_germinated')::integer else null end,
        case when coalesce(result_rows.partition_value ->> 'germinatedSeeds', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'germinatedSeeds')::integer else null end,
        case when coalesce(result_rows.partition_value ->> 'germinated_seeds', '') ~ '^[0-9]+$' then (result_rows.partition_value ->> 'germinated_seeds')::integer else null end,
        0
      )) as raw_germinated_count,
      coalesce(
        result_rows.partition_value ->> 'plantedCount', result_rows.partition_value ->> 'planted_count',
        result_rows.partition_value ->> 'germinatedCount', result_rows.partition_value ->> 'germinated_count',
        result_rows.partition_value ->> 'totalGerminated', result_rows.partition_value ->> 'total_germinated',
        result_rows.partition_value ->> 'germinatedSeeds', result_rows.partition_value ->> 'germinated_seeds', ''
      ) <> '' as has_germinated_count
    from eligible_sessions
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(coalesce(eligible_sessions.partitions, '[]'::jsonb)) = 'array' then coalesce(eligible_sessions.partitions, '[]'::jsonb)
        when jsonb_typeof(coalesce(eligible_sessions.partitions, '{}'::jsonb)) = 'object' and jsonb_typeof(eligible_sessions.partitions -> 'partitions') = 'array' then eligible_sessions.partitions -> 'partitions'
        when jsonb_typeof(coalesce(eligible_sessions.partitions, '{}'::jsonb)) = 'object' and jsonb_typeof(eligible_sessions.partitions -> 'rows') = 'array' then eligible_sessions.partitions -> 'rows'
        else '[]'::jsonb
      end
    ) with ordinality as result_rows(partition_value, result_ordinal)
  ),
  classified_rows as (
    select
      partition_rows.*,
      nullif(trim(coalesce(
        partition ->> 'sourceDisplayName', partition ->> 'source_display_name',
        partition ->> 'sourceCanonicalName', partition ->> 'source_canonical_name',
        partition ->> 'sourceName', partition ->> 'source_name', partition ->> 'source', partition ->> 'breeder'
      )), '') as source_name,
      nullif(trim(coalesce(
        partition ->> 'seedVarietyDisplayName', partition ->> 'seed_variety_display_name',
        partition ->> 'seedVarietyCanonicalName', partition ->> 'seed_variety_canonical_name',
        partition ->> 'seedVariety', partition ->> 'seed_variety', partition ->> 'varietyName',
        partition ->> 'variety_name', partition ->> 'variety', partition ->> 'strain',
        partition ->> 'seedName', partition ->> 'seed_name'
      )), '') as variety_name,
      coalesce(
        nullif(trim(coalesce(partition ->> 'sourceCanonicalId', partition ->> 'source_canonical_id')), ''),
        nullif(trim(regexp_replace(lower(coalesce(
          partition ->> 'sourceDisplayName', partition ->> 'source_display_name',
          partition ->> 'sourceCanonicalName', partition ->> 'source_canonical_name',
          partition ->> 'sourceName', partition ->> 'source_name', partition ->> 'source', partition ->> 'breeder', ''
        )), '[^a-z0-9]+', ' ', 'g')), '')
      ) as source_key,
      coalesce(
        nullif(trim(coalesce(partition ->> 'seedVarietyCanonicalId', partition ->> 'seed_variety_canonical_id')), ''),
        nullif(trim(regexp_replace(lower(coalesce(
          partition ->> 'seedVarietyDisplayName', partition ->> 'seed_variety_display_name',
          partition ->> 'seedVarietyCanonicalName', partition ->> 'seed_variety_canonical_name',
          partition ->> 'seedVariety', partition ->> 'seed_variety', partition ->> 'varietyName',
          partition ->> 'variety_name', partition ->> 'variety', partition ->> 'strain',
          partition ->> 'seedName', partition ->> 'seed_name', ''
        )), '[^a-z0-9]+', ' ', 'g')), '')
      ) as variety_key
    from partition_rows
  ),
  duplicate_result_groups as (
    select count(*) - 1 as duplicate_count
    from classified_rows
    where seed_count > 0 and variety_key is not null
    group by session_id, source_key, variety_key, seed_count, raw_germinated_count
    having count(*) > 1
  ),
  duplicate_variety_groups as (
    select variety_key
    from classified_rows
    where variety_key is not null and variety_name is not null
    group by variety_key
    having count(distinct lower(variety_name)) > 1
  )
  select jsonb_build_object(
    'quality_result_rows', count(*),
    'invalid_seed_count_rows', (count(*) filter (where seed_count <= 0))::integer,
    'germinated_exceeds_tested_rows', (count(*) filter (where raw_germinated_count > seed_count and seed_count > 0))::integer,
    'missing_required_result_fields', (count(*) filter (where seed_count <= 0 or variety_name is null or not has_germinated_count))::integer,
    'invalid_result_rows', (count(*) filter (where seed_count <= 0 or variety_name is null or not has_germinated_count or raw_germinated_count > seed_count))::integer,
    'duplicate_result_rows', coalesce((select sum(duplicate_count) from duplicate_result_groups), 0)::integer,
    'duplicate_varieties', (select count(*) from duplicate_variety_groups)::integer
  )
  from classified_rows;
$$;

revoke all on function public.get_grow_intelligence_engine_quality_observations() from public;
revoke all on function public.get_grow_intelligence_engine_quality_observations() from anon;
revoke all on function public.get_grow_intelligence_engine_quality_observations() from authenticated;

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
  observations jsonb := public.get_grow_intelligence_engine_quality_observations();
  config public.grow_intelligence_engine_config%rowtype;
  weights jsonb;
  completed_sessions integer := coalesce((payload ->> 'total_completed_sessions')::integer, 0);
  total_varieties integer := coalesce((payload ->> 'total_varieties_logged')::integer, 0);
  total_sources integer := coalesce((payload ->> 'total_breeders_logged')::integer, 0);
  seeds_tested integer := coalesce((quality ->> 'total_seeds_tested')::integer, 0);
  source_rate numeric := coalesce((quality ->> 'source_attribution_rate')::numeric, 0);
  quality_rows integer := coalesce((observations ->> 'quality_result_rows')::integer, 0);
  orphaned_aggregate_records integer;
  confidence text;
  score numeric;
  status text;
  breakdown jsonb;
  source_deduction numeric;
  unknown_variety_deduction numeric;
  duplicate_source_deduction numeric;
  duplicate_variety_deduction numeric;
  invalid_seed_deduction numeric;
  germinated_bounds_deduction numeric;
  orphaned_deduction numeric;
  duplicate_result_deduction numeric;
  missing_fields_deduction numeric;
begin
  select * into config
  from public.grow_intelligence_engine_config
  where singleton;

  weights := coalesce(config.data_quality_weights, '{}'::jsonb);

  select
    coalesce((select count(*) from jsonb_array_elements(coalesce(payload -> 'seed_records', '[]'::jsonb)) row_value where coalesce(row_value ->> 'id', '') = '' or coalesce(row_value ->> 'varietyName', '') = ''), 0)
    + coalesce((select count(*) from jsonb_array_elements(coalesce(payload -> 'source_records', '[]'::jsonb)) row_value where coalesce(row_value ->> 'key', '') = '' or coalesce(row_value ->> 'name', '') = ''), 0)
  into orphaned_aggregate_records;

  source_deduction := least(coalesce((weights ->> 'source_attribution')::numeric, 70), greatest(0, 100 - source_rate));
  unknown_variety_deduction := least(
    coalesce((weights ->> 'unknown_varieties')::numeric, 4),
    coalesce((weights ->> 'unknown_varieties')::numeric, 4) * coalesce((quality ->> 'unknown_varieties')::numeric, 0) / greatest(1, quality_rows)
  );
  duplicate_source_deduction := least(
    coalesce((weights ->> 'duplicate_sources')::numeric, 3),
    coalesce((weights ->> 'duplicate_sources')::numeric, 3) * coalesce((quality ->> 'duplicate_sources')::numeric, 0) / greatest(1, total_sources)
  );
  duplicate_variety_deduction := least(
    coalesce((weights ->> 'duplicate_varieties')::numeric, 3),
    coalesce((weights ->> 'duplicate_varieties')::numeric, 3) * coalesce((observations ->> 'duplicate_varieties')::numeric, 0) / greatest(1, total_varieties)
  );
  invalid_seed_deduction := least(
    coalesce((weights ->> 'invalid_seed_counts')::numeric, 3),
    coalesce((weights ->> 'invalid_seed_counts')::numeric, 3) * coalesce((observations ->> 'invalid_seed_count_rows')::numeric, 0) / greatest(1, quality_rows)
  );
  germinated_bounds_deduction := least(
    coalesce((weights ->> 'germinated_bounds')::numeric, 2),
    coalesce((weights ->> 'germinated_bounds')::numeric, 2) * coalesce((observations ->> 'germinated_exceeds_tested_rows')::numeric, 0) / greatest(1, quality_rows)
  );
  orphaned_deduction := least(coalesce((weights ->> 'orphaned_aggregates')::numeric, 2), orphaned_aggregate_records);
  duplicate_result_deduction := least(
    coalesce((weights ->> 'duplicate_result_rows')::numeric, 1),
    coalesce((weights ->> 'duplicate_result_rows')::numeric, 1) * coalesce((observations ->> 'duplicate_result_rows')::numeric, 0) / greatest(1, quality_rows)
  );
  missing_fields_deduction := least(
    coalesce((weights ->> 'missing_required_fields')::numeric, 2),
    coalesce((weights ->> 'missing_required_fields')::numeric, 2) * coalesce((observations ->> 'missing_required_result_fields')::numeric, 0) / greatest(1, quality_rows)
  );

  score := greatest(0, least(100, round(100 - (
    source_deduction + unknown_variety_deduction + duplicate_source_deduction
    + duplicate_variety_deduction + invalid_seed_deduction + germinated_bounds_deduction
    + orphaned_deduction + duplicate_result_deduction + missing_fields_deduction
  ))));
  status := case
    when score >= config.data_quality_excellent_threshold then 'Excellent'
    when score >= config.data_quality_good_threshold then 'Good'
    when score >= config.data_quality_needs_attention_threshold then 'Needs Attention'
    else 'Poor'
  end;

  breakdown := jsonb_build_array(
    jsonb_build_object('category', 'Source attribution completeness', 'weight', coalesce((weights ->> 'source_attribution')::numeric, 70), 'measured_value', source_rate, 'deduction', round(source_deduction, 2), 'status', case when source_rate >= config.data_quality_excellent_threshold then 'Excellent' when source_rate >= config.data_quality_good_threshold then 'Good' when source_rate >= config.data_quality_needs_attention_threshold then 'Needs Attention' else 'Poor' end, 'reason', 'Measures the percentage of tested seeds with a canonical source attribution.'),
    jsonb_build_object('category', 'Varieties missing source', 'weight', coalesce((weights ->> 'varieties_missing_source')::numeric, 5), 'measured_value', coalesce((quality ->> 'varieties_missing_source')::integer, 0), 'deduction', 0, 'status', case when coalesce((quality ->> 'varieties_missing_source')::integer, 0) = 0 then 'Excellent' else 'Needs Attention' end, 'reason', 'Reported for audit; its missing-seed impact is charged once through source attribution.'),
    jsonb_build_object('category', 'Unknown sources', 'weight', coalesce((weights ->> 'unknown_sources')::numeric, 5), 'measured_value', coalesce((quality ->> 'unknown_sources')::integer, 0), 'deduction', 0, 'status', case when coalesce((quality ->> 'unknown_sources')::integer, 0) = 0 then 'Excellent' else 'Needs Attention' end, 'reason', 'Reported for audit without double-charging rows already reflected by source attribution.'),
    jsonb_build_object('category', 'Unknown varieties', 'weight', coalesce((weights ->> 'unknown_varieties')::numeric, 4), 'measured_value', coalesce((quality ->> 'unknown_varieties')::integer, 0), 'deduction', round(unknown_variety_deduction, 2), 'status', case when coalesce((quality ->> 'unknown_varieties')::integer, 0) = 0 then 'Excellent' else 'Needs Attention' end, 'reason', 'Penalizes eligible result rows that cannot be assigned a variety.'),
    jsonb_build_object('category', 'Duplicate sources', 'weight', coalesce((weights ->> 'duplicate_sources')::numeric, 3), 'measured_value', coalesce((quality ->> 'duplicate_sources')::integer, 0), 'deduction', round(duplicate_source_deduction, 2), 'status', case when coalesce((quality ->> 'duplicate_sources')::integer, 0) = 0 then 'Excellent' else 'Needs Attention' end, 'reason', 'Detects multiple display labels collapsing to one normalized source key.'),
    jsonb_build_object('category', 'Duplicate varieties', 'weight', coalesce((weights ->> 'duplicate_varieties')::numeric, 3), 'measured_value', coalesce((observations ->> 'duplicate_varieties')::integer, 0), 'deduction', round(duplicate_variety_deduction, 2), 'status', case when coalesce((observations ->> 'duplicate_varieties')::integer, 0) = 0 then 'Excellent' else 'Needs Attention' end, 'reason', 'Detects multiple display labels collapsing to one normalized variety key.'),
    jsonb_build_object('category', 'Invalid or missing seed counts', 'weight', coalesce((weights ->> 'invalid_seed_counts')::numeric, 3), 'measured_value', coalesce((observations ->> 'invalid_seed_count_rows')::integer, 0), 'deduction', round(invalid_seed_deduction, 2), 'status', case when coalesce((observations ->> 'invalid_seed_count_rows')::integer, 0) = 0 then 'Excellent' else 'Needs Attention' end, 'reason', 'Counts eligible-session result rows without a positive tested-seed count.'),
    jsonb_build_object('category', 'Germinated count bounds', 'weight', coalesce((weights ->> 'germinated_bounds')::numeric, 2), 'measured_value', coalesce((observations ->> 'germinated_exceeds_tested_rows')::integer, 0), 'deduction', round(germinated_bounds_deduction, 2), 'status', case when coalesce((observations ->> 'germinated_exceeds_tested_rows')::integer, 0) = 0 then 'Excellent' else 'Needs Attention' end, 'reason', 'Counts rows where germinated seeds exceed tested seeds.'),
    jsonb_build_object('category', 'Orphaned aggregate records', 'weight', coalesce((weights ->> 'orphaned_aggregates')::numeric, 2), 'measured_value', orphaned_aggregate_records, 'deduction', round(orphaned_deduction, 2), 'status', case when orphaned_aggregate_records = 0 then 'Excellent' else 'Needs Attention' end, 'reason', 'Checks canonical seed and source aggregates for missing identifiers or labels.'),
    jsonb_build_object('category', 'Duplicate result rows', 'weight', coalesce((weights ->> 'duplicate_result_rows')::numeric, 1), 'measured_value', coalesce((observations ->> 'duplicate_result_rows')::integer, 0), 'deduction', round(duplicate_result_deduction, 2), 'status', case when coalesce((observations ->> 'duplicate_result_rows')::integer, 0) = 0 then 'Excellent' else 'Needs Attention' end, 'reason', 'Detects repeated result signatures within the same eligible session.'),
    jsonb_build_object('category', 'Missing required result fields', 'weight', coalesce((weights ->> 'missing_required_fields')::numeric, 2), 'measured_value', coalesce((observations ->> 'missing_required_result_fields')::integer, 0), 'deduction', round(missing_fields_deduction, 2), 'status', case when coalesce((observations ->> 'missing_required_result_fields')::integer, 0) = 0 then 'Excellent' else 'Needs Attention' end, 'reason', 'Counts result rows missing tested seeds, variety, or a final germinated count.' )
  );

  confidence := case
    when completed_sessions >= 500 and seeds_tested >= 10000 then 'Very High'
    when completed_sessions >= 200 and seeds_tested >= 4000 then 'High'
    when completed_sessions >= 75 and seeds_tested >= 1500 then 'Moderate'
    when completed_sessions > 0 or seeds_tested > 0 then 'Growing'
    else 'Limited'
  end;

  return payload || quality || observations || jsonb_build_object(
    'engine_version', 'gie.v1',
    'schema_version', '2026-07-13.3',
    'data_quality_version', coalesce(config.data_quality_version, 'gie-dq.v1'),
    'generated_at', timezone('utc', now()),
    'data_quality_score', score::integer,
    'data_quality_status', status,
    'data_quality_breakdown', breakdown,
    'data_quality_thresholds', jsonb_build_object(
      'excellent', config.data_quality_excellent_threshold,
      'good', config.data_quality_good_threshold,
      'needs_attention', config.data_quality_needs_attention_threshold
    ),
    'orphaned_aggregate_records', orphaned_aggregate_records,
    'community_confidence', confidence,
    'community_confidence_percent', case confidence when 'Very High' then 94 when 'High' then 78 when 'Moderate' then 58 when 'Growing' then 38 else 22 end
  );
end;
$$;

revoke all on function public.get_grow_intelligence_engine_analytics() from public;
grant execute on function public.get_grow_intelligence_engine_analytics() to anon;
grant execute on function public.get_grow_intelligence_engine_analytics() to authenticated;

create or replace function public.get_grow_intelligence_engine_diagnostics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  diagnostics jsonb;
  analytics jsonb;
begin
  if not exists (
      select 1 from public.admin_users where admin_users.user_id = auth.uid()
    )
    and coalesce(auth.role(), '') <> 'service_role'
    and session_user not in ('postgres', 'service_role') then
    raise exception 'Admin or service-role access is required'
      using errcode = '42501';
  end if;

  diagnostics := public.get_explorer_completed_session_aggregate_diagnostics();
  analytics := public.get_grow_intelligence_engine_analytics();

  return diagnostics || jsonb_build_object(
    'system_health_status', diagnostics ->> 'health_status',
    'data_quality_score', analytics -> 'data_quality_score',
    'data_quality_status', analytics -> 'data_quality_status',
    'data_quality_breakdown', analytics -> 'data_quality_breakdown',
    'data_quality_version', analytics -> 'data_quality_version',
    'invalid_result_rows', analytics -> 'invalid_result_rows',
    'engine_version', analytics -> 'engine_version',
    'schema_version', analytics -> 'schema_version',
    'generated_at', analytics -> 'generated_at'
  );
end;
$$;

revoke all on function public.get_grow_intelligence_engine_diagnostics() from public;
revoke all on function public.get_grow_intelligence_engine_diagnostics() from anon;
grant execute on function public.get_grow_intelligence_engine_diagnostics() to authenticated;
grant execute on function public.get_grow_intelligence_engine_diagnostics() to service_role;

comment on function public.get_grow_intelligence_engine_analytics() is
  'Canonical GIE schema 2026-07-13.3 payload with explainable data-quality score gie-dq.v1. Consumers render values without recomputation.';

comment on function public.get_grow_intelligence_engine_diagnostics() is
  'Admin/service-role Grow Intelligence Health diagnostics. System health and data quality remain separate canonical fields.';

notify pgrst, 'reload schema';
