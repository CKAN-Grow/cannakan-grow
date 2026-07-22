import assert from "node:assert/strict";
import { runLocalSql } from "./local-demo/db.mjs";

const definitionChecks = runLocalSql(String.raw`
select jsonb_build_object(
  'record', pg_get_functiondef('public.record_community_activity(uuid,text,text,text,text,text,jsonb,text)'::regprocedure),
  'admin', pg_get_functiondef('public.set_member_admin_access(uuid,boolean)'::regprocedure),
  'owner', pg_get_functiondef('public.get_gie_owner_phase2_analytics_v1(uuid)'::regprocedure)
)::text;
`, { tuplesOnly: true, quiet: true });
const definitions = JSON.parse(definitionChecks);
assert.doesNotMatch(definitions.record, /on conflict \(user_id, activity_type/i);
assert.match(definitions.record, /pg_advisory_xact_lock/);
assert.match(definitions.record, /activity_user_id <> auth\.uid\(\)/);
assert.match(definitions.admin, /on conflict on constraint admin_users_user_id_key/i);
assert.doesNotMatch(definitions.owner, /^\s*seeds_(?:tested|germinated) integer :=/m);
assert.match(definitions.owner, /sum\(history\.seeds_tested\)/);

runLocalSql(String.raw`
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"d3a00000-0000-4100-8100-000000000001","email":"founder.demo@example.test","role":"authenticated"}', true);

do $$
declare
  first_id uuid;
  second_id uuid;
begin
  first_id := public.record_community_activity(
    'd3a00000-0000-4100-8100-000000000001', 'security_regression', '', '', 'First', '', '{}'::jsonb, 'private'
  );
  second_id := public.record_community_activity(
    'd3a00000-0000-4100-8100-000000000001', 'security_regression', '', '', 'Updated', '', '{}'::jsonb, 'private'
  );
  if first_id is null or first_id <> second_id then
    raise exception 'Community activity logical-key update did not preserve its row id';
  end if;
  if (select title from public.community_activity where id = first_id) <> 'Updated' then
    raise exception 'Community activity update side effect was not preserved';
  end if;

  begin
    perform public.record_community_activity(
      'd3a00000-0000-4100-8100-000000000002', 'security_regression', '', '', 'Forbidden', '', '{}'::jsonb, 'private'
    );
    raise exception 'Cross-user Community activity write unexpectedly succeeded';
  exception when insufficient_privilege then
    null;
  end;

end
$$;

reset role;
insert into public.admin_users (user_id, email)
values ('d3a00000-0000-4100-8100-000000000001', 'founder.demo@example.test')
on conflict on constraint admin_users_user_id_key do update set email = excluded.email;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"d3a00000-0000-4100-8100-000000000001","email":"founder.demo@example.test","role":"authenticated"}', true);

do $$
declare
  role_result_count integer;
  cleanup_result_count integer;
begin
  select count(*) into role_result_count
  from public.set_member_admin_access('d3a00000-0000-4100-8100-000000000002', true);
  if role_result_count <> 1 then
    raise exception 'Admin role update did not preserve its one-row result shape';
  end if;

  select count(*) into cleanup_result_count
  from public.cleanup_founder_test_grow_sessions(
    '{}'::uuid[], '', true, false, '2026-05-20 04:00:00+00'::timestamptz,
    'security regression dry run', 'd3a00000-0000-4100-8100-000000000001'
  );
  if cleanup_result_count = 0 then
    raise exception 'Cleanup dry-run did not return its per-table result contract';
  end if;
end
$$;
rollback;

do $$
begin
  if has_function_privilege('anon', 'public.backfill_community_activity_snapshot_posts()', 'execute')
    or has_function_privilege('authenticated', 'public.sync_gallery_snapshot_analytics_exclusion_for_session(uuid)', 'execute')
    or has_function_privilege('anon', 'public.get_direct_shared_seed_vault(uuid)', 'execute')
    or not has_function_privilege('authenticated', 'public.get_direct_shared_seed_vault(uuid)', 'execute')
    or not has_function_privilege('anon', 'public.get_shared_seed_vault(text)', 'execute') then
    raise exception 'Function privilege reconciliation does not match the reviewed caller model';
  end if;
end
$$;
`, { quiet: true });

console.log("Function hardening regression passed: ambiguity repairs, owner isolation, idempotent activity writes, GEE cleanup, and EXECUTE boundaries verified.");
