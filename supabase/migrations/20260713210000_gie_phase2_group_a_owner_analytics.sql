-- GIE Phase 2, Group A Owner Analytics adoption.
-- Additive contract enrichment only: lifecycle, eligibility, normalization,
-- Global Analytics, Community Analytics, and operational data are unchanged.

create or replace function public.get_gie_owner_phase2_analytics_v1(target_owner_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  owner_contract jsonb := public.get_gie_owner_analytics(target_owner_id);
  owner_analytics jsonb := coalesce(owner_contract -> 'analytics', '{}'::jsonb);
  completed_sessions integer := coalesce((owner_analytics ->> 'completed_sessions')::integer, 0);
  active_sessions integer := coalesce((owner_analytics ->> 'active_sessions')::integer, 0);
  seeds_tested integer := coalesce((owner_analytics ->> 'seeds_tested')::integer, 0);
  seeds_germinated integer := coalesce((owner_analytics ->> 'seeds_germinated')::integer, 0);
  session_history jsonb := '[]'::jsonb;
  monthly_trends jsonb := '[]'::jsonb;
  leading_session jsonb := null;
  average_session_germination_rate numeric := null;
  best_germination_rate numeric := null;
  average_session_duration_ms bigint := null;
  seed_vault jsonb := '{}'::jsonb;
  community_participation jsonb := '{}'::jsonb;
  recommendations jsonb := '[]'::jsonb;
begin
  if target_owner_id is null then
    raise exception 'Owner identity is required' using errcode = '22023';
  end if;

  with result_totals as (
    select
      evidence_id::uuid as session_id,
      sum(seed_count)::integer as seeds_tested,
      sum(germinated_count)::integer as seeds_germinated
    from public.get_gie_scoped_result_rows_v1('owner', target_owner_id)
    where variety_key is not null
    group by evidence_id
  ),
  history as (
    select
      grow_sessions.id,
      coalesce(nullif(grow_sessions.session_name, ''), nullif(grow_sessions.custom_session_name, ''), 'Grow Session') as label,
      grow_sessions.completed_at,
      coalesce(grow_sessions.session_started_at, grow_sessions.soak_started_at, grow_sessions.created_at) as started_at,
      coalesce(nullif(grow_sessions.system_type, ''), 'Grow Session') as method,
      result_totals.seeds_tested,
      result_totals.seeds_germinated,
      case when result_totals.seeds_tested > 0 then round(result_totals.seeds_germinated::numeric * 100 / result_totals.seeds_tested)::integer else 0 end as germination_rate,
      case
        when grow_sessions.completed_at is not null
          and coalesce(grow_sessions.session_started_at, grow_sessions.soak_started_at, grow_sessions.created_at) is not null
          then greatest(0, extract(epoch from (grow_sessions.completed_at - coalesce(grow_sessions.session_started_at, grow_sessions.soak_started_at, grow_sessions.created_at))) * 1000)::bigint
        else null
      end as duration_ms
    from result_totals
    join public.grow_sessions on grow_sessions.id = result_totals.session_id
    where grow_sessions.user_id = target_owner_id
      and public.is_community_intelligence_session_eligible(grow_sessions.id)
  ),
  monthly as (
    select
      to_char(date_trunc('month', completed_at), 'YYYY-MM') as key,
      to_char(date_trunc('month', completed_at), 'Mon YYYY') as label,
      count(*)::integer as completed_sessions,
      sum(seeds_tested)::integer as seeds_tested,
      sum(seeds_germinated)::integer as seeds_germinated,
      case when sum(seeds_tested) > 0 then round(sum(seeds_germinated)::numeric * 100 / sum(seeds_tested))::integer else 0 end as germination_rate
    from history
    where completed_at is not null
    group by date_trunc('month', completed_at)
  )
  select
    coalesce(jsonb_agg(jsonb_build_object(
      'id', id,
      'label', label,
      'completed_at', completed_at,
      'method', method,
      'seeds_tested', seeds_tested,
      'seeds_germinated', seeds_germinated,
      'germination_rate', germination_rate,
      'duration_ms', duration_ms
    ) order by completed_at desc nulls last), '[]'::jsonb),
    round(avg(germination_rate), 1),
    max(germination_rate),
    round(avg(duration_ms))::bigint
  into session_history, average_session_germination_rate, best_germination_rate, average_session_duration_ms
  from history;

  select jsonb_build_object(
    'id', history_item ->> 'id',
    'label', history_item ->> 'label',
    'completed_at', history_item ->> 'completed_at',
    'method', history_item ->> 'method',
    'seeds_tested', (history_item ->> 'seeds_tested')::integer,
    'seeds_germinated', (history_item ->> 'seeds_germinated')::integer,
    'germination_rate', (history_item ->> 'germination_rate')::integer,
    'duration_ms', nullif(history_item ->> 'duration_ms', '')::bigint
  ) into leading_session
  from jsonb_array_elements(session_history) history_item
  order by
    (history_item ->> 'germination_rate')::integer desc,
    (history_item ->> 'seeds_tested')::integer desc,
    history_item ->> 'completed_at' desc
  limit 1;

  with history as (
    select value as item from jsonb_array_elements(session_history)
  ),
  monthly as (
    select
      to_char(date_trunc('month', (item ->> 'completed_at')::timestamptz), 'YYYY-MM') as key,
      to_char(date_trunc('month', (item ->> 'completed_at')::timestamptz), 'Mon YYYY') as label,
      count(*)::integer as completed_sessions,
      sum((item ->> 'seeds_tested')::integer)::integer as seeds_tested,
      sum((item ->> 'seeds_germinated')::integer)::integer as seeds_germinated
    from history
    where nullif(item ->> 'completed_at', '') is not null
    group by date_trunc('month', (item ->> 'completed_at')::timestamptz)
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'key', key,
    'label', label,
    'completed_sessions', completed_sessions,
    'seeds_tested', seeds_tested,
    'seeds_germinated', seeds_germinated,
    'germination_rate', case when seeds_tested > 0 then round(seeds_germinated::numeric * 100 / seeds_tested)::integer else 0 end
  ) order by key), '[]'::jsonb)
  into monthly_trends
  from monthly;

  with vault_entries as (
    select
      seed_vault_entries.*,
      greatest(0, coalesce(remaining_count, quantity, seed_count, 0))::integer as available_quantity,
      coalesce(
        seed_age_years,
        case when year_acquired between 1900 and extract(year from current_date)::integer
          then extract(year from current_date)::numeric - year_acquired::numeric
          else null
        end
      ) as effective_age_years,
      coalesce(nullif(seed_name, ''), nullif(seed_variety, ''), 'Unknown Variety') as variety_label,
      coalesce(nullif(source, ''), 'Unknown Source') as source_label
    from public.seed_vault_entries
    where user_id = target_owner_id
      and coalesce(is_deleted, false) = false
      and coalesce(is_mock, false) = false
      and coalesce(dev_mode_only, false) = false
  ),
  active_entries as (
    select * from vault_entries where coalesce(is_archived, false) = false
  ),
  overview as (
    select
      coalesce(sum(available_quantity), 0)::integer as total_seeds_owned,
      count(distinct variety_label)::integer as total_varieties,
      count(distinct source_label)::integer as total_sources,
      count(*) filter (where available_quantity between 1 and 2)::integer as low_inventory_entries,
      count(*) filter (where available_quantity = 0)::integer as out_of_stock_entries,
      count(*) filter (where effective_age_years is null)::integer as unknown_age_count,
      max(effective_age_years) as oldest_seed_age,
      round(avg(effective_age_years), 1) as average_age
    from active_entries
  ),
  collection as (
    select
      count(*) filter (where available_quantity > 2 and effective_age_years is not null and effective_age_years < 5)::integer as healthy,
      count(*) filter (where available_quantity > 2 and effective_age_years >= 5)::integer as older,
      count(*) filter (where available_quantity <= 2)::integer as low,
      count(*) filter (where available_quantity > 2 and effective_age_years is null)::integer as unknown
    from active_entries
  ),
  source_rollups as (
    select source_label as label, count(*)::integer as entry_count, sum(available_quantity)::integer as quantity
    from active_entries group by source_label
  ),
  variety_rollups as (
    select variety_label as label, count(*)::integer as entry_count, sum(available_quantity)::integer as quantity
    from active_entries group by variety_label
  ),
  age_buckets as (
    select
      case when effective_age_years is null then 'unknown' when effective_age_years <= 1 then 'fresh_to_1_year' when effective_age_years <= 2 then '1_to_2_years' else '3_plus_years' end as key,
      count(*)::integer as entry_count,
      sum(available_quantity)::integer as quantity
    from active_entries group by 1
  )
  select jsonb_build_object(
    'overview', jsonb_build_object(
      'total_seeds_owned', overview.total_seeds_owned,
      'total_varieties', overview.total_varieties,
      'total_sources', overview.total_sources,
      'archived_entries', (select count(*)::integer from vault_entries where coalesce(is_archived, false) = true),
      'oldest_seed_age', overview.oldest_seed_age,
      'unknown_age_count', overview.unknown_age_count,
      'low_inventory_entries', overview.low_inventory_entries,
      'out_of_stock_entries', overview.out_of_stock_entries,
      'average_age', overview.average_age
    ),
    'collection_summary', jsonb_build_object(
      'total_seeds', overview.total_seeds_owned,
      'healthy', collection.healthy,
      'older', collection.older,
      'low', collection.low,
      'unknown', collection.unknown
    ),
    'source_rollups', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'entry_count', entry_count, 'quantity', quantity) order by quantity desc, label) from source_rollups), '[]'::jsonb),
    'variety_rollups', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'entry_count', entry_count, 'quantity', quantity) order by quantity desc, label) from variety_rollups), '[]'::jsonb),
    'age_buckets', coalesce((select jsonb_agg(jsonb_build_object('key', key, 'entry_count', entry_count, 'quantity', quantity) order by key) from age_buckets), '[]'::jsonb),
    'newest_entry', (select jsonb_build_object('id', id, 'variety', variety_label, 'source', source_label, 'created_at', created_at) from active_entries order by created_at desc limit 1)
  ) into seed_vault
  from overview cross join collection;

  select jsonb_build_object(
    'approved_public_snapshots', count(*)::integer,
    'best_germination_rate', max(greatest(0, least(100, coalesce(success_percent, 0))))
  ) into community_participation
  from public.grow_gallery_snapshots
  where user_id = target_owner_id
    and lower(coalesce(status, '')) = 'approved'
    and coalesce(is_published, false) = true
    and coalesce(analytics_excluded, false) = false;

  recommendations := jsonb_build_array(
    jsonb_build_object(
      'key', 'source-attribution',
      'label', 'Source Attribution',
      'value', coalesce(owner_analytics -> 'data_quality' ->> 'source_attribution_rate', '0') || '%',
      'detail', case when coalesce((owner_analytics -> 'data_quality' ->> 'source_attribution_rate')::numeric, 0) >= 95 then 'Source attribution is healthy.' else 'Add recognized sources to improve personal evidence quality.' end
    ),
    jsonb_build_object(
      'key', 'next-session',
      'label', 'Next Session',
      'value', case when active_sessions > 0 then active_sessions || ' active' else 'Ready' end,
      'detail', case when active_sessions > 0 then 'Continue the active session before starting another comparison.' else 'Your Owner analytics are ready for the next completed-session result.' end
    )
  );

  owner_analytics := owner_analytics || jsonb_build_object(
    'total_sessions', completed_sessions + active_sessions,
    'recorded_sessions', jsonb_array_length(session_history),
    'completion_rate', case when completed_sessions + active_sessions > 0 then round(completed_sessions::numeric * 100 / (completed_sessions + active_sessions), 1) else null end,
    'active_session_rate', case when completed_sessions + active_sessions > 0 then round(active_sessions::numeric * 100 / (completed_sessions + active_sessions), 1) else null end,
    'average_session_germination_rate', average_session_germination_rate,
    'best_germination_rate', best_germination_rate,
    'average_session_duration_ms', average_session_duration_ms,
    'favorite_method', coalesce(owner_analytics -> 'rankings' -> 'methods' -> 0 ->> 'name', ''),
    'favorite_source', coalesce(owner_analytics -> 'rankings' -> 'sources' -> 0 ->> 'name', ''),
    'favorite_variety', coalesce(owner_analytics -> 'rankings' -> 'varieties' -> 0 ->> 'name', ''),
    'leading_session', leading_session,
    'session_history', session_history,
    'monthly_trends', monthly_trends,
    'seed_vault', seed_vault,
    'community_participation', community_participation,
    'recommendations', recommendations,
    'group_a_adoption', jsonb_build_object(
      'home', 'migrated',
      'sessions', 'migrated',
      'session_analytics', 'migrated',
      'profile', 'migrated',
      'seed_vault', 'migrated'
    )
  );

  return owner_contract
    || jsonb_build_object(
      'schema_version', '2026-07-13.5',
      'generated_at', timezone('utc', now()),
      'analytics', owner_analytics
    );
