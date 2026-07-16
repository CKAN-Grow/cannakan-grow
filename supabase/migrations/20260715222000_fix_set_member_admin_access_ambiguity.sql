-- Qualify the admin-user upsert with its named unique constraint. The function
-- signature, authorization, result shape, and side effects remain unchanged.

do $migration$
declare
  target_function regprocedure := to_regprocedure('public.set_member_admin_access(uuid,boolean)');
  function_definition text;
  original_definition text;
begin
  if target_function is null then
    raise exception 'Required function public.set_member_admin_access(uuid,boolean) was not found';
  end if;
  select pg_get_functiondef(target_function::oid) into function_definition;
  original_definition := function_definition;
  function_definition := replace(
    function_definition,
    'on conflict (user_id) do update',
    'on conflict on constraint admin_users_user_id_key do update'
  );
  if function_definition = original_definition then
    raise exception 'set_member_admin_access did not match the reviewed definition; no change was applied';
  end if;
  execute function_definition;
end;
$migration$;

comment on function public.set_member_admin_access(uuid,boolean) is
  'Admin-only member role management. Uses the named admin_users unique constraint to avoid PL/pgSQL output-column ambiguity.';
