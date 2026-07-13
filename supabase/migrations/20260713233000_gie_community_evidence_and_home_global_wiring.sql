-- Post-Phase 2C contract wiring correction.
-- The GIE architecture, contract versions, lifecycle rules, session eligibility,
-- normalization rules, privacy boundaries, and production data remain unchanged.

-- One canonical approved-public evidence resolver is shared by the Community
-- Analytics Contract and the public Community gallery. Hidden, rejected,
-- unpublished, analytics-excluded, mock, invalid, and superseded snapshots are
-- excluded here. Snapshot deletion is physical, so deleted rows are absent.
create or replace function public.get_gie_community_evidence_v1()
returns setof public.grow_gallery_snapshots
language sql
stable
security definer
set search_path = public
as $$
  with ranked as (
    select
      snapshot_row as evidence,
      snapshot_row.session_id,
      row_number() over (
        partition by snapshot_row.session_id
        order by coalesce(snapshot_row.published_at, snapshot_row.updated_at, snapshot_row.created_at) desc,
          snapshot_row.created_at desc,
          snapshot_row.id desc
      ) as session_rank
    from public.grow_gallery_snapshots snapshot_row
    where lower(coalesce(snapshot_row.status, '')) = 'approved'
      and coalesce(snapshot_row.is_published, false) = true
      and coalesce(snapshot_row.analytics_excluded, false) = false
      and coalesce(snapshot_row.is_mock, false) = false
      and greatest(0, coalesce(snapshot_row.total_seeds, 0)) > 0
      and greatest(0, coalesce(snapshot_row.total_planted, 0))
        <= greatest(0, coalesce(snapshot_row.total_seeds, 0))
      and coalesce(snapshot_row.success_percent, 0) between 0 and 100
  )
  select ranked.evidence
  from ranked
  where ranked.session_id is null or ranked.session_rank = 1
  order by coalesce((ranked.evidence).published_at, (ranked.evidence).created_at) desc;
$$;

revoke all on function public.get_gie_community_evidence_v1() from public, anon, authenticated;

-- Public presentation projection of the canonical evidence resolver. This is
-- evidence, not a fourth analytics contract; analytics remain available only
-- through get_gie_community_analytics().
create or replace function public.get_gie_community_gallery_evidence()
returns setof public.grow_gallery_snapshots
language sql
stable
security definer
set search_path = public
as $$
  select evidence.*
  from public.get_gie_community_evidence_v1() evidence
  order by coalesce(evidence.published_at, evidence.created_at) desc;
$$;

revoke all on function public.get_gie_community_gallery_evidence() from public;
grant execute on function public.get_gie_community_gallery_evidence() to anon, authenticated;

-- Canonical result-row field parsers. Alias precedence is the array order
-- supplied by each public helper. The first valid value wins, so a row with
-- multiple aliases is never double-counted. Counts accept JSON numbers or
-- trimmed numeric strings only when they represent a non-negative whole number
-- within PostgreSQL integer range. Invalid, negative, fractional, blank, and
-- overflowing values return null; the scoped row resolver applies the existing
-- zero/exclusion convention after parsing.
create or replace function public.get_gie_canonical_nonnegative_integer_v1(
  p_row jsonb,
  p_aliases text[]
)
returns integer
language plpgsql
immutable
set search_path = public
as $$
declare
  alias_name text;
  raw_value text;
  parsed_value numeric;
begin
  if p_row is null or jsonb_typeof(p_row) <> 'object' then return null; end if;
  foreach alias_name in array coalesce(p_aliases, '{}'::text[]) loop
    raw_value := btrim(coalesce(p_row ->> alias_name, ''));
    if raw_value ~ '^\+?[0-9]+([.]0+)?$' then
      begin
        parsed_value := raw_value::numeric;
      exception when numeric_value_out_of_range then
        continue;
      end;
      if parsed_value between 0 and 2147483647 then return parsed_value::integer; end if;
    end if;
  end loop;
  return null;
end;
$$;

create or replace function public.get_gie_canonical_text_v1(
  p_row jsonb,
  p_aliases text[]
)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  alias_name text;
  raw_value text;
begin
  if p_row is null or jsonb_typeof(p_row) <> 'object' then return null; end if;
  foreach alias_name in array coalesce(p_aliases, '{}'::text[]) loop
    raw_value := btrim(coalesce(p_row ->> alias_name, ''));
    if raw_value <> '' then return raw_value; end if;
  end loop;
  return null;
end;
$$;

create or replace function public.get_gie_canonical_seed_count(p_row jsonb)
returns integer language sql immutable set search_path = public
as $$
  select public.get_gie_canonical_nonnegative_integer_v1(p_row, array[
    'seedCount', 'seed_count', 'totalSeeds', 'total_seeds', 'totalCount',
    'total_count', 'seedsStarted', 'seeds_started', 'seeds'
  ]);
$$;

create or replace function public.get_gie_canonical_germinated_count(p_row jsonb)
returns integer language sql immutable set search_path = public
as $$
  select public.get_gie_canonical_nonnegative_integer_v1(p_row, array[
    'plantedCount', 'planted_count', 'germinatedCount', 'germinated_count',
    'totalGerminated', 'total_germinated', 'germinatedSeeds', 'germinated_seeds'
  ]);
