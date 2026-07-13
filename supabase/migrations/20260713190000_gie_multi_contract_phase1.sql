-- Grow Intelligence Engine multi-contract architecture, Phase 1.
--
-- One engine, three stable privacy-scoped contracts:
--   public.get_gie_global_analytics()
--   public.get_gie_owner_analytics(uuid)
--   public.get_gie_community_analytics()
--
-- This migration is additive. It does not change lifecycle resolution,
-- analytics eligibility, normalization rules, or operational data.

-- Preserve the released anonymous GIE implementation as the Global contract's
-- canonical analytics implementation. The historical RPC is recreated below as
-- a compatibility-only delegate.
do $$
begin
  if to_regprocedure('public.get_grow_intelligence_engine_analytics_legacy_v1()') is null
    and to_regprocedure('public.get_grow_intelligence_engine_analytics()') is not null then
    alter function public.get_grow_intelligence_engine_analytics()
      rename to get_grow_intelligence_engine_analytics_legacy_v1;
  end if;
end;
$$;

revoke all on function public.get_grow_intelligence_engine_analytics_legacy_v1() from public;
revoke all on function public.get_grow_intelligence_engine_analytics_legacy_v1() from anon;
revoke all on function public.get_grow_intelligence_engine_analytics_legacy_v1() from authenticated;

-- Internal metadata helper. Contract metadata is deliberately generated in one
-- place so version identifiers cannot drift between privacy scopes.
create or replace function public.get_gie_contract_metadata_v1(
  p_contract_name text,
  p_contract_version text
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'contract_name', p_contract_name,
    'contract_version', p_contract_version,
    'engine_version', 'gie.v1',
    'schema_version', '2026-07-13.4',
    'data_quality_version', coalesce(
      (select data_quality_version from public.grow_intelligence_engine_config where singleton),
      'gie-dq.v1'
    ),
    'generated_at', timezone('utc', now())
  );
$$;

revoke all on function public.get_gie_contract_metadata_v1(text, text) from public;
revoke all on function public.get_gie_contract_metadata_v1(text, text) from anon;
revoke all on function public.get_gie_contract_metadata_v1(text, text) from authenticated;

