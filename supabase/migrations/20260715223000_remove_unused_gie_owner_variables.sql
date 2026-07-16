-- Behavior-neutral lint cleanup. These two PL/pgSQL variables have never been
-- read; identically named CTE columns remain fully qualified and unchanged.

do $migration$
declare
  target_function regprocedure := to_regprocedure('public.get_gie_owner_phase2_analytics_v1(uuid)');
  function_definition text;
  original_definition text;
begin
  if target_function is null then
    raise exception 'Required function public.get_gie_owner_phase2_analytics_v1(uuid) was not found';
  end if;
  select pg_get_functiondef(target_function::oid) into function_definition;
  original_definition := function_definition;
  function_definition := replace(
    function_definition,
    E'  seeds_tested integer := coalesce((owner_analytics ->> ''seeds_tested'')::integer, 0);\n  seeds_germinated integer := coalesce((owner_analytics ->> ''seeds_germinated'')::integer, 0);\n',
    ''
  );
  if function_definition = original_definition then
    raise exception 'Owner Analytics function did not match the reviewed unused-variable declarations; no change was applied';
  end if;
  if position('sum(history.seeds_tested)' in function_definition) = 0
    or position('''seeds_tested'', monthly.seeds_tested' in function_definition) = 0 then
    raise exception 'Canonical qualified GIE calculations were not preserved';
  end if;
  execute function_definition;
end;
$migration$;

comment on function public.get_gie_owner_phase2_analytics_v1(uuid) is
  'Canonical Phase 2 Owner Analytics enrichment. Unused local seed-total variables removed; calculations and contract are unchanged.';