$$;

create or replace function public.get_gie_canonical_variety_name(p_row jsonb)
returns text language sql immutable set search_path = public
as $$
  select public.get_gie_canonical_text_v1(p_row, array[
    'seedVarietyDisplayName', 'seed_variety_display_name',
    'seedVarietyCanonicalName', 'seed_variety_canonical_name',
    'seedVariety', 'seed_variety', 'varietyName', 'variety_name',
    'variety', 'strain', 'seedName', 'seed_name'
  ]);
$$;

create or replace function public.get_gie_canonical_source_name(p_row jsonb)
returns text language sql immutable set search_path = public
as $$
  select public.get_gie_canonical_text_v1(p_row, array[
    'sourceDisplayName', 'source_display_name',
    'sourceCanonicalName', 'source_canonical_name',
    'sourceName', 'source_name', 'source', 'breeder'
  ]);
$$;

create or replace function public.get_gie_canonical_result_row_v1(p_row jsonb)
returns table (
  seed_count integer,
  germinated_count integer,
  variety_name text,
  variety_canonical_id text,
  source_name text,
  source_canonical_id text,
  seed_type text,
  seed_sex text,
  seed_age_years numeric
)
language sql
immutable
set search_path = public
as $$
  select
    public.get_gie_canonical_seed_count(p_row),
    public.get_gie_canonical_germinated_count(p_row),
    public.get_gie_canonical_variety_name(p_row),
    public.get_gie_canonical_text_v1(p_row, array['seedVarietyCanonicalId', 'seed_variety_canonical_id']),
    public.get_gie_canonical_source_name(p_row),
    public.get_gie_canonical_text_v1(p_row, array['sourceCanonicalId', 'source_canonical_id']),
    public.get_gie_canonical_text_v1(p_row, array['seedType', 'seed_type', 'type']),
    public.get_gie_canonical_text_v1(p_row, array['sex', 'feminized', 'seedSex', 'seed_sex']),
    case
      when btrim(coalesce(p_row ->> 'seedAgeYears', p_row ->> 'seed_age_years', '')) ~ '^[0-9]+([.][0-9]+)?$'
        then btrim(coalesce(p_row ->> 'seedAgeYears', p_row ->> 'seed_age_years'))::numeric
      else null
    end;
$$;

revoke all on function public.get_gie_canonical_nonnegative_integer_v1(jsonb, text[]) from public, anon, authenticated;
revoke all on function public.get_gie_canonical_text_v1(jsonb, text[]) from public, anon, authenticated;
revoke all on function public.get_gie_canonical_seed_count(jsonb) from public, anon, authenticated;
revoke all on function public.get_gie_canonical_germinated_count(jsonb) from public, anon, authenticated;
revoke all on function public.get_gie_canonical_variety_name(jsonb) from public, anon, authenticated;
revoke all on function public.get_gie_canonical_source_name(jsonb) from public, anon, authenticated;
revoke all on function public.get_gie_canonical_result_row_v1(jsonb) from public, anon, authenticated;

-- Migration-time parser contract checks. These abort the migration if alias
-- support, invalid-value handling, or deterministic precedence ever drifts.
do $$
begin
  if public.get_gie_canonical_seed_count('{"totalCount":12}'::jsonb) is distinct from 12 then raise exception 'GIE parser: totalCount'; end if;
  if public.get_gie_canonical_seed_count('{"seedCount":11}'::jsonb) is distinct from 11 then raise exception 'GIE parser: seedCount'; end if;
  if public.get_gie_canonical_seed_count('{"totalSeeds":10}'::jsonb) is distinct from 10 then raise exception 'GIE parser: totalSeeds'; end if;
  if public.get_gie_canonical_seed_count('{"seed_count":" 9 "}'::jsonb) is distinct from 9 then raise exception 'GIE parser: numeric string'; end if;
  if public.get_gie_canonical_seed_count('{"seedCount":8,"totalCount":99}'::jsonb) is distinct from 8 then raise exception 'GIE parser: precedence'; end if;
  if public.get_gie_canonical_seed_count('{"seedCount":"invalid","totalCount":7}'::jsonb) is distinct from 7 then raise exception 'GIE parser: first valid alias'; end if;
  if public.get_gie_canonical_seed_count('{"seedCount":"invalid"}'::jsonb) is not null then raise exception 'GIE parser: invalid string'; end if;
  if public.get_gie_canonical_seed_count('{"seedCount":-1}'::jsonb) is not null then raise exception 'GIE parser: negative count'; end if;
  if public.get_gie_canonical_seed_count('{"seedCount":1.5}'::jsonb) is not null then raise exception 'GIE parser: fractional count'; end if;
  if public.get_gie_canonical_seed_count('{"seedCount":2147483648}'::jsonb) is not null then raise exception 'GIE parser: integer overflow'; end if;
  if public.get_gie_canonical_germinated_count('{"plantedCount":7,"germinatedCount":6}'::jsonb) is distinct from 7 then raise exception 'GIE parser: germination precedence'; end if;
  if public.get_gie_canonical_germinated_count('{"germinatedSeeds":" 5 "}'::jsonb) is distinct from 5 then raise exception 'GIE parser: germinatedSeeds'; end if;
  if public.get_gie_canonical_variety_name('{"seedVariety":"  Blue Dream  "}'::jsonb) is distinct from 'Blue Dream' then raise exception 'GIE parser: variety'; end if;
  if public.get_gie_canonical_source_name('{"sourceName":"  Example Source  "}'::jsonb) is distinct from 'Example Source' then raise exception 'GIE parser: source'; end if;