-- Internal canonical row resolver shared by scoped contracts. Global and Owner
-- rows use the existing lifecycle eligibility resolver. Community rows come
-- only from approved, currently published, non-excluded public snapshots.
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
      grow_gallery_snapshots.id::text as evidence_id,
      coalesce(nullif(grow_gallery_snapshots.system_type, ''), 'Grow Session') as method_type,
      case
        when jsonb_typeof(coalesce(grow_gallery_snapshots.partition_results, '[]'::jsonb)) = 'array'
          and jsonb_array_length(coalesce(grow_gallery_snapshots.partition_results, '[]'::jsonb)) > 0
          then grow_gallery_snapshots.partition_results
        else jsonb_build_array(jsonb_build_object(
          'seedCount', greatest(0, coalesce(grow_gallery_snapshots.total_seeds, 0)),
          'germinatedCount', least(
            greatest(0, coalesce(grow_gallery_snapshots.total_seeds, 0)),
            greatest(0, round(
              greatest(0, coalesce(grow_gallery_snapshots.total_seeds, 0))::numeric
              * greatest(0, least(100, coalesce(grow_gallery_snapshots.success_percent, 0))) / 100
            )::integer)
          ),
          'seedVariety', coalesce(grow_gallery_snapshots.seed_variety_name, ''),
          'sourceCanonicalId', coalesce(grow_gallery_snapshots.source_id::text, ''),
          'sourceName', coalesce(grow_gallery_snapshots.source_name, ''),
          'seedAgeYears', grow_gallery_snapshots.session_seed_age_years
        ))
      end as partitions
    from public.grow_gallery_snapshots
    where p_scope = 'community'
      and lower(coalesce(grow_gallery_snapshots.status, '')) = 'approved'
      and coalesce(grow_gallery_snapshots.is_published, false) = true
      and coalesce(grow_gallery_snapshots.analytics_excluded, false) = false
  ),
  evidence as (
    select * from session_evidence
    union all
    select * from community_evidence
  ),
  partition_rows as (
    select
      evidence.evidence_id,
      evidence.method_type,
      partition_value
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
    coalesce(
      normalized.variety_canonical_id,
      nullif(trim(regexp_replace(lower(coalesce(normalized.variety_name, '')), '[^a-z0-9]+', ' ', 'g')), '')
    ) as variety_key,
    normalized.source_name,
    coalesce(
      normalized.source_canonical_id,
      nullif(trim(regexp_replace(lower(coalesce(normalized.source_name, '')), '[^a-z0-9]+', ' ', 'g')), '')
    ) as source_key,
    normalized.seed_count,
    least(normalized.seed_count, normalized.raw_germinated_count) as germinated_count,
    normalized.seed_age_years
  from normalized
  where normalized.seed_count > 0
    and normalized.raw_germinated_count between 0 and normalized.seed_count;
$$;

revoke all on function public.get_gie_scoped_result_rows_v1(text, uuid) from public;
revoke all on function public.get_gie_scoped_result_rows_v1(text, uuid) from anon;
revoke all on function public.get_gie_scoped_result_rows_v1(text, uuid) from authenticated;

-- Shared aggregation, confidence, ranking, and scoped data-quality pipeline.
-- Owner and Community are composed from this helper; future fields must be
-- added here instead of reimplemented in a contract or UI component.
create or replace function public.get_gie_scoped_analytics_v1(
  p_scope text,
  p_owner_id uuid default null
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with all_rows as (
    select * from public.get_gie_scoped_result_rows_v1(p_scope, p_owner_id)
  ),
  rows as (
    select * from all_rows where variety_key is not null
  ),
  totals as (
    select
      count(distinct evidence_id)::integer as completed_sessions,
      coalesce(sum(seed_count), 0)::integer as seeds_tested,
      coalesce(sum(germinated_count), 0)::integer as seeds_germinated,
      count(distinct variety_key)::integer as varieties,
      count(distinct source_key)::integer as sources,
      coalesce(sum(seed_count) filter (where source_key is not null), 0)::integer as seeds_with_source,
      coalesce(sum(seed_count) filter (where source_key is null), 0)::integer as seeds_without_source,
      count(*) filter (where source_key is null)::integer as unknown_sources,
      (select count(*)::integer from all_rows where variety_key is null) as unknown_varieties
    from rows
  ),
  variety_ranking as (
    select
      variety_key as key,
      max(variety_name) as name,
      count(distinct evidence_id)::integer as sessions,
      sum(seed_count)::integer as seeds_tested,
      sum(germinated_count)::integer as seeds_germinated
    from rows
    where variety_key is not null
    group by variety_key
  ),
  source_ranking as (
    select
      source_key as key,
      max(source_name) as name,
      count(distinct evidence_id)::integer as sessions,
      sum(seed_count)::integer as seeds_tested,
      sum(germinated_count)::integer as seeds_germinated
    from rows
    where source_key is not null
    group by source_key
  ),
  method_ranking as (
    select
      method_type as name,
      count(distinct evidence_id)::integer as sessions,
      sum(seed_count)::integer as seeds_tested,
      sum(germinated_count)::integer as seeds_germinated
    from rows
    group by method_type
  ),
  age_buckets as (
    select
      case
        when seed_age_years is null then 'unknown'
        when seed_age_years <= 1 then 'fresh_to_1_year'
        when seed_age_years <= 2 then '1_to_2_years'
        else '3_plus_years'
      end as bucket,
      sum(seed_count)::integer as seeds_tested,
      sum(germinated_count)::integer as seeds_germinated
    from rows
    group by 1
  )
  select jsonb_build_object(
    'completed_sessions', totals.completed_sessions,
    'seeds_tested', totals.seeds_tested,
    'seeds_germinated', totals.seeds_germinated,
    'overall_germination_rate', case when totals.seeds_tested > 0 then round(totals.seeds_germinated::numeric * 100 / totals.seeds_tested)::integer else 0 end,
    'varieties', totals.varieties,
    'sources', totals.sources,
    'methods', coalesce((select jsonb_agg(method_type order by method_type) from (select distinct method_type from rows) methods), '[]'::jsonb),
    'seed_age_buckets', coalesce((select jsonb_agg(jsonb_build_object('bucket', bucket, 'seeds_tested', seeds_tested, 'seeds_germinated', seeds_germinated) order by bucket) from age_buckets), '[]'::jsonb),
    'confidence', jsonb_build_object(
      'label', case when totals.completed_sessions >= 500 and totals.seeds_tested >= 10000 then 'Very High' when totals.completed_sessions >= 200 and totals.seeds_tested >= 4000 then 'High' when totals.completed_sessions >= 75 and totals.seeds_tested >= 1500 then 'Moderate' when totals.completed_sessions > 0 or totals.seeds_tested > 0 then 'Growing' else 'Limited' end,
      'percent', case when totals.completed_sessions >= 500 and totals.seeds_tested >= 10000 then 94 when totals.completed_sessions >= 200 and totals.seeds_tested >= 4000 then 78 when totals.completed_sessions >= 75 and totals.seeds_tested >= 1500 then 58 when totals.completed_sessions > 0 or totals.seeds_tested > 0 then 38 else 22 end
    ),
    'rankings', jsonb_build_object(
      'varieties', coalesce((select jsonb_agg(jsonb_build_object('key', key, 'name', name, 'sessions', sessions, 'seeds_tested', seeds_tested, 'seeds_germinated', seeds_germinated, 'germination_rate', case when seeds_tested > 0 then round(seeds_germinated::numeric * 100 / seeds_tested)::integer else 0 end) order by sessions desc, seeds_tested desc, name) from variety_ranking), '[]'::jsonb),
      'sources', coalesce((select jsonb_agg(jsonb_build_object('key', key, 'name', name, 'sessions', sessions, 'seeds_tested', seeds_tested, 'seeds_germinated', seeds_germinated, 'germination_rate', case when seeds_tested > 0 then round(seeds_germinated::numeric * 100 / seeds_tested)::integer else 0 end) order by sessions desc, seeds_tested desc, name) from source_ranking), '[]'::jsonb),
      'methods', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'sessions', sessions, 'seeds_tested', seeds_tested, 'seeds_germinated', seeds_germinated, 'germination_rate', case when seeds_tested > 0 then round(seeds_germinated::numeric * 100 / seeds_tested)::integer else 0 end) order by sessions desc, seeds_tested desc, name) from method_ranking), '[]'::jsonb)
    ),
    'data_quality', jsonb_build_object(
      'total_seeds_tested', totals.seeds_tested,
      'total_seeds_with_source', totals.seeds_with_source,
      'total_seeds_without_source', totals.seeds_without_source,
      'source_attribution_rate', case when totals.seeds_tested > 0 then round(totals.seeds_with_source::numeric * 100 / totals.seeds_tested)::integer else 0 end,
      'unknown_sources', totals.unknown_sources,
      'unknown_varieties', totals.unknown_varieties
    )
  )
  from totals;
