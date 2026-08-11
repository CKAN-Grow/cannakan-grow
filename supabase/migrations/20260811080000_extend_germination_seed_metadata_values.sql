begin;

do $migration$
declare
  current_definition text;
  updated_definition text;
  old_type_allowlist constant text := 'if seed_type not in (''unknown'', ''photoperiod'', ''autoflower'')';
  new_type_allowlist constant text := 'if seed_type not in (''unknown'', ''not_applicable'', ''photoperiod'', ''autoflower'', ''fast_flower'')';
  old_sex_allowlist constant text := 'or seed_sex not in (''unknown'', ''feminized'', ''regular'')';
  new_sex_allowlist constant text := 'or seed_sex not in (''unknown'', ''not_applicable'', ''feminized'', ''regular'')';
begin
  select pg_get_functiondef('public.save_germination_setup_v1(uuid, uuid, bigint, jsonb)'::regprocedure)
  into current_definition;

  if position(old_type_allowlist in current_definition) = 0
    or position(old_sex_allowlist in current_definition) = 0 then
    raise exception 'The Germination Setup metadata allowlist contract does not match the expected predecessor.';
  end if;

  updated_definition := replace(current_definition, old_type_allowlist, new_type_allowlist);
  updated_definition := replace(updated_definition, old_sex_allowlist, new_sex_allowlist);

  if updated_definition = current_definition then
    raise exception 'The Germination Setup metadata allowlist contract was not changed.';
  end if;

  execute updated_definition;
end;
$migration$;

notify pgrst, 'reload schema';

commit;
