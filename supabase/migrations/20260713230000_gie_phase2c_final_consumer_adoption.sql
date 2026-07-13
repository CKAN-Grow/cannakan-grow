-- GIE Phase 2C: final consumer adoption.
-- Additive enrichment of the three frozen contracts only. Lifecycle,
-- eligibility, normalization, privacy rules, and production data are unchanged.

create or replace function public.get_gie_phase2c_recommendation_v1(
  p_id text,
  p_title text,
  p_detail text,
  p_evidence_count integer,
  p_confidence jsonb,
  p_scope text,
  p_generated_at timestamptz
)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select jsonb_build_object(
    'id', p_id,
    'title', p_title,
    'detail', p_detail,
    'evidence_count', greatest(coalesce(p_evidence_count, 0), 0),
    'confidence', coalesce(p_confidence, jsonb_build_object('label', 'Insufficient evidence', 'percent', 0)),
    'scope', initcap(lower(p_scope)),
    'engine_version', 'gie.v1',
    'contract_version', 'gie-' || lower(p_scope) || '.v1',
    'generated_at', p_generated_at,
    'evidence_state', case when coalesce(p_evidence_count, 0) > 0 then 'available' else 'insufficient' end
  );
$$;

revoke all on function public.get_gie_phase2c_recommendation_v1(text, text, text, integer, jsonb, text, timestamptz) from public, anon, authenticated;

create or replace function public.get_gie_phase2c_community_enrichment_v1()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with eligible_snapshots as (
    select id, user_id, coalesce(published_at, created_at) as published_at,
      coalesce(nullif(submitted_profile_name, ''), 'Community Grower') as display_name
    from public.grow_gallery_snapshots
    where lower(coalesce(status, '')) = 'approved'
      and coalesce(is_published, false) = true
      and coalesce(analytics_excluded, false) = false
      and coalesce(include_profile_in_gallery, false) = true
  ), rows as (
    select scoped.*, snapshots.user_id, snapshots.published_at, snapshots.display_name
    from public.get_gie_scoped_result_rows_v1('community', null) scoped
    join eligible_snapshots snapshots on snapshots.id::text = scoped.evidence_id
  ), profiles as (
    select user_id, max(display_name) as display_name,
      count(distinct evidence_id)::integer as evidence_count,
      count(distinct evidence_id)::integer as session_count,
      sum(seed_count)::integer as seeds_tested,
      sum(germinated_count)::integer as seeds_germinated,
      round(sum(germinated_count)::numeric * 100 / nullif(sum(seed_count), 0), 1) as germination_rate,
      count(distinct variety_key)::integer as variety_count,
      count(distinct source_key)::integer as source_count,
      max(published_at) as latest_at
    from rows group by user_id
  ), ranked as (
    select *, row_number() over (order by evidence_count desc, seeds_tested desc, display_name)::integer as rank
    from profiles
  ), phase2b as (
    select public.get_gie_community_phase2b_analytics_v1() as analytics
  ), leaders as (
    select analytics -> 'rankings' -> 'top_varieties' -> 0 as variety,
      analytics -> 'rankings' -> 'top_sources' -> 0 as source
    from phase2b
  )
  select jsonb_build_object(
    'network_profiles', coalesce((select jsonb_agg(jsonb_build_object(
      'public_profile_id', user_id, 'display_name', display_name,
      'evidence_count', evidence_count, 'session_count', session_count,
      'seeds_tested', seeds_tested, 'seeds_germinated', seeds_germinated,
      'germination_rate', germination_rate, 'variety_count', variety_count,
      'source_count', source_count, 'latest_at', latest_at, 'rank', rank,
      'confidence', jsonb_build_object(
        'label', case when session_count >= 20 and seeds_tested >= 200 then 'High' when session_count >= 5 and seeds_tested >= 50 then 'Moderate' when session_count > 0 then 'Growing' else 'Insufficient evidence' end,
        'percent', case when session_count >= 20 and seeds_tested >= 200 then 82 when session_count >= 5 and seeds_tested >= 50 then 62 when session_count > 0 then 38 else 0 end
      )
    ) order by rank) from ranked), '[]'::jsonb),
    'recommendations',
      (case when leaders.variety is not null then jsonb_build_array(public.get_gie_phase2c_recommendation_v1(
        'community-variety-leader', 'Community variety evidence',
        coalesce(leaders.variety ->> 'label', 'The leading variety') || ' currently has the strongest approved public performance signal.',
        coalesce((leaders.variety ->> 'snapshot_count')::integer, 0),
        jsonb_build_object('label', case when coalesce((leaders.variety ->> 'session_count')::integer, 0) >= 5 then 'Moderate' else 'Growing' end,
          'percent', case when coalesce((leaders.variety ->> 'session_count')::integer, 0) >= 5 then 62 else 38 end),
        'community', timezone('utc', now()))) else '[]'::jsonb end)
      || (case when leaders.source is not null then jsonb_build_array(public.get_gie_phase2c_recommendation_v1(
        'community-source-leader', 'Community source evidence',
        coalesce(leaders.source ->> 'label', 'The leading source') || ' currently has the strongest approved public performance signal.',
        coalesce((leaders.source ->> 'snapshot_count')::integer, 0),
        jsonb_build_object('label', case when coalesce((leaders.source ->> 'session_count')::integer, 0) >= 5 then 'Moderate' else 'Growing' end,
          'percent', case when coalesce((leaders.source ->> 'session_count')::integer, 0) >= 5 then 62 else 38 end),
        'community', timezone('utc', now()))) else '[]'::jsonb end),
    'recommendation_contexts', jsonb_build_array('community_grow', 'analytics')
  ) from leaders;
