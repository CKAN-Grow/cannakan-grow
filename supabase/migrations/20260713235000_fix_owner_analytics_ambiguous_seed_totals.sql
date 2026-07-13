-- Fix the Owner Analytics refresh invoked after a Seed Vault save.
-- Forward-only and data-preserving: only the existing function body is replaced.

do $migration$
declare
  target_function regprocedure := to_regprocedure('public.get_gie_owner_phase2_analytics_v1(uuid)');
  function_definition text;
  original_definition text;
begin
  if target_function is null then
    raise exception 'Required function public.get_gie_owner_phase2_analytics_v1(uuid) was not found';
  end if;

  select pg_get_functiondef(target_function::oid)
  into function_definition;
  original_definition := function_definition;

  -- This CTE is parsed in a PL/pgSQL function that also declares variables named
  -- seeds_tested and seeds_germinated. Qualify the intended history columns.
  function_definition := replace(
    function_definition,
    'sum(seeds_tested)::integer as seeds_tested,
      sum(seeds_germinated)::integer as seeds_germinated,
      case when sum(seeds_tested) > 0 then round(sum(seeds_germinated)::numeric * 100 / sum(seeds_tested))::integer else 0 end as germination_rate',
    'sum(history.seeds_tested)::integer as seeds_tested,
      sum(history.seeds_germinated)::integer as seeds_germinated,
      case when sum(history.seeds_tested) > 0 then round(sum(history.seeds_germinated)::numeric * 100 / sum(history.seeds_tested))::integer else 0 end as germination_rate'
  );

  -- Qualify the history row selected into the session-history JSON aggregate.
  function_definition := replace(
    function_definition,
    '''id'', id,
      ''label'', label,
      ''completed_at'', completed_at,
      ''method'', method,
      ''seeds_tested'', seeds_tested,
      ''seeds_germinated'', seeds_germinated,
      ''germination_rate'', germination_rate,
      ''duration_ms'', duration_ms
    ) order by completed_at desc nulls last), ''[]''::jsonb),
    round(avg(germination_rate), 1),
    max(germination_rate),
    round(avg(duration_ms))::bigint
  into session_history, average_session_germination_rate, best_germination_rate, average_session_duration_ms
  from history;',
    '''id'', history.id,
      ''label'', history.label,
      ''completed_at'', history.completed_at,
      ''method'', history.method,
      ''seeds_tested'', history.seeds_tested,
      ''seeds_germinated'', history.seeds_germinated,
      ''germination_rate'', history.germination_rate,
      ''duration_ms'', history.duration_ms
    ) order by history.completed_at desc nulls last), ''[]''::jsonb),
    round(avg(history.germination_rate), 1),
    max(history.germination_rate),
    round(avg(history.duration_ms))::bigint
  into session_history, average_session_germination_rate, best_germination_rate, average_session_duration_ms
  from history;'
  );

  -- The monthly CTE exposes names that also exist as PL/pgSQL variables.
  function_definition := replace(
    function_definition,
    '''key'', key,
    ''label'', label,
    ''completed_sessions'', completed_sessions,
    ''seeds_tested'', seeds_tested,
    ''seeds_germinated'', seeds_germinated,
    ''germination_rate'', case when seeds_tested > 0 then round(seeds_germinated::numeric * 100 / seeds_tested)::integer else 0 end
  ) order by key), ''[]''::jsonb)
  into monthly_trends
  from monthly;',
    '''key'', monthly.key,
    ''label'', monthly.label,
    ''completed_sessions'', monthly.completed_sessions,
    ''seeds_tested'', monthly.seeds_tested,
    ''seeds_germinated'', monthly.seeds_germinated,
    ''germination_rate'', case when monthly.seeds_tested > 0 then round(monthly.seeds_germinated::numeric * 100 / monthly.seeds_tested)::integer else 0 end
  ) order by monthly.key), ''[]''::jsonb)
  into monthly_trends
  from monthly;'
  );

  if function_definition = original_definition then
    if position('sum(history.seeds_tested)' in function_definition) > 0
      and position('''seeds_tested'', history.seeds_tested' in function_definition) > 0
      and position('''seeds_tested'', monthly.seeds_tested' in function_definition) > 0 then
      return;
    end if;
    raise exception 'Owner Analytics function did not match the expected definition; no change was applied';
  end if;

  if position('sum(seeds_tested)' in function_definition) > 0
    or position('sum(seeds_germinated)' in function_definition) > 0
    or position('''completed_sessions'', completed_sessions' in function_definition) > 0
    or position('''seeds_tested'', seeds_tested' in function_definition) > 0
    or position('''seeds_germinated'', seeds_germinated' in function_definition) > 0 then
    raise exception 'Unqualified Owner Analytics aggregate references remain; no change was applied';
  end if;

  execute function_definition;
end;
$migration$;

comment on function public.get_gie_owner_phase2_analytics_v1(uuid) is
  'Canonical Phase 2 Owner Analytics enrichment. CTE aggregate references are qualified to avoid PL/pgSQL variable conflicts.';

-- The function signature and REST contract are unchanged, so a PostgREST schema
-- cache reload is intentionally unnecessary.