$$;

revoke all on function public.get_gie_scoped_analytics_v1(text, uuid) from public;
revoke all on function public.get_gie_scoped_analytics_v1(text, uuid) from anon;
revoke all on function public.get_gie_scoped_analytics_v1(text, uuid) from authenticated;

-- Single internal dispatcher for the one engine. Global preserves the mature
-- released implementation; Owner and Community use the scoped pipeline above.
-- Contract functions never select operational analytics data themselves.
create or replace function public.get_gie_contract_analytics_v1(
  p_scope text,
  p_owner_id uuid default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_scope = 'global' then
    return public.get_grow_intelligence_engine_analytics_legacy_v1();
  end if;
  if p_scope in ('owner', 'community') then
    return public.get_gie_scoped_analytics_v1(p_scope, p_owner_id);
  end if;
  raise exception 'Unsupported GIE contract scope' using errcode = '22023';
end;
$$;

revoke all on function public.get_gie_contract_analytics_v1(text, uuid) from public;
revoke all on function public.get_gie_contract_analytics_v1(text, uuid) from anon;
revoke all on function public.get_gie_contract_analytics_v1(text, uuid) from authenticated;

-- Contract 1: anonymous, identity-free global analytics. The released GIE
-- payload remains nested under analytics and is also flattened by the legacy
-- wrapper below for Seed Explorer and Source Explorer compatibility.
create or replace function public.get_gie_global_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  analytics jsonb := public.get_gie_contract_analytics_v1('global', null);
begin
  return public.get_gie_contract_metadata_v1('global_analytics', 'gie-global.v1')
    || jsonb_build_object(
      'privacy_scope', 'anonymous_global',
      'authorization_status', 'public',
      'payload_validation_status', 'valid',
      'analytics', analytics
    );
end;
$$;

revoke all on function public.get_gie_global_analytics() from public;
grant execute on function public.get_gie_global_analytics() to anon;
grant execute on function public.get_gie_global_analytics() to authenticated;

-- Contract 2: authenticated owner analytics. A caller may omit p_owner_id to
-- request their own payload. A different target is accepted only for an
-- authorized admin, validated inside this SECURITY DEFINER boundary.
create or replace function public.get_gie_owner_analytics(p_owner_id uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  requester_id uuid := auth.uid();
  target_owner_id uuid := coalesce(p_owner_id, auth.uid());
  requester_is_admin boolean := false;
  analytics jsonb;
  active_sessions integer := 0;
  vault_summary jsonb := jsonb_build_object('total_entries', 0, 'available_entries', 0, 'planning_entries', 0);
begin
  if requester_id is null then
    raise exception 'Authentication required for owner analytics' using errcode = '42501';
  end if;

  select exists (
    select 1 from public.admin_users where admin_users.user_id = requester_id
  ) into requester_is_admin;

  if target_owner_id is distinct from requester_id and not requester_is_admin then
    raise exception 'Owner analytics access denied' using errcode = '42501';
  end if;

  analytics := public.get_gie_contract_analytics_v1('owner', target_owner_id);

  select count(*)::integer into active_sessions
  from public.grow_sessions
  where grow_sessions.user_id = target_owner_id
    and public.resolve_grow_session_lifecycle(grow_sessions.id) ->> 'lifecycle_state' = 'incomplete';

  if to_regclass('public.seed_vault_entries') is not null then
    select jsonb_build_object(
      'total_entries', count(*)::integer,
      'available_entries', count(*) filter (where coalesce(is_archived, false) = false and coalesce(is_deleted, false) = false)::integer,
      'planning_entries', count(*) filter (where lower(coalesce(planning_status, '')) not in ('', 'none'))::integer
    ) into vault_summary
    from public.seed_vault_entries
    where user_id = target_owner_id
      and coalesce(is_deleted, false) = false;
  end if;

  return public.get_gie_contract_metadata_v1('owner_analytics', 'gie-owner.v1')
    || jsonb_build_object(
      'privacy_scope', 'authenticated_owner',
      'authorization_status', case when requester_is_admin and target_owner_id is distinct from requester_id then 'authorized_admin' else 'authorized_owner' end,
      'payload_validation_status', 'valid',
      'owner_id', target_owner_id,
      'analytics', analytics || jsonb_build_object(
        'active_sessions', active_sessions,
        'seed_vault', vault_summary,
        'session_history', '[]'::jsonb,
        'recommendations', '[]'::jsonb
      )
    );
end;
$$;

revoke all on function public.get_gie_owner_analytics(uuid) from public;
revoke all on function public.get_gie_owner_analytics(uuid) from anon;
grant execute on function public.get_gie_owner_analytics(uuid) to authenticated;

-- Contract 3: public social-evidence analytics. No session/profile identity,
-- notes, images, or unpublished evidence is selected by its source resolver.
create or replace function public.get_gie_community_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  analytics jsonb := public.get_gie_contract_analytics_v1('community', null);
  snapshot_count integer := 0;
  contributor_count integer := 0;
begin
  select count(*)::integer, count(distinct user_id)::integer
  into snapshot_count, contributor_count
  from public.grow_gallery_snapshots
  where lower(coalesce(status, '')) = 'approved'
    and coalesce(is_published, false) = true
    and coalesce(analytics_excluded, false) = false;

  return public.get_gie_contract_metadata_v1('community_analytics', 'gie-community.v1')
    || jsonb_build_object(
      'privacy_scope', 'approved_public_evidence',
      'authorization_status', 'public',
      'payload_validation_status', 'valid',
      'analytics', analytics || jsonb_build_object(
        'approved_public_snapshots', snapshot_count,
        'public_contributors', contributor_count,
        'evidence_records', '[]'::jsonb
      )
    );
end;
$$;

revoke all on function public.get_gie_community_analytics() from public;
grant execute on function public.get_gie_community_analytics() to anon;
grant execute on function public.get_gie_community_analytics() to authenticated;

-- Released compatibility RPC. It contains no calculations and delegates to the
-- Global contract so current Explorer consumers remain stable during Phase 1.
create or replace function public.get_grow_intelligence_engine_analytics()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select public.get_gie_global_analytics() -> 'analytics';
$$;

revoke all on function public.get_grow_intelligence_engine_analytics() from public;
grant execute on function public.get_grow_intelligence_engine_analytics() to anon;
grant execute on function public.get_grow_intelligence_engine_analytics() to authenticated;

-- Admin-only, read-only contract health. This validates contract metadata and
-- reports authorization without copying any analytics into the diagnostic UI.
create or replace function public.get_gie_contract_diagnostics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  global_contract jsonb;
  owner_contract jsonb;
  community_contract jsonb;
begin
  if not exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
    and coalesce(auth.role(), '') <> 'service_role'
    and session_user not in ('postgres', 'service_role') then
    raise exception 'Admin or service-role access is required' using errcode = '42501';
  end if;

  global_contract := public.get_gie_global_analytics();
  owner_contract := case when auth.uid() is null then null else public.get_gie_owner_analytics(auth.uid()) end;
  community_contract := public.get_gie_community_analytics();

  return jsonb_build_object(
    'contracts', jsonb_build_array(
      jsonb_build_object(
        'contract_name', 'global_analytics',
        'availability', global_contract is not null,
        'contract_version', global_contract ->> 'contract_version',
        'engine_version', global_contract ->> 'engine_version',
        'schema_version', global_contract ->> 'schema_version',
        'data_quality_version', global_contract ->> 'data_quality_version',
        'generated_at', global_contract ->> 'generated_at',
        'authorization_status', global_contract ->> 'authorization_status',
        'payload_validation_status', global_contract ->> 'payload_validation_status'
      ),
      jsonb_build_object(
        'contract_name', 'owner_analytics',
        'availability', owner_contract is not null,
        'contract_version', coalesce(owner_contract ->> 'contract_version', 'gie-owner.v1'),
        'engine_version', coalesce(owner_contract ->> 'engine_version', 'gie.v1'),
        'schema_version', coalesce(owner_contract ->> 'schema_version', '2026-07-13.4'),
        'data_quality_version', coalesce(owner_contract ->> 'data_quality_version', 'gie-dq.v1'),
        'generated_at', owner_contract ->> 'generated_at',
        'authorization_status', coalesce(owner_contract ->> 'authorization_status', 'service_role_no_owner_context'),
        'payload_validation_status', case when owner_contract is null then 'not_exercised' else owner_contract ->> 'payload_validation_status' end
      ),
      jsonb_build_object(
        'contract_name', 'community_analytics',
        'availability', community_contract is not null,
        'contract_version', community_contract ->> 'contract_version',
        'engine_version', community_contract ->> 'engine_version',
        'schema_version', community_contract ->> 'schema_version',
        'data_quality_version', community_contract ->> 'data_quality_version',
        'generated_at', community_contract ->> 'generated_at',
        'authorization_status', community_contract ->> 'authorization_status',
        'payload_validation_status', community_contract ->> 'payload_validation_status'
      )
    )
  );
end;
$$;

revoke all on function public.get_gie_contract_diagnostics() from public;
revoke all on function public.get_gie_contract_diagnostics() from anon;
grant execute on function public.get_gie_contract_diagnostics() to authenticated;
grant execute on function public.get_gie_contract_diagnostics() to service_role;

comment on function public.get_gie_global_analytics() is
  'GIE Global Analytics Contract gie-global.v1. Anonymous aggregate analytics with no private identity fields.';
comment on function public.get_gie_owner_analytics(uuid) is
  'GIE Owner Analytics Contract gie-owner.v1. Authenticated owner or authorized-admin access only.';
comment on function public.get_gie_community_analytics() is
  'GIE Community Analytics Contract gie-community.v1. Approved and visible public evidence only.';
comment on function public.get_grow_intelligence_engine_analytics() is
  'Deprecated compatibility wrapper. Delegates to get_gie_global_analytics() for Seed Explorer and Source Explorer.';
comment on function public.get_gie_contract_diagnostics() is
  'Admin/service-role read-only diagnostics for the three canonical GIE contracts.';

notify pgrst, 'reload schema';