end;
$$;

-- Preserve the shared scoped pipeline while routing Global, Owner, and
-- Community result rows through the canonical parser. Lifecycle and scope
-- eligibility remain unchanged.
create or replace function public.get_gie_scoped_result_rows_v1(
  p_scope text,
  p_owner_id uuid default null
)
returns table (
  evidence_id text,
  method_type text,
  variety_name text,
  variety_key text,
  source_name text,
  source_key text,
  seed_count integer,
  germinated_count integer,
  seed_age_years numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with session_evidence as (
    select
      grow_sessions.id::text as evidence_id,
      coalesce(nullif(grow_sessions.system_type, ''), 'Grow Session') as method_type,
      grow_sessions.partitions
    from public.grow_sessions
    where p_scope in ('global', 'owner')
      and public.is_community_intelligence_session_eligible(grow_sessions.id)
      and (p_scope = 'global' or grow_sessions.user_id = p_owner_id)
  ),
  community_evidence as (
    select
      evidence.id::text as evidence_id,
      coalesce(nullif(evidence.system_type, ''), 'Grow Session') as method_type,
      case
        when jsonb_typeof(coalesce(evidence.partition_results, '[]'::jsonb)) = 'array'
          and jsonb_array_length(coalesce(evidence.partition_results, '[]'::jsonb)) > 0
          then evidence.partition_results
        else jsonb_build_array(jsonb_build_object(
          'seedCount', greatest(0, coalesce(evidence.total_seeds, 0)),
          'germinatedCount', least(
            greatest(0, coalesce(evidence.total_seeds, 0)),
            greatest(0, round(
              greatest(0, coalesce(evidence.total_seeds, 0))::numeric
              * greatest(0, least(100, coalesce(evidence.success_percent, 0))) / 100
            )::integer)
          ),
          'seedVariety', coalesce(evidence.seed_variety_name, ''),
          'sourceCanonicalId', coalesce(evidence.source_id::text, ''),
          'sourceName', coalesce(evidence.source_name, ''),
          'seedAgeYears', evidence.session_seed_age_years
        ))
      end as partitions
    from public.get_gie_community_evidence_v1() evidence
    where p_scope = 'community'
  ),
  evidence as (
    select * from session_evidence
    union all
    select * from community_evidence
  ),
  partition_rows as (
    select evidence.evidence_id, evidence.method_type, partition_value
    from evidence
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(coalesce(evidence.partitions, '[]'::jsonb)) = 'array'
          then coalesce(evidence.partitions, '[]'::jsonb)
        when jsonb_typeof(coalesce(evidence.partitions, '{}'::jsonb)) = 'object'
          and jsonb_typeof(evidence.partitions -> 'partitions') = 'array'
          then evidence.partitions -> 'partitions'
        when jsonb_typeof(coalesce(evidence.partitions, '{}'::jsonb)) = 'object'
          and jsonb_typeof(evidence.partitions -> 'rows') = 'array'
          then evidence.partitions -> 'rows'
        else '[]'::jsonb
      end
    ) as partition_value
  ),
  normalized as (
    select
      partition_rows.evidence_id,
      partition_rows.method_type,
      parsed.variety_name,
      parsed.variety_canonical_id,
      parsed.source_name,
      parsed.source_canonical_id,
      coalesce(parsed.seed_count, 0) as seed_count,
      coalesce(parsed.germinated_count, 0) as raw_germinated_count,
      parsed.seed_age_years
    from partition_rows
    cross join lateral public.get_gie_canonical_result_row_v1(partition_rows.partition_value) parsed
  )
  select
    normalized.evidence_id,
    normalized.method_type,
    normalized.variety_name,
    coalesce(normalized.variety_canonical_id,
      nullif(trim(regexp_replace(lower(coalesce(normalized.variety_name, '')), '[^a-z0-9]+', ' ', 'g')), '')) as variety_key,
    normalized.source_name,
    coalesce(normalized.source_canonical_id,
      nullif(trim(regexp_replace(lower(coalesce(normalized.source_name, '')), '[^a-z0-9]+', ' ', 'g')), '')) as source_key,
    normalized.seed_count,
    least(normalized.seed_count, normalized.raw_germinated_count) as germinated_count,
    normalized.seed_age_years
  from normalized
  where normalized.seed_count > 0
    and normalized.raw_germinated_count between 0 and normalized.seed_count;
$$;

revoke all on function public.get_gie_scoped_result_rows_v1(text, uuid) from public, anon, authenticated;

