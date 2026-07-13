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

-- Preserve the shared canonical scoped pipeline. Global and Owner branches are
-- byte-for-byte equivalent in behavior; only Community evidence selection and
-- the current snapshot partition field name (totalCount) are corrected.
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
      nullif(trim(coalesce(
        partition_value ->> 'seedVarietyDisplayName', partition_value ->> 'seed_variety_display_name',
        partition_value ->> 'seedVarietyCanonicalName', partition_value ->> 'seed_variety_canonical_name',
        partition_value ->> 'seedVariety', partition_value ->> 'seed_variety',
        partition_value ->> 'varietyName', partition_value ->> 'variety_name',
        partition_value ->> 'variety', partition_value ->> 'strain',
        partition_value ->> 'seedName', partition_value ->> 'seed_name'
      )), '') as variety_name,
      nullif(trim(coalesce(
        partition_value ->> 'seedVarietyCanonicalId', partition_value ->> 'seed_variety_canonical_id'
      )), '') as variety_canonical_id,
      nullif(trim(coalesce(
        partition_value ->> 'sourceDisplayName', partition_value ->> 'source_display_name',
        partition_value ->> 'sourceCanonicalName', partition_value ->> 'source_canonical_name',
        partition_value ->> 'sourceName', partition_value ->> 'source_name',
        partition_value ->> 'source', partition_value ->> 'breeder'
      )), '') as source_name,
      nullif(trim(coalesce(
        partition_value ->> 'sourceCanonicalId', partition_value ->> 'source_canonical_id'
      )), '') as source_canonical_id,
      greatest(0, coalesce(
        case when coalesce(partition_value ->> 'seedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'seedCount')::integer end,
        case when coalesce(partition_value ->> 'seed_count', '') ~ '^[0-9]+$' then (partition_value ->> 'seed_count')::integer end,
        case when coalesce(partition_value ->> 'totalCount', '') ~ '^[0-9]+$' then (partition_value ->> 'totalCount')::integer end,
        case when coalesce(partition_value ->> 'total_count', '') ~ '^[0-9]+$' then (partition_value ->> 'total_count')::integer end,
        case when coalesce(partition_value ->> 'totalSeeds', '') ~ '^[0-9]+$' then (partition_value ->> 'totalSeeds')::integer end,
        case when coalesce(partition_value ->> 'total_seeds', '') ~ '^[0-9]+$' then (partition_value ->> 'total_seeds')::integer end,
        case when coalesce(partition_value ->> 'seedsStarted', '') ~ '^[0-9]+$' then (partition_value ->> 'seedsStarted')::integer end,
        case when coalesce(partition_value ->> 'seeds_started', '') ~ '^[0-9]+$' then (partition_value ->> 'seeds_started')::integer end,
        case when coalesce(partition_value ->> 'seeds', '') ~ '^[0-9]+$' then (partition_value ->> 'seeds')::integer end,
        0
      )) as seed_count,
      greatest(0, coalesce(
        case when coalesce(partition_value ->> 'plantedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'plantedCount')::integer end,
        case when coalesce(partition_value ->> 'planted_count', '') ~ '^[0-9]+$' then (partition_value ->> 'planted_count')::integer end,
        case when coalesce(partition_value ->> 'germinatedCount', '') ~ '^[0-9]+$' then (partition_value ->> 'germinatedCount')::integer end,
        case when coalesce(partition_value ->> 'germinated_count', '') ~ '^[0-9]+$' then (partition_value ->> 'germinated_count')::integer end,
        case when coalesce(partition_value ->> 'totalGerminated', '') ~ '^[0-9]+$' then (partition_value ->> 'totalGerminated')::integer end,
        case when coalesce(partition_value ->> 'total_germinated', '') ~ '^[0-9]+$' then (partition_value ->> 'total_germinated')::integer end,
        0
      )) as raw_germinated_count,
      case
        when coalesce(partition_value ->> 'seedAgeYears', partition_value ->> 'seed_age_years', '') ~ '^[0-9]+(\.[0-9]+)?$'
          then coalesce(partition_value ->> 'seedAgeYears', partition_value ->> 'seed_age_years')::numeric
        else null
      end as seed_age_years
    from partition_rows
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
