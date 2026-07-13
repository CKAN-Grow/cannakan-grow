-- GIE Phase 2B: Group B Community Analytics consumer support.
-- Additive Community contract enrichment only. Global, Owner, lifecycle,
-- eligibility, normalization, and operational data behavior are unchanged.

create or replace function public.get_gie_community_phase2b_analytics_v1()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with eligible_snapshots as (
    select
      id,
      user_id,
      coalesce(nullif(system_type, ''), 'Grow Session') as system_type,
      coalesce(published_at, created_at) as published_at,
      include_profile_in_gallery,
      case when include_profile_in_gallery then coalesce(nullif(submitted_profile_name, ''), 'Community Grower') else 'Anonymous Grower' end as contributor_label
    from public.grow_gallery_snapshots
    where lower(coalesce(status, '')) = 'approved'
      and coalesce(is_published, false) = true
      and coalesce(analytics_excluded, false) = false
  ),
  result_rows as (
    select
      scoped.*,
      snapshots.user_id,
      snapshots.system_type,
      snapshots.published_at,
      snapshots.contributor_label
    from public.get_gie_scoped_result_rows_v1('community', null) scoped
    join eligible_snapshots snapshots on snapshots.id::text = scoped.evidence_id
  ),
  source_rollups as (
    select
      source_key as key,
      max(source_name) as label,
      count(distinct evidence_id)::integer as snapshot_count,
      count(distinct evidence_id)::integer as session_count,
      count(distinct user_id)::integer as contributor_count,
      sum(seed_count)::integer as total_seeds,
      sum(germinated_count)::integer as total_germinated,
      round(sum(germinated_count)::numeric * 100 / nullif(sum(seed_count), 0), 1) as average_rate,
      max(published_at) as latest_at,
      count(distinct variety_key)::integer as variety_count
    from result_rows
    where source_key is not null
    group by source_key
  ),
  variety_rollups as (
    select
      variety_key as key,
      max(variety_name) as label,
      count(distinct evidence_id)::integer as snapshot_count,
      count(distinct evidence_id)::integer as session_count,
      count(distinct user_id)::integer as contributor_count,
      sum(seed_count)::integer as total_seeds,
      sum(germinated_count)::integer as total_germinated,
      round(sum(germinated_count)::numeric * 100 / nullif(sum(seed_count), 0), 1) as average_rate,
      max(published_at) as latest_at,
      count(distinct source_key)::integer as source_count
    from result_rows
    where variety_key is not null
    group by variety_key
  ),
  age_rollups as (
    select
      case when seed_age_years is null then 'unknown' when seed_age_years <= 1 then 'fresh_to_1_year' when seed_age_years <= 2 then '1_to_2_years' else '3_plus_years' end as key,
      count(distinct evidence_id)::integer as snapshot_count,
      count(distinct evidence_id)::integer as session_count,
      count(distinct user_id)::integer as contributor_count,
      sum(seed_count)::integer as total_seeds,
      sum(germinated_count)::integer as total_germinated,
      round(sum(germinated_count)::numeric * 100 / nullif(sum(seed_count), 0), 1) as average_rate
    from result_rows
    group by 1
  ),
  month_rollups as (
    select
      to_char(date_trunc('month', published_at), 'YYYY-MM') as key,
      to_char(date_trunc('month', published_at), 'Mon YYYY') as label,
      count(distinct evidence_id)::integer as snapshot_count,
      count(distinct evidence_id)::integer as session_count,
      count(distinct user_id)::integer as contributor_count,
      sum(seed_count)::integer as total_seeds,
      sum(germinated_count)::integer as total_germinated,
      round(sum(germinated_count)::numeric * 100 / nullif(sum(seed_count), 0), 1) as average_rate
    from result_rows
    group by date_trunc('month', published_at)
  ),
  source_varieties as (
    select
      source_key,
      variety_key as key,
      max(variety_name) as label,
      count(distinct evidence_id)::integer as session_count,
      count(distinct user_id)::integer as contributor_count,
      sum(seed_count)::integer as total_seeds,
      sum(germinated_count)::integer as total_germinated,
      round(sum(germinated_count)::numeric * 100 / nullif(sum(seed_count), 0), 1) as average_rate
    from result_rows
    where source_key is not null and variety_key is not null
    group by source_key, variety_key
  ),
  ranked_source_varieties as (
    select *, row_number() over (partition by source_key order by average_rate desc nulls last, total_seeds desc, label)::integer as performance_rank
    from source_varieties
  ),
  variety_sources as (
    select
      variety_key,
      source_key as key,
      max(source_name) as label,
      count(distinct evidence_id)::integer as session_count,
      count(distinct user_id)::integer as contributor_count,
      sum(seed_count)::integer as total_seeds,
      sum(germinated_count)::integer as total_germinated,
      round(sum(germinated_count)::numeric * 100 / nullif(sum(seed_count), 0), 1) as average_rate
    from result_rows
    where source_key is not null and variety_key is not null
    group by variety_key, source_key
  ),
  ranked_variety_sources as (
    select *, row_number() over (partition by variety_key order by average_rate desc nulls last, total_seeds desc, label)::integer as performance_rank
    from variety_sources
  ),
  source_months as (
    select
      source_key,
      to_char(date_trunc('month', published_at), 'YYYY-MM') as key,
      to_char(date_trunc('month', published_at), 'Mon YYYY') as label,
      count(distinct evidence_id)::integer as session_count,
      sum(seed_count)::integer as total_seeds,
      sum(germinated_count)::integer as total_germinated,
      round(sum(germinated_count)::numeric * 100 / nullif(sum(seed_count), 0), 1) as average_rate
    from result_rows where source_key is not null
    group by source_key, date_trunc('month', published_at)
  ),
  variety_months as (
    select
      variety_key,
      to_char(date_trunc('month', published_at), 'YYYY-MM') as key,
      to_char(date_trunc('month', published_at), 'Mon YYYY') as label,
      count(distinct evidence_id)::integer as session_count,
      sum(seed_count)::integer as total_seeds,
      sum(germinated_count)::integer as total_germinated,
      round(sum(germinated_count)::numeric * 100 / nullif(sum(seed_count), 0), 1) as average_rate
    from result_rows
    group by variety_key, date_trunc('month', published_at)
  ),
  contributor_rollups as (
    select
      user_id,
      max(contributor_label) as label,
      count(distinct evidence_id)::integer as snapshot_count,
      count(distinct evidence_id)::integer as session_count,
      sum(seed_count)::integer as total_seeds,
      sum(germinated_count)::integer as total_germinated,
      round(sum(germinated_count)::numeric * 100 / nullif(sum(seed_count), 0), 1) as average_rate,
      max(published_at) as latest_at
    from result_rows
    group by user_id
  ),
  ranked_sources as (
    select *, row_number() over (order by average_rate desc nulls last, total_seeds desc, label)::integer as performance_rank,
      row_number() over (order by total_seeds desc, session_count desc, label)::integer as tested_rank,
      row_number() over (order by snapshot_count desc, total_seeds desc, label)::integer as activity_rank
    from source_rollups
  ),
  ranked_varieties as (
    select *, row_number() over (order by average_rate desc nulls last, total_seeds desc, label)::integer as performance_rank,
      row_number() over (order by total_seeds desc, session_count desc, label)::integer as tested_rank,
      row_number() over (order by snapshot_count desc, total_seeds desc, label)::integer as activity_rank
    from variety_rollups
  ),
  ranked_contributors as (
    select *, row_number() over (order by snapshot_count desc, total_seeds desc, label)::integer as rank
    from contributor_rollups
  ),
  source_reports as (
    select jsonb_build_object(
      'key', sources.key, 'label', sources.label, 'sessions', sources.session_count,
      'evidence_count', sources.snapshot_count, 'contributors', sources.contributor_count,
      'seeds_tested', sources.total_seeds, 'seeds_germinated', sources.total_germinated,
      'germination_rate', sources.average_rate, 'variety_count', sources.variety_count,
      'latest_at', sources.latest_at, 'rank', sources.performance_rank,
      'confidence', jsonb_build_object(
        'label', case when sources.session_count >= 20 and sources.total_seeds >= 200 then 'High' when sources.session_count >= 5 and sources.total_seeds >= 50 then 'Moderate' when sources.session_count > 0 then 'Growing' else 'Limited' end,
        'percent', case when sources.session_count >= 20 and sources.total_seeds >= 200 then 82 when sources.session_count >= 5 and sources.total_seeds >= 50 then 62 when sources.session_count > 0 then 38 else 22 end
      ),
      'source_quality', jsonb_build_object('status', case when sources.session_count >= 5 then 'Established Evidence' else 'Building Evidence' end, 'recognized_evidence_only', true),
      'top_varieties', coalesce((select jsonb_agg(to_jsonb(items) - 'source_key' order by items.performance_rank) from ranked_source_varieties items where items.source_key = sources.key), '[]'::jsonb),
      'monthly_trends', coalesce((select jsonb_agg(to_jsonb(months) - 'source_key' order by months.key) from source_months months where months.source_key = sources.key), '[]'::jsonb)
    ) as report
    from ranked_sources sources
  ),
  variety_reports as (
    select jsonb_build_object(
      'key', varieties.key, 'label', varieties.label, 'sessions', varieties.session_count,
      'evidence_count', varieties.snapshot_count, 'contributors', varieties.contributor_count,
      'seeds_tested', varieties.total_seeds, 'seeds_germinated', varieties.total_germinated,
      'germination_rate', varieties.average_rate, 'source_count', varieties.source_count,
      'latest_at', varieties.latest_at, 'rank', varieties.performance_rank,
      'confidence', jsonb_build_object(
        'label', case when varieties.session_count >= 20 and varieties.total_seeds >= 200 then 'High' when varieties.session_count >= 5 and varieties.total_seeds >= 50 then 'Moderate' when varieties.session_count > 0 then 'Growing' else 'Limited' end,
        'percent', case when varieties.session_count >= 20 and varieties.total_seeds >= 200 then 82 when varieties.session_count >= 5 and varieties.total_seeds >= 50 then 62 when varieties.session_count > 0 then 38 else 22 end
      ),
      'top_sources', coalesce((select jsonb_agg(to_jsonb(items) - 'variety_key' order by items.performance_rank) from ranked_variety_sources items where items.variety_key = varieties.key), '[]'::jsonb),
      'monthly_trends', coalesce((select jsonb_agg(to_jsonb(months) - 'variety_key' order by months.key) from variety_months months where months.variety_key = varieties.key), '[]'::jsonb)
    ) as report
    from ranked_varieties varieties
  ),
  totals as (
    select
      count(distinct evidence_id)::integer as sessions,
      count(distinct user_id)::integer as contributors,
      coalesce(sum(seed_count), 0)::integer as seeds_tested,
      coalesce(sum(germinated_count), 0)::integer as seeds_germinated
    from result_rows
  )
  select jsonb_build_object(
    'overview', jsonb_build_object(
      'community_average_rate', case when totals.seeds_tested > 0 then round(totals.seeds_germinated::numeric * 100 / totals.seeds_tested, 1) else 0 end,
      'total_public_sessions_represented', totals.sessions,
      'total_public_seeds_tested', totals.seeds_tested,
      'total_public_seeds_germinated', totals.seeds_germinated,
      'total_approved_community_entries', (select count(*)::integer from eligible_snapshots),
      'active_community_contributors', totals.contributors
    ),
    'source_rows', coalesce((select jsonb_agg(to_jsonb(rows) order by rows.performance_rank) from ranked_sources rows), '[]'::jsonb),
    'variety_rows', coalesce((select jsonb_agg(to_jsonb(rows) order by rows.performance_rank) from ranked_varieties rows), '[]'::jsonb),
    'age_rows', coalesce((select jsonb_agg(to_jsonb(rows) order by rows.key) from age_rollups rows), '[]'::jsonb),
    'month_rows', coalesce((select jsonb_agg(to_jsonb(rows) order by rows.key) from month_rollups rows), '[]'::jsonb),
    'best_age_range', (select to_jsonb(rows) from age_rollups rows where rows.total_seeds > 0 order by rows.average_rate desc nulls last, rows.total_seeds desc limit 1),
    'most_tested_age_range', (select to_jsonb(rows) from age_rollups rows where rows.total_seeds > 0 order by rows.total_seeds desc, rows.average_rate desc nulls last limit 1),
    'insight_cards', jsonb_build_array(
      jsonb_build_object('label', 'Top Source Signal', 'value', coalesce((select label from ranked_sources order by performance_rank limit 1), 'Not enough source data'), 'detail', 'Canonical Community source performance leader.'),
      jsonb_build_object('label', 'Most Tested Genetics', 'value', coalesce((select label from ranked_varieties order by tested_rank limit 1), 'Not enough variety data'), 'detail', 'Canonical Community seed-volume leader.'),
      jsonb_build_object('label', 'Community Confidence', 'value', case when totals.sessions >= 75 and totals.seeds_tested >= 1500 then 'Moderate' when totals.sessions > 0 then 'Growing' else 'Limited' end, 'detail', 'Canonical Community evidence confidence.')
    ),
    'rankings', jsonb_build_object(
      'top_sources', coalesce((select jsonb_agg(to_jsonb(rows) order by rows.performance_rank) from ranked_sources rows), '[]'::jsonb),
      'most_tested_sources', coalesce((select jsonb_agg(to_jsonb(rows) order by rows.tested_rank) from ranked_sources rows), '[]'::jsonb),
      'most_active_sources', coalesce((select jsonb_agg(to_jsonb(rows) order by rows.activity_rank) from ranked_sources rows), '[]'::jsonb),
      'top_varieties', coalesce((select jsonb_agg(to_jsonb(rows) order by rows.performance_rank) from ranked_varieties rows), '[]'::jsonb),
      'most_tested_varieties', coalesce((select jsonb_agg(to_jsonb(rows) order by rows.tested_rank) from ranked_varieties rows), '[]'::jsonb),
      'repeat_tested_varieties', coalesce((select jsonb_agg(to_jsonb(rows) order by rows.activity_rank) from ranked_varieties rows where rows.snapshot_count > 1), '[]'::jsonb),
      'contributors', coalesce((select jsonb_agg(jsonb_build_object(
        'key', 'contributor-' || rows.rank,
        'label', rows.label,
        'snapshot_count', rows.snapshot_count,
        'session_count', rows.session_count,
        'total_seeds', rows.total_seeds,
        'total_germinated', rows.total_germinated,
        'average_rate', rows.average_rate,
        'latest_at', rows.latest_at,
        'rank', rows.rank
      ) order by rows.rank) from ranked_contributors rows), '[]'::jsonb)
    ),
    'leaderboards', jsonb_build_object(
      'sources', coalesce((select jsonb_agg(to_jsonb(rows) order by rows.performance_rank) from ranked_sources rows), '[]'::jsonb),
      'varieties', coalesce((select jsonb_agg(to_jsonb(rows) order by rows.performance_rank) from ranked_varieties rows), '[]'::jsonb),
      'contributors', coalesce((select jsonb_agg(jsonb_build_object(
        'key', 'contributor-' || rows.rank,
        'label', rows.label,
        'snapshot_count', rows.snapshot_count,
        'session_count', rows.session_count,
        'total_seeds', rows.total_seeds,
        'total_germinated', rows.total_germinated,
        'average_rate', rows.average_rate,
        'latest_at', rows.latest_at,
        'rank', rows.rank
      ) order by rows.rank) from ranked_contributors rows), '[]'::jsonb)
    ),
    'source_reports', coalesce((select jsonb_agg(report) from source_reports), '[]'::jsonb),
    'variety_reports', coalesce((select jsonb_agg(report) from variety_reports), '[]'::jsonb),
    'group_b_adoption', jsonb_build_object(
      'community', 'migrated', 'community_reports', 'migrated', 'variety_reports', 'migrated',
      'source_reports', 'migrated', 'rankings', 'migrated', 'leaderboards', 'migrated',
      'community_confidence', 'migrated'
    )
  )
  from totals;