create or replace function public.get_gie_canonical_global_result_rows_v1()
returns table (
  evidence_id text, method_type text, variety_name text, variety_key text,
  source_name text, source_key text, seed_count integer,
  germinated_count integer, seed_age_years numeric, seed_type text, seed_sex text
)
language sql
stable
security definer
set search_path = public
as $$
  with evidence as (
    select grow_sessions.id::text as evidence_id,
      coalesce(nullif(grow_sessions.system_type, ''), 'Grow Session') as method_type,
      grow_sessions.partitions
    from public.grow_sessions
    where public.is_community_intelligence_session_eligible(grow_sessions.id)
  ),
  partition_rows as (
    select evidence.evidence_id, evidence.method_type, partition_value
    from evidence
    cross join lateral jsonb_array_elements(case
      when jsonb_typeof(coalesce(evidence.partitions, '[]'::jsonb)) = 'array' then coalesce(evidence.partitions, '[]'::jsonb)
      when jsonb_typeof(coalesce(evidence.partitions, '{}'::jsonb)) = 'object' and jsonb_typeof(evidence.partitions -> 'partitions') = 'array' then evidence.partitions -> 'partitions'
      when jsonb_typeof(coalesce(evidence.partitions, '{}'::jsonb)) = 'object' and jsonb_typeof(evidence.partitions -> 'rows') = 'array' then evidence.partitions -> 'rows'
      else '[]'::jsonb end) partition_value
  ),
  parsed_rows as (
    select partition_rows.evidence_id, partition_rows.method_type, parsed.*
    from partition_rows
    cross join lateral public.get_gie_canonical_result_row_v1(partition_rows.partition_value) parsed
  )
  select parsed_rows.evidence_id, parsed_rows.method_type, parsed_rows.variety_name,
    coalesce(parsed_rows.variety_canonical_id, nullif(trim(regexp_replace(lower(coalesce(parsed_rows.variety_name, '')), '[^a-z0-9]+', ' ', 'g')), '')) as variety_key,
    parsed_rows.source_name,
    coalesce(parsed_rows.source_canonical_id, nullif(trim(regexp_replace(lower(coalesce(parsed_rows.source_name, '')), '[^a-z0-9]+', ' ', 'g')), '')) as source_key,
    parsed_rows.seed_count,
    least(parsed_rows.seed_count, coalesce(parsed_rows.germinated_count, 0)) as germinated_count,
    parsed_rows.seed_age_years, parsed_rows.seed_type, parsed_rows.seed_sex
  from parsed_rows
  where coalesce(parsed_rows.seed_count, 0) > 0
    and coalesce(parsed_rows.germinated_count, 0) between 0 and parsed_rows.seed_count;
$$;

revoke all on function public.get_gie_canonical_global_result_rows_v1() from public, anon, authenticated;