$$;

revoke all on function public.get_gie_phase2c_community_enrichment_v1() from public, anon, authenticated;

create or replace function public.get_gie_phase2c_owner_enrichment_v1(p_owner_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  base jsonb := public.get_gie_owner_phase2_analytics_v1(p_owner_id);
  analytics jsonb := base -> 'analytics';
  completed integer := coalesce((analytics ->> 'completed_sessions')::integer, 0);
  active integer := coalesce((analytics ->> 'active_sessions')::integer, 0);
  favorite jsonb := analytics -> 'rankings' -> 'methods' -> 0;
  generated timestamptz := coalesce((base ->> 'generated_at')::timestamptz, timezone('utc', now()));
  recommendations jsonb;
  contexts jsonb := '[]'::jsonb;
begin
  if completed = 0 then contexts := contexts || '"new_user"'::jsonb || '"no_sessions"'::jsonb; end if;
  if active > 0 then contexts := contexts || '"active_session"'::jsonb; end if;
  contexts := contexts || '"first_snapshot"'::jsonb || '"analytics"'::jsonb;
  recommendations := jsonb_build_array(
    case when favorite is not null then public.get_gie_phase2c_recommendation_v1(
      'owner-method-leader', 'Your strongest recorded method',
      coalesce(favorite ->> 'name', 'Your leading method') || ' has your strongest completed-session signal. Treat this as planning evidence, not certainty.',
      coalesce((favorite ->> 'session_count')::integer, completed),
      coalesce(favorite -> 'confidence', analytics -> 'confidence'), 'owner', generated)
    else public.get_gie_phase2c_recommendation_v1(
      'owner-more-evidence', 'Build personal evidence',
      'Complete an eligible session to unlock personal method, source, and variety recommendations.',
      0, jsonb_build_object('label', 'Insufficient evidence', 'percent', 0), 'owner', generated) end
  );
  return jsonb_build_object('recommendations', recommendations, 'recommendation_contexts', contexts);
end;
$$;

revoke all on function public.get_gie_phase2c_owner_enrichment_v1(uuid) from public, anon, authenticated;

create or replace function public.get_gie_phase2c_global_admin_v1()
returns jsonb language sql stable security definer set search_path = public
as $$
  with rows as (
    select case when seed_age_years is null then 'unknown' when seed_age_years <= 1 then 'fresh_to_1_year' when seed_age_years <= 2 then '1_to_2_years' else '3_plus_years' end as key,
      count(distinct evidence_id)::integer as completed_session_count,
      sum(seed_count)::integer as total_seeds, sum(germinated_count)::integer as total_planted,
      round(sum(germinated_count)::numeric * 100 / nullif(sum(seed_count), 0), 1) as germination_rate
    from public.get_gie_scoped_result_rows_v1('global', null) group by 1
  ), labeled as (
    select *, case key when 'fresh_to_1_year' then 'Fresh to 1 year' when '1_to_2_years' then '1 to 2 years' when '3_plus_years' then '3+ years' else 'Unknown age' end as label
    from rows
  ), totals as (
    select coalesce(sum(seed_count),0)::integer as total_seeds, coalesce(sum(germinated_count),0)::integer as total_planted,
      count(distinct evidence_id)::integer as completed_session_count
    from public.get_gie_scoped_result_rows_v1('global', null)
  )
  select jsonb_build_object(
    'rows', coalesce((select jsonb_agg(to_jsonb(labeled) order by key) from labeled), '[]'::jsonb),
    'totals', jsonb_build_object('total_seeds', totals.total_seeds, 'total_planted', totals.total_planted,
      'represented_completed_sessions', totals.completed_session_count,
      'overall_rate', case when totals.total_seeds > 0 then round(totals.total_planted::numeric * 100 / totals.total_seeds, 1) else null end),
    'best_performing_group', (select to_jsonb(labeled) from labeled where total_seeds > 0 order by germination_rate desc nulls last, total_seeds desc limit 1),
    'lowest_performing_group', (select to_jsonb(labeled) from labeled where total_seeds > 0 order by germination_rate asc nulls last, total_seeds desc limit 1),
    'source', 'global_analytics'
  ) from totals;
$$;

revoke all on function public.get_gie_phase2c_global_admin_v1() from public, anon, authenticated;

do $$
begin
  if to_regprocedure('public.get_gie_global_analytics_phase1_v1()') is null then
    alter function public.get_gie_global_analytics() rename to get_gie_global_analytics_phase1_v1;
  end if;
  if to_regprocedure('public.get_gie_community_analytics_phase2b_v1()') is null then
    alter function public.get_gie_community_analytics() rename to get_gie_community_analytics_phase2b_v1;
  end if;
  if to_regprocedure('public.get_gie_contract_diagnostics_phase2b_v1()') is null then
    alter function public.get_gie_contract_diagnostics() rename to get_gie_contract_diagnostics_phase2b_v1;
  end if;
end;
$$;

revoke all on function public.get_gie_global_analytics_phase1_v1() from public, anon, authenticated;
revoke all on function public.get_gie_community_analytics_phase2b_v1() from public, anon, authenticated;
revoke all on function public.get_gie_contract_diagnostics_phase2b_v1() from public, anon, authenticated, service_role;

create or replace function public.get_gie_global_analytics()
returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare
  base jsonb := public.get_gie_global_analytics_phase1_v1();
  analytics jsonb := base -> 'analytics';
  generated timestamptz := coalesce((base ->> 'generated_at')::timestamptz, timezone('utc', now()));
  seeds integer := coalesce((analytics ->> 'total_seeds_tested')::integer, 0);
begin
  return base || jsonb_build_object('schema_version', '2026-07-13.7', 'analytics', analytics || jsonb_build_object(
    'recommendations', jsonb_build_array(public.get_gie_phase2c_recommendation_v1(
      'global-baseline', 'Platform evidence baseline',
      case when seeds > 0 then 'Use aggregate Grow evidence as a baseline and compare it with scoped Owner or Community evidence before planning.' else 'More eligible completed sessions are required for a global evidence baseline.' end,
      seeds, jsonb_build_object('label', coalesce(analytics ->> 'community_confidence', 'Insufficient evidence'), 'percent', coalesce((analytics ->> 'community_confidence_percent')::numeric, 0)),
      'global', generated)),
    'recommendation_contexts', jsonb_build_array('analytics'),
    'admin_seed_age_analytics', public.get_gie_phase2c_global_admin_v1()
  ));
end;
$$;

create or replace function public.get_gie_community_analytics()
returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare base jsonb := public.get_gie_community_analytics_phase2b_v1();
begin
  return base || jsonb_build_object('schema_version', '2026-07-13.7',
    'analytics', (base -> 'analytics') || public.get_gie_phase2c_community_enrichment_v1());
end;
$$;

create or replace function public.get_gie_my_analytics()
returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare requester_id uuid := auth.uid(); base jsonb;
begin
  if requester_id is null then raise exception 'Authentication required for owner analytics' using errcode = '42501'; end if;
  base := public.get_gie_owner_phase2_analytics_v1(requester_id);
  return base || jsonb_build_object('schema_version', '2026-07-13.7',
    'analytics', (base -> 'analytics') || public.get_gie_phase2c_owner_enrichment_v1(requester_id));
end;
$$;

create or replace function public.get_gie_admin_owner_analytics(target_user_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare requester_id uuid := auth.uid(); base jsonb;
begin
  if requester_id is null or not exists (select 1 from public.admin_users where user_id = requester_id) then
    raise exception 'Admin access required for cross-owner analytics' using errcode = '42501';
  end if;
  if target_user_id is null then raise exception 'Target owner is required' using errcode = '22023'; end if;
  base := public.get_gie_owner_phase2_analytics_v1(target_user_id);
  return base || jsonb_build_object('schema_version', '2026-07-13.7', 'authorization_status', 'authorized_admin',
    'analytics', (base -> 'analytics') || public.get_gie_phase2c_owner_enrichment_v1(target_user_id));
end;
$$;

create or replace function public.get_gie_contract_diagnostics()
returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare diagnostics jsonb;
begin
  if not exists (select 1 from public.admin_users where user_id = auth.uid())
    and coalesce(auth.role(), '') <> 'service_role' and session_user not in ('postgres', 'service_role') then
    raise exception 'Admin or service-role access is required' using errcode = '42501';
  end if;
  diagnostics := public.get_gie_contract_diagnostics_phase2b_v1();
  return diagnostics || jsonb_build_object('group_c_adoption', jsonb_build_object(
    'status', 'Migrated', 'adoption_percentage', 100, 'remaining_legacy_consumers', '[]'::jsonb,
    'compatibility_wrappers', jsonb_build_array('get_grow_intelligence_engine_analytics() — calculation-free Global delegate'),
    'consumers', jsonb_build_object(
      'grow_network', jsonb_build_array('Community', 'Owner'), 'admin_grow_analytics', jsonb_build_array('Global', 'Community', 'Admin Owner'),
      'recommendations', jsonb_build_array('Global', 'Owner', 'Community'), 'ai_integration', jsonb_build_array('Global', 'Owner', 'Community')),
    'version_parity', jsonb_build_object('engine_version', 'gie.v1', 'schema_version', '2026-07-13.7', 'data_quality_version', 'gie-dq.v1'),
    'ai_context_adapter', 'available', 'recommendation_contract', 'available'));
end;
$$;

revoke all on function public.get_gie_global_analytics() from public;
grant execute on function public.get_gie_global_analytics() to anon, authenticated;
revoke all on function public.get_gie_community_analytics() from public;
grant execute on function public.get_gie_community_analytics() to anon, authenticated;
revoke all on function public.get_gie_my_analytics() from public, anon;
grant execute on function public.get_gie_my_analytics() to authenticated;
revoke all on function public.get_gie_admin_owner_analytics(uuid) from public, anon;
grant execute on function public.get_gie_admin_owner_analytics(uuid) to authenticated;
revoke all on function public.get_gie_contract_diagnostics() from public, anon;
grant execute on function public.get_gie_contract_diagnostics() to authenticated, service_role;

comment on function public.get_gie_global_analytics() is 'Canonical gie-global.v1 Phase 2C contract; schema 2026-07-13.7.';
comment on function public.get_gie_community_analytics() is 'Canonical gie-community.v1 Phase 2C contract; approved published evidence only; schema 2026-07-13.7.';
comment on function public.get_gie_my_analytics() is 'Canonical authenticated gie-owner.v1 Phase 2C contract; auth.uid() identity only; schema 2026-07-13.7.';
comment on function public.get_gie_contract_diagnostics() is 'Admin/service-role diagnostics for final 100 percent GIE consumer adoption.';

notify pgrst, 'reload schema';
