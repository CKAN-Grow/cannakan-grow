-- Align founder/admin grow-session cleanup confirmation with the session
-- delete modal. This keeps the existing protected cleanup function scope:
-- grow-session data only, CSTP/auth/admin/settings/config untouched.

do $$
declare
  function_definition text := '';
begin
  if to_regprocedure('public.cleanup_founder_test_grow_sessions(uuid,uuid[],boolean,text,boolean,text,timestamptz)') is null then
    return;
  end if;

  select pg_get_functiondef(
    'public.cleanup_founder_test_grow_sessions(uuid,uuid[],boolean,text,boolean,text,timestamptz)'::regprocedure
  )
  into function_definition;

  execute replace(
    function_definition,
    'DELETE OLD FOUNDER TEST SESSIONS',
    'DELETE TEST SESSION'
  );
end $$;