-- Preserve the mature Global payload shape while sourcing every result row
-- from the same scoped parser used by Owner and Community contracts.
create or replace function public.get_gie_canonical_global_analytics_v1()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with quality_thresholds as (
    select source_attribution_healthy_threshold as healthy,
      source_attribution_warning_threshold as warning,
      source_attribution_needs_attention_threshold as needs_attention
    from public.grow_intelligence_engine_config where singleton
  ),
  rows as (
    select * from public.get_gie_canonical_global_result_rows_v1()
  ),
  valid_rows as (
    select * from rows where variety_key is not null
  ),
  variety_sources as (
    select variety_key, source_key, max(source_name) as source_name, sum(seed_count) as source_seed_count
    from valid_rows where source_key is not null group by variety_key, source_key
  ),
  variety_primary_sources as (
    select distinct on (variety_key) variety_key, source_key, source_name
    from variety_sources order by variety_key, source_seed_count desc, source_name
  ),
  variety_aggregate as (
    select
      rows.variety_key,
      max(rows.variety_name) as variety_name,
      coalesce(case when count(distinct rows.source_key) > 1 then 'Multiple Sources'
        else max(variety_primary_sources.source_name) end, 'Community Sources') as source_name,
      case when count(distinct rows.source_key) = 1 then max(variety_primary_sources.source_key) else '' end as source_key,
      count(distinct rows.evidence_id)::integer as community_sessions,
      sum(rows.seed_count)::integer as total_seeds,
      sum(rows.germinated_count)::integer as total_germinated,
      coalesce(nullif(mode() within group (order by rows.seed_type), ''), 'Seed') as seed_type,
      coalesce(nullif(mode() within group (order by rows.seed_sex), ''), '') as seed_sex,
      min(rows.seed_age_years) as min_seed_age,
      max(rows.seed_age_years) as max_seed_age,
      array_remove(array_agg(distinct rows.method_type), null) as methods
    from valid_rows rows
    left join variety_primary_sources on variety_primary_sources.variety_key = rows.variety_key
    group by rows.variety_key
  ),
  source_aggregate as (
    select source_key, max(source_name) as source_name,
      count(distinct evidence_id)::integer as sessions_logged,
      sum(seed_count)::integer as total_seeds,
      sum(germinated_count)::integer as total_germinated,
      jsonb_agg(distinct variety_name) filter (where variety_name is not null) as varieties
    from valid_rows where source_key is not null group by source_key
  ),
  source_seed_type_aggregate as (
    select source_key, coalesce(nullif(seed_type, ''), 'unknown') as seed_type,
      sum(seed_count)::integer as total_seeds, sum(germinated_count)::integer as total_germinated
    from valid_rows where source_key is not null
    group by source_key, coalesce(nullif(seed_type, ''), 'unknown')
  ),
  quality_metrics as (
    select coalesce(sum(seed_count), 0)::integer as total_seeds_tested,
      coalesce(sum(germinated_count), 0)::integer as total_seeds_germinated,
      coalesce(sum(seed_count) filter (where source_key is not null), 0)::integer as total_seeds_with_source,
      coalesce(sum(seed_count) filter (where source_key is null), 0)::integer as total_seeds_without_source,
      count(distinct variety_key) filter (where source_key is null)::integer as varieties_missing_source,
      count(*) filter (where source_key is null)::integer as unknown_sources
    from valid_rows
  ),
  duplicate_source_metrics as (
    select count(*)::integer as duplicate_sources from (
      select source_key from valid_rows where source_key is not null group by source_key
      having count(distinct lower(source_name)) > 1
    ) duplicate_source_keys
  ),
  totals as (
    select count(distinct evidence_id)::integer as completed_sessions,
      count(distinct source_key) filter (where source_key is not null)::integer as sources,
      count(distinct variety_key) filter (where variety_key is not null)::integer as varieties
    from valid_rows
  )
  select jsonb_build_object(
    'engine_version', 'gie.v1',
    'schema_version', '2026-07-13.2',
    'generated_at', timezone('utc', now()),
    'seed_records', coalesce((select jsonb_agg(jsonb_build_object(
      'id', variety_key, 'varietyName', variety_name, 'source', source_name,
      'sourceId', source_key, 'seedType', seed_type, 'sex', seed_sex,
      'batchAge', case when min_seed_age is null then 'Age not tracked'
        when max_seed_age <= 1 then 'Fresh to 1 year' when min_seed_age >= 3 then 'Archive / older lots'
        when max_seed_age <= 2 then '1-2 years' else 'Mixed ages' end,
      'communitySessions', community_sessions, 'seedsTracked', total_seeds,
      'totalGerminated', total_germinated,
      'germinationSuccess', case when total_seeds > 0 then round(total_germinated::numeric * 100 / total_seeds)::integer else 0 end,
      'summary', variety_name || ' is represented by ' || total_seeds || ' seeds across ' || community_sessions || ' completed session' || case when community_sessions = 1 then '' else 's' end || '.',
      'sourceRelationship', case when source_name = 'Multiple Sources' then 'This variety has completed-session evidence across multiple sources.' else 'Completed-session evidence is currently tied to ' || source_name || '.' end,
      'growInsight', case when cardinality(methods) > 0 then 'Observed through ' || array_to_string(methods[1:3], ', ') || case when cardinality(methods) > 3 then ', and other methods.' else '.' end else 'Grow-method distribution will expand as more completed sessions are added.' end,
      'isAnonymizedAggregate', true, 'publicEvidenceCount', 0
    ) order by community_sessions desc, total_seeds desc, variety_name) from variety_aggregate), '[]'::jsonb),
    'source_records', coalesce((select jsonb_agg(jsonb_build_object(
      'key', source_key, 'name', source_name, 'sessionsLogged', sessions_logged,
      'totalSeeds', total_seeds, 'totalGerminated', total_germinated,
      'varieties', coalesce(varieties, '[]'::jsonb),
      'seedTypeStats', coalesce((select jsonb_object_agg(types.seed_type, jsonb_build_object(
        'totalSeeds', types.total_seeds, 'totalGerminated', types.total_germinated
      )) from source_seed_type_aggregate types where types.source_key = source_aggregate.source_key), '{}'::jsonb),
      'lastLoggedAt', ''
    ) order by sessions_logged desc, total_seeds desc, source_name) from source_aggregate), '[]'::jsonb),
    'total_breeders_logged', totals.sources,
    'total_varieties_logged', totals.varieties,
    'total_completed_sessions', totals.completed_sessions,
    'total_seeds_tested', quality_metrics.total_seeds_tested,
    'total_seeds_germinated', quality_metrics.total_seeds_germinated,
    'overall_germination_rate', case when quality_metrics.total_seeds_tested > 0 then round(quality_metrics.total_seeds_germinated::numeric * 100 / quality_metrics.total_seeds_tested)::integer else 0 end,
    'total_seeds_with_source', quality_metrics.total_seeds_with_source,
    'total_seeds_without_source', quality_metrics.total_seeds_without_source,
    'source_attribution_rate', case when quality_metrics.total_seeds_tested > 0 then round(quality_metrics.total_seeds_with_source::numeric * 100 / quality_metrics.total_seeds_tested)::integer else 0 end,
    'source_attribution_status', case
      when (case when quality_metrics.total_seeds_tested > 0 then quality_metrics.total_seeds_with_source::numeric * 100 / quality_metrics.total_seeds_tested else 0 end) >= quality_thresholds.healthy then 'Healthy'
      when (case when quality_metrics.total_seeds_tested > 0 then quality_metrics.total_seeds_with_source::numeric * 100 / quality_metrics.total_seeds_tested else 0 end) >= quality_thresholds.warning then 'Warning'
      else 'Needs Attention' end,
    'source_attribution_thresholds', jsonb_build_object('healthy', quality_thresholds.healthy, 'warning', quality_thresholds.warning, 'needs_attention', quality_thresholds.needs_attention),
    'varieties_missing_source', quality_metrics.varieties_missing_source,
    'duplicate_sources', duplicate_source_metrics.duplicate_sources,
    'unknown_sources', quality_metrics.unknown_sources,
    'unknown_varieties', (select count(*) from rows where variety_key is null),
    'community_confidence', case when totals.completed_sessions >= 500 and quality_metrics.total_seeds_tested >= 10000 then 'Very High' when totals.completed_sessions >= 200 and quality_metrics.total_seeds_tested >= 4000 then 'High' when totals.completed_sessions >= 75 and quality_metrics.total_seeds_tested >= 1500 then 'Moderate' when totals.completed_sessions > 0 or quality_metrics.total_seeds_tested > 0 then 'Growing' else 'Limited' end,
    'community_confidence_percent', case when totals.completed_sessions >= 500 and quality_metrics.total_seeds_tested >= 10000 then 94 when totals.completed_sessions >= 200 and quality_metrics.total_seeds_tested >= 4000 then 78 when totals.completed_sessions >= 75 and quality_metrics.total_seeds_tested >= 1500 then 58 when totals.completed_sessions > 0 or quality_metrics.total_seeds_tested > 0 then 38 else 22 end
  )
  from totals cross join quality_metrics cross join duplicate_source_metrics cross join quality_thresholds;