end;
$$;

revoke all on function public.get_gie_owner_phase2_analytics_v1(uuid) from public;
revoke all on function public.get_gie_owner_phase2_analytics_v1(uuid) from anon;
revoke all on function public.get_gie_owner_phase2_analytics_v1(uuid) from authenticated;

create or replace function public.get_gie_my_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  requester_id uuid := auth.uid();
begin
  if requester_id is null then
    raise exception 'Authentication required for owner analytics' using errcode = '42501';
  end if;
  return public.get_gie_owner_phase2_analytics_v1(requester_id);
end;
$$;

revoke all on function public.get_gie_my_analytics() from public;
revoke all on function public.get_gie_my_analytics() from anon;
grant execute on function public.get_gie_my_analytics() to authenticated;

create or replace function public.get_gie_admin_owner_analytics(target_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  requester_id uuid := auth.uid();
begin
  if requester_id is null then
    raise exception 'Authentication required for admin owner analytics' using errcode = '42501';
  end if;
  if target_user_id is null then
    raise exception 'Target owner is required' using errcode = '22023';
  end if;
  if not exists (select 1 from public.admin_users where admin_users.user_id = requester_id) then
    raise exception 'Admin access required for cross-owner analytics' using errcode = '42501';
  end if;
  return public.get_gie_owner_phase2_analytics_v1(target_user_id)
    || jsonb_build_object('authorization_status', 'authorized_admin');
end;
$$;

revoke all on function public.get_gie_admin_owner_analytics(uuid) from public;
revoke all on function public.get_gie_admin_owner_analytics(uuid) from anon;
grant execute on function public.get_gie_admin_owner_analytics(uuid) to authenticated;

do $$
begin
  if to_regprocedure('public.get_gie_contract_diagnostics_phase1_v1()') is null
    and to_regprocedure('public.get_gie_contract_diagnostics()') is not null then
    alter function public.get_gie_contract_diagnostics()
      rename to get_gie_contract_diagnostics_phase1_v1;
  end if;
end;
$$;

revoke all on function public.get_gie_contract_diagnostics_phase1_v1() from public;
revoke all on function public.get_gie_contract_diagnostics_phase1_v1() from anon;
revoke all on function public.get_gie_contract_diagnostics_phase1_v1() from authenticated;

create or replace function public.get_gie_contract_diagnostics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  diagnostics jsonb;
  owner_contract jsonb;
begin
  if not exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
    and coalesce(auth.role(), '') <> 'service_role'
    and session_user not in ('postgres', 'service_role') then
    raise exception 'Admin or service-role access is required' using errcode = '42501';
  end if;

  diagnostics := public.get_gie_contract_diagnostics_phase1_v1();
  owner_contract := case when auth.uid() is null then null else public.get_gie_my_analytics() end;

  return diagnostics || jsonb_build_object(
    'group_a_adoption', jsonb_build_object(
      'status', 'Migrated',
      'contract', 'Owner Contract',
      'duplicated_analytics', 'None',
      'consumers', coalesce(owner_contract -> 'analytics' -> 'group_a_adoption', jsonb_build_object(
        'home', 'migrated',
        'sessions', 'migrated',
        'session_analytics', 'migrated',
        'profile', 'migrated',
        'seed_vault', 'migrated'
      )),
      'adoption_percentage', 45
    )
  );
end;
$$;

revoke all on function public.get_gie_contract_diagnostics() from public;
revoke all on function public.get_gie_contract_diagnostics() from anon;
grant execute on function public.get_gie_contract_diagnostics() to authenticated;
grant execute on function public.get_gie_contract_diagnostics() to service_role;

comment on function public.get_gie_owner_phase2_analytics_v1(uuid) is
  'Internal canonical gie-owner.v1 Group A analytics enrichment. No browser EXECUTE grants.';
comment on function public.get_gie_my_analytics() is
  'Canonical authenticated Owner Analytics contract for Phase 2 Group A. Identity derives only from auth.uid(); schema 2026-07-13.5.';
comment on function public.get_gie_contract_diagnostics() is
  'Admin/service-role GIE contract diagnostics with Phase 2 Group A adoption status.';

notify pgrst, 'reload schema';