$$;

revoke all on function public.get_gie_community_phase2b_analytics_v1() from public;
revoke all on function public.get_gie_community_phase2b_analytics_v1() from anon;
revoke all on function public.get_gie_community_phase2b_analytics_v1() from authenticated;

create or replace function public.get_gie_community_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  analytics jsonb := public.get_gie_contract_analytics_v1('community', null);
  phase2b jsonb := public.get_gie_community_phase2b_analytics_v1();
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
      'schema_version', '2026-07-13.6',
      'privacy_scope', 'approved_public_evidence',
      'authorization_status', 'public',
      'payload_validation_status', 'valid',
      'analytics', analytics || phase2b || jsonb_build_object(
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

do $$
begin
  if to_regprocedure('public.get_gie_contract_diagnostics_phase2a_v1()') is null
    and to_regprocedure('public.get_gie_contract_diagnostics()') is not null then
    alter function public.get_gie_contract_diagnostics() rename to get_gie_contract_diagnostics_phase2a_v1;
  end if;
end;
$$;

revoke all on function public.get_gie_contract_diagnostics_phase2a_v1() from public;
revoke all on function public.get_gie_contract_diagnostics_phase2a_v1() from anon;
revoke all on function public.get_gie_contract_diagnostics_phase2a_v1() from authenticated;

create or replace function public.get_gie_contract_diagnostics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  diagnostics jsonb;
begin
  if not exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
    and coalesce(auth.role(), '') <> 'service_role'
    and session_user not in ('postgres', 'service_role') then
    raise exception 'Admin or service-role access is required' using errcode = '42501';
  end if;
  diagnostics := public.get_gie_contract_diagnostics_phase2a_v1();
  return diagnostics || jsonb_build_object(
    'group_b_adoption', jsonb_build_object(
      'status', 'Migrated', 'contract', 'Community Contract', 'duplicated_analytics', 'None',
      'consumers', public.get_gie_community_phase2b_analytics_v1() -> 'group_b_adoption',
      'adoption_percentage', 80,
      'remaining_legacy_consumers', jsonb_build_array('Grow Network', 'Admin Grow Analytics', 'Recommendations', 'AI Integration')
    )
  );
end;
$$;

revoke all on function public.get_gie_contract_diagnostics() from public;
revoke all on function public.get_gie_contract_diagnostics() from anon;
grant execute on function public.get_gie_contract_diagnostics() to authenticated;
grant execute on function public.get_gie_contract_diagnostics() to service_role;

comment on function public.get_gie_community_phase2b_analytics_v1() is
  'Internal presentation-ready Group B analytics over approved published Community evidence only; no identity, notes, images, or evidence records.';
comment on function public.get_gie_community_analytics() is
  'Canonical public gie-community.v1 contract for Phase 2B Group B consumers; schema 2026-07-13.6.';

notify pgrst, 'reload schema';