$$;

revoke all on function public.get_gie_canonical_global_analytics_v1() from public, anon, authenticated;

create or replace function public.get_grow_intelligence_engine_analytics_core_v1()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$ select public.get_gie_canonical_global_analytics_v1(); $$;

revoke all on function public.get_grow_intelligence_engine_analytics_core_v1() from public, anon, authenticated;

create or replace function public.get_grow_intelligence_engine_data_quality()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with analytics as (select public.get_gie_canonical_global_analytics_v1() as payload)
  select jsonb_build_object(
    'total_seeds_tested', (payload ->> 'total_seeds_tested')::integer,
    'total_seeds_germinated', (payload ->> 'total_seeds_germinated')::integer,
    'overall_germination_rate', (payload ->> 'overall_germination_rate')::integer,
    'total_seeds_with_source', (payload ->> 'total_seeds_with_source')::integer,
    'total_seeds_without_source', (payload ->> 'total_seeds_without_source')::integer,
    'source_attribution_rate', (payload ->> 'source_attribution_rate')::integer,
    'source_attribution_status', payload ->> 'source_attribution_status',
    'source_attribution_thresholds', payload -> 'source_attribution_thresholds',
    'varieties_missing_source', (payload ->> 'varieties_missing_source')::integer,
    'duplicate_sources', (payload ->> 'duplicate_sources')::integer,
    'unknown_sources', (payload ->> 'unknown_sources')::integer,
    'unknown_varieties', (payload ->> 'unknown_varieties')::integer
  ) from analytics;
$$;

revoke all on function public.get_grow_intelligence_engine_data_quality() from public, anon, authenticated;

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
    select eligible_sessions.id as session_id, result_rows.result_ordinal,
      result_rows.partition_value as partition
    from eligible_sessions
    cross join lateral jsonb_array_elements(case
      when jsonb_typeof(coalesce(eligible_sessions.partitions, '[]'::jsonb)) = 'array' then coalesce(eligible_sessions.partitions, '[]'::jsonb)
      when jsonb_typeof(coalesce(eligible_sessions.partitions, '{}'::jsonb)) = 'object' and jsonb_typeof(eligible_sessions.partitions -> 'partitions') = 'array' then eligible_sessions.partitions -> 'partitions'
      when jsonb_typeof(coalesce(eligible_sessions.partitions, '{}'::jsonb)) = 'object' and jsonb_typeof(eligible_sessions.partitions -> 'rows') = 'array' then eligible_sessions.partitions -> 'rows'
      else '[]'::jsonb end
    ) with ordinality as result_rows(partition_value, result_ordinal)
  ),
  classified_rows as (
    select partition_rows.*,
      coalesce(parsed.seed_count, 0) as seed_count,
      coalesce(parsed.germinated_count, 0) as raw_germinated_count,
      parsed.germinated_count is not null as has_germinated_count,
      parsed.variety_name,
      coalesce(parsed.variety_canonical_id,
        nullif(trim(regexp_replace(lower(coalesce(parsed.variety_name, '')), '[^a-z0-9]+', ' ', 'g')), '')) as variety_key,
      coalesce(parsed.source_canonical_id,
        nullif(trim(regexp_replace(lower(coalesce(parsed.source_name, '')), '[^a-z0-9]+', ' ', 'g')), '')) as source_key
    from partition_rows
    cross join lateral public.get_gie_canonical_result_row_v1(partition_rows.partition) parsed
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

revoke all on function public.get_grow_intelligence_engine_quality_observations() from public, anon, authenticated;

-- The existing get_grow_intelligence_engine_analytics_legacy_v1() wrapper is
-- intentionally retained. It composes the canonical core, canonical data-quality
-- projection, and canonical observations while preserving the mature payload.

-- Keep the admin diagnostic compatibility surface, but parse every inspected
-- raw row through the same canonical parser as all three analytics contracts.
create or replace function public.get_explorer_completed_session_aggregate_diagnostics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare diagnostics jsonb;
begin
  if not exists (select 1 from public.admin_users where user_id = auth.uid())
    and coalesce(auth.role(), '') <> 'service_role'
    and session_user not in ('postgres', 'service_role') then
    raise exception 'Admin or service-role access is required' using errcode = '42501';
  end if;

  with session_base as (
    select grow_sessions.id, grow_sessions.user_id,
      coalesce(nullif(grow_sessions.session_name, ''), nullif(grow_sessions.custom_session_name, ''), grow_sessions.id::text) as session_label,
      grow_sessions.created_at, grow_sessions.completed_at, grow_sessions.session_status,
      grow_sessions.visibility_status, grow_sessions.partitions,
      public.resolve_grow_session_lifecycle(grow_sessions.id) as lifecycle_result
    from public.grow_sessions
  ),
  lifecycle_sessions as (
    select session_base.*,
      lifecycle_result ->> 'lifecycle_state' as lifecycle_state,
      lifecycle_result ->> 'eligibility_state' as eligibility_state,
      lifecycle_result ->> 'eligibility_reason' as exclusion_reason,
      lifecycle_result ->> 'deletion_source' as deletion_source,
      coalesce((lifecycle_result ->> 'included')::boolean, false) as included
    from session_base
  ),
  parsed_rows as (
    select lifecycle_sessions.id as session_id, lifecycle_sessions.exclusion_reason,
      coalesce(parsed.seed_count, 0) as seed_count,
      coalesce(parsed.germinated_count, 0) as germinated_count,
      parsed.variety_name, parsed.source_name
    from lifecycle_sessions
    cross join lateral jsonb_array_elements(case
      when jsonb_typeof(coalesce(lifecycle_sessions.partitions, '[]'::jsonb)) = 'array' then coalesce(lifecycle_sessions.partitions, '[]'::jsonb)
      when jsonb_typeof(coalesce(lifecycle_sessions.partitions, '{}'::jsonb)) = 'object' and jsonb_typeof(lifecycle_sessions.partitions -> 'partitions') = 'array' then lifecycle_sessions.partitions -> 'partitions'
      when jsonb_typeof(coalesce(lifecycle_sessions.partitions, '{}'::jsonb)) = 'object' and jsonb_typeof(lifecycle_sessions.partitions -> 'rows') = 'array' then lifecycle_sessions.partitions -> 'rows'
      else '[]'::jsonb end) partition_value
    cross join lateral public.get_gie_canonical_result_row_v1(partition_value) parsed
  ),
  result_row_counts as (
    select session_id,
      count(*) filter (where seed_count > 0 and variety_name is not null and germinated_count between 0 and seed_count)::integer as valid_result_rows,
      coalesce(sum(seed_count) filter (where seed_count > 0 and variety_name is not null and germinated_count between 0 and seed_count), 0)::integer as seeds_tested,
      coalesce(sum(least(seed_count, germinated_count)) filter (where seed_count > 0 and variety_name is not null and germinated_count between 0 and seed_count), 0)::integer as seeds_germinated
    from parsed_rows group by session_id
  ),
  classified_sessions as (
    select lifecycle_sessions.*, coalesce(result_row_counts.valid_result_rows, 0) as valid_result_rows,
      coalesce(result_row_counts.seeds_tested, 0) as seeds_tested,
      coalesce(result_row_counts.seeds_germinated, 0) as seeds_germinated
    from lifecycle_sessions left join result_row_counts on result_row_counts.session_id = lifecycle_sessions.id
  ),
  eligible_result_rows as (
    select * from parsed_rows where exclusion_reason = '' and seed_count > 0
      and variety_name is not null and germinated_count between 0 and seed_count
  ),
  exclusion_counts as (
    select exclusion_reason as reason, count(*)::integer as count
    from classified_sessions where exclusion_reason <> '' group by exclusion_reason
  ),
  included_session_audit as (
    select jsonb_agg(jsonb_build_object(
      'session_id', id, 'session_name', session_label, 'lifecycle_state', lifecycle_state,
      'eligibility_state', eligibility_state, 'eligibility_reason', exclusion_reason,
      'deletion_source', deletion_source, 'included', included, 'session_status', session_status,
      'visibility_status', visibility_status, 'completed_at', completed_at,
      'result_rows', valid_result_rows, 'seeds_tested', seeds_tested, 'seeds_germinated', seeds_germinated
    ) order by completed_at desc nulls last, created_at desc nulls last) as rows
    from classified_sessions where exclusion_reason = ''
  ),
  excluded_session_audit as (
    select jsonb_agg(jsonb_build_object(
      'session_id', id, 'session_name', session_label, 'lifecycle_state', lifecycle_state,
      'eligibility_state', eligibility_state, 'eligibility_reason', exclusion_reason,
      'deletion_source', deletion_source, 'included', included, 'session_status', session_status,
      'visibility_status', visibility_status, 'completed_at', completed_at,
      'result_rows', valid_result_rows, 'seeds_tested', seeds_tested, 'seeds_germinated', seeds_germinated
    ) order by exclusion_reason, completed_at desc nulls last, created_at desc nulls last) as rows
    from classified_sessions where exclusion_reason <> ''
  )
  select jsonb_build_object(
    'health_status', case when (select count(*) from classified_sessions where exclusion_reason = '' and valid_result_rows <= 0) > 0 then 'needs_review' else 'healthy' end,
    'engine_version', 'gie.v1', 'schema_version', '2026-07-13.7', 'generated_at', timezone('utc', now()),
    'integrity_score', case when (select count(*) from classified_sessions where exclusion_reason = '') = 0 then 100 else round((select count(*) from classified_sessions where exclusion_reason = '' and valid_result_rows > 0)::numeric * 100 / nullif((select count(*) from classified_sessions where exclusion_reason = ''), 0))::integer end,
    'total_sessions_inspected', (select count(*) from classified_sessions),
    'included_completed_sessions', (select count(distinct session_id) from eligible_result_rows),
    'excluded_deleted_sessions', (select count(*) from classified_sessions where exclusion_reason = 'deleted_session'),
    'excluded_cleanup_deleted_sessions', (select count(*) from classified_sessions where exclusion_reason = 'cleanup_deleted_session'),
    'excluded_test_mock_qa_demo_sessions', (select count(*) from classified_sessions where exclusion_reason in ('mock_session', 'test_session')),
    'excluded_incomplete_sessions', (select count(*) from classified_sessions where exclusion_reason = 'incomplete_session'),
    'excluded_abandoned_failed_canceled_sessions', (select count(*) from classified_sessions where exclusion_reason in ('abandoned', 'failed', 'canceled')),
    'excluded_invalid_timeline_sessions', (select count(*) from classified_sessions where exclusion_reason = 'invalid_timeline'),
    'aggregate_seed_record_count', (select count(distinct lower(regexp_replace(variety_name, '[^a-z0-9]+', ' ', 'g'))) from eligible_result_rows),
    'aggregate_source_record_count', (select count(distinct lower(regexp_replace(source_name, '[^a-z0-9]+', ' ', 'g'))) from eligible_result_rows where source_name is not null),
    'eligible_result_rows', (select count(*) from eligible_result_rows),
    'result_rows_missing_variety', (select count(*) from parsed_rows where exclusion_reason = '' and seed_count > 0 and variety_name is null),
    'result_rows_missing_source', (select count(*) from eligible_result_rows where source_name is null),
    'result_rows_without_seed_count', (select count(*) from parsed_rows where exclusion_reason = '' and seed_count <= 0),
    'sessions_excluded_by_reason', coalesce((select jsonb_object_agg(reason, count) from exclusion_counts), '{}'::jsonb),
    'included_session_audit', coalesce((select rows from included_session_audit), '[]'::jsonb),
    'excluded_session_audit', coalesce((select rows from excluded_session_audit), '[]'::jsonb)
  ) into diagnostics;
  return diagnostics;
end;
$$;

revoke all on function public.get_explorer_completed_session_aggregate_diagnostics() from public, anon;
grant execute on function public.get_explorer_completed_session_aggregate_diagnostics() to authenticated, service_role;

-- Recompose the existing frozen Community contract. All summary counts and all
-- Phase 2B/2C analytics now inherit the canonical resolver through the shared
-- scoped row pipeline.
create or replace function public.get_gie_community_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  base jsonb := public.get_gie_community_analytics_phase2b_v1();
  evidence_count integer := 0;
  contributor_count integer := 0;
begin
  select count(*)::integer, count(distinct evidence.user_id)::integer
  into evidence_count, contributor_count
  from public.get_gie_community_evidence_v1() evidence;

  return base || jsonb_build_object(
    'schema_version', '2026-07-13.7',
    'analytics', (base -> 'analytics')
      || public.get_gie_phase2c_community_enrichment_v1()
      || jsonb_build_object(
        'approved_public_snapshots', evidence_count,
        'public_contributors', contributor_count,
        'evidence_records', '[]'::jsonb
      )
  );
end;
$$;

revoke all on function public.get_gie_community_analytics() from public;
grant execute on function public.get_gie_community_analytics() to anon, authenticated;

comment on function public.get_gie_community_evidence_v1() is
  'Internal canonical approved-public Community evidence resolver shared by gie-community.v1 and the Community gallery.';
comment on function public.get_gie_community_gallery_evidence() is
  'Public privacy-safe Community gallery evidence projection; not an analytics contract.';
comment on function public.get_gie_community_analytics() is
  'Canonical gie-community.v1 contract over get_gie_community_evidence_v1(); schema 2026-07-13.7.';

notify pgrst, 'reload schema';
