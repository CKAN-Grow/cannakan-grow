import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { runLocalSql } from "./local-demo/db.mjs";
import { DEMO_OWNER_EMAIL, DEMO_OWNER_PASSWORD, REPOSITORY_ROOT } from "./local-demo/config.mjs";
import { verifyApprovedSecurityFingerprint } from "./security/security-fingerprint.mjs";

const runNpx = (command) => {
  const isWindows = process.platform === "win32";
  const shell = isWindows ? (process.env.ComSpec || "C:\\Windows\\System32\\cmd.exe") : "/bin/sh";
  const shellArgs = isWindows ? ["/d", "/s", "/c", command] : ["-c", command];
  const result = spawnSync(shell, shellArgs, {
    cwd: REPOSITORY_ROOT,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    windowsHide: true,
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `${command} failed`);
  return result.stdout;
};

const statusEnv = Object.fromEntries(
  runNpx("npx supabase status -o env")
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Z0-9_]+)=(?:"(.*)"|(.*))$/))
    .filter(Boolean)
    .map((match) => [match[1], match[2] ?? match[3] ?? ""]),
);

const apiUrl = statusEnv.API_URL || "http://127.0.0.1:54321";
const anonKey = statusEnv.ANON_KEY;
const serviceRoleKey = statusEnv.SERVICE_ROLE_KEY;
assert.match(apiUrl, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/, "Security regression must target local Supabase.");
assert.ok(anonKey, "Local Supabase ANON_KEY was not reported.");
assert.ok(serviceRoleKey, "Local Supabase SERVICE_ROLE_KEY was not reported.");

verifyApprovedSecurityFingerprint();

runLocalSql(String.raw`
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'grow_sessions', 'admin_reports', 'admin_users', 'sources',
    'grow_gallery_snapshots', 'grow_gallery_snapshot_likes', 'grow_follows',
    'community_activity', 'site_analytics_events', 'user_notification_preferences',
    'user_filter_paper_supply_settings', 'user_push_subscriptions',
    'push_notification_deliveries', 'grow_session_reminder_events',
    'seed_vault_entries', 'seed_vault_collections', 'seed_vault_entry_collections',
    'seed_vault_tags', 'seed_vault_entry_tags', 'seed_vault_grow_notes',
    'seed_vault_share_settings', 'seed_vault_share_users', 'public_member_profiles',
    'source_directory', 'variety_directory', 'recognition_definitions',
    'user_recognitions', 'founders', 'contact_messages', 'cstp_requests',
    'cstp_tests', 'cstp_test_sessions', 'cstp_admin_events', 'cstp_reports',
    'cstp_report_snapshots', 'cstp_report_metrics', 'cstp_report_sessions',
    'cstp_report_audit_links'
  ] loop
    if not exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = table_name and c.relrowsecurity
    ) then
      raise exception 'RLS is not enabled on public.%', table_name;
    end if;
  end loop;

  if has_table_privilege('anon', 'public.profiles', 'select')
     or has_table_privilege('anon', 'public.grow_sessions', 'select')
     or has_table_privilege('anon', 'public.public_member_profiles', 'select') then
    raise exception 'Anonymous role can read a private owner table';
  end if;

  if not has_table_privilege('authenticated', 'public.profiles', 'select,insert,update,delete')
     or not has_table_privilege('authenticated', 'public.grow_sessions', 'select,insert,update,delete')
     or not has_table_privilege('authenticated', 'public.seed_vault_entries', 'select,insert,update,delete') then
    raise exception 'Authenticated owner CRUD grants are incomplete';
  end if;

  if has_table_privilege('anon', 'public.grow_gallery_snapshot_likes', 'insert')
     or not has_table_privilege('anon', 'public.grow_gallery_snapshot_likes', 'select')
     or not has_table_privilege('authenticated', 'public.grow_gallery_snapshot_likes', 'select,insert,delete') then
    raise exception 'Gallery-like privilege boundary is incorrect';
  end if;

  if has_table_privilege('authenticated', 'public.community_activity', 'insert')
     or not has_table_privilege('authenticated', 'public.community_activity', 'select') then
    raise exception 'Community activity must be REST read-only';
  end if;

  if has_table_privilege('anon', 'public.site_analytics_events', 'select')
     or not has_table_privilege('anon', 'public.site_analytics_events', 'insert') then
    raise exception 'Site analytics public write/admin read boundary is incorrect';
  end if;

  if not has_table_privilege('anon', 'public.contact_messages', 'insert')
     or has_table_privilege('anon', 'public.contact_messages', 'select,update,delete')
     or not has_table_privilege('authenticated', 'public.contact_messages', 'select,insert,update,delete') then
    raise exception 'Contact submission/admin inbox privilege boundary is incorrect';
  end if;

  if has_table_privilege('anon', 'public.cstp_requests', 'select')
     or has_table_privilege('authenticated', 'public.cstp_requests', 'select')
     or not has_table_privilege('service_role', 'public.cstp_requests', 'select,insert,update,delete')
     or has_table_privilege('service_role', 'public.cstp_requests', 'truncate,references,trigger') then
    raise exception 'CSTP server-only boundary is incorrect';
  end if;

  if not has_table_privilege('service_role', 'public.grow_sessions', 'select,update')
     or has_table_privilege('service_role', 'public.grow_sessions', 'insert,delete,truncate,references,trigger') then
    raise exception 'Reminder worker session privileges are broader than required';
  end if;

  if has_table_privilege('service_role', 'public.profiles', 'select,insert,update,delete')
     or has_table_privilege('service_role', 'public.grow_gallery_snapshots', 'select,insert,update,delete') then
    raise exception 'Service role retained unneeded direct browser-table access';
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and policyname in (
      'Allow public read sources', 'Allow insert gallery likes', 'Allow read gallery likes',
      'Allow read for authenticated', 'Visible public profiles can be read'
    )
  ) then
    raise exception 'A superseded permissive policy still exists';
  end if;

  if not exists (select 1 from storage.buckets where id = 'session-images' and public = false)
     or not exists (select 1 from storage.buckets where id = 'profile-avatars' and public = false)
     or not exists (select 1 from storage.buckets where id = 'grow-gallery' and public = true)
     or not exists (select 1 from storage.buckets where id = 'source-logos' and public = true)
     or not exists (select 1 from storage.buckets where id = 'announcements' and public = true) then
    raise exception 'Storage bucket security configuration is incomplete';
  end if;

  if has_function_privilege('anon', 'public.admin_moderate_grow_gallery_snapshot(uuid,text)', 'execute')
     or has_function_privilege('anon', 'public.admin_delete_grow_gallery_snapshot(uuid)', 'execute')
     or has_function_privilege('authenticated', 'public.admin_execute_community_grow_publication_reset()', 'execute') then
    raise exception 'Administrative function exposure is too broad';
  end if;

  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
      and not exists (
        select 1 from unnest(coalesce(p.proconfig, '{}'::text[])) setting
        where setting like 'search_path=%'
      )
  ) then
    raise exception 'A public security-definer function has no fixed search_path';
  end if;

  if (
    select array_agg(p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' order by p.proname, pg_get_function_identity_arguments(p.oid))
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute')
  ) is distinct from array[
    'current_user_is_admin()',
    'get_explorer_completed_session_aggregates()',
    'get_gie_community_analytics()',
    'get_gie_community_gallery_evidence()',
    'get_gie_global_analytics()',
    'get_grow_intelligence_engine_analytics()',
    'get_public_identity_and_recognition(p_user_id uuid)',
    'get_public_member_follow_members(target_user_id uuid, relationship_type text)',
    'get_shared_seed_vault(vault_slug text)'
  ]::text[] then
    raise exception 'Anonymous function execution differs from the reviewed public RPC allow-list';
  end if;

  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    cross join (values ('anon'), ('authenticated'), ('service_role')) roles(role_name)
    where n.nspname = 'public'
      and c.relkind in ('r', 'p', 'v', 'm')
      and (
        has_table_privilege(roles.role_name, c.oid, 'truncate')
        or has_table_privilege(roles.role_name, c.oid, 'references')
        or has_table_privilege(roles.role_name, c.oid, 'trigger')
      )
  ) then
    raise exception 'An application role retained TRUNCATE, REFERENCES, or TRIGGER privilege';
  end if;
end
$$;

-- RLS behavior checks use two fictional demo identities and roll back every write.
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"d3a00000-0000-4100-8100-000000000001","email":"founder.demo@example.test","role":"authenticated"}', true);

do $$
begin
  if (select count(*) from public.profiles) <> 1 then
    raise exception 'Profile owner isolation failed';
  end if;
  if exists (
    select 1 from public.grow_sessions
    where user_id = 'd3a00000-0000-4100-8100-000000000002'::uuid
  ) then
    raise exception 'Cross-user session read leaked';
  end if;
  if exists (
    select 1 from public.seed_vault_entries
    where user_id <> 'd3a00000-0000-4100-8100-000000000001'::uuid
  ) then
    raise exception 'Cross-user Vault read leaked';
  end if;
end
$$;
rollback;
`, { quiet: true });

const request = async (path, { token = anonKey, method = "GET", body } = {}) => {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const responseBody = await response.text();
  return { status: response.status, body: responseBody };
};

const authResponse = await request("/auth/v1/token?grant_type=password", {
  method: "POST",
  body: { email: DEMO_OWNER_EMAIL, password: DEMO_OWNER_PASSWORD },
});
assert.equal(authResponse.status, 200, `Demo owner authentication failed: ${authResponse.body}`);
const accessToken = JSON.parse(authResponse.body).access_token;

for (const table of [
  "profiles", "grow_sessions", "sources", "grow_gallery_snapshots",
  "grow_gallery_snapshot_likes", "grow_follows", "community_activity",
  "user_notification_preferences", "user_filter_paper_supply_settings",
  "user_push_subscriptions", "push_notification_deliveries", "seed_vault_entries",
  "public_member_profiles", "safe_public_member_profiles", "source_directory",
  "variety_directory", "recognition_definitions", "user_recognitions", "founders",
]) {
  const response = await request(`/rest/v1/${table}?select=*&limit=1`, { token: accessToken });
  assert.equal(response.status, 200, `${table} authenticated REST read failed: ${response.body}`);
}

for (const table of ["sources", "grow_gallery_snapshots", "grow_gallery_snapshot_likes", "community_activity", "safe_public_member_profiles"]) {
  const response = await request(`/rest/v1/${table}?select=*&limit=1`);
  assert.equal(response.status, 200, `${table} anonymous REST read failed: ${response.body}`);
}

for (const table of ["profiles", "grow_sessions", "public_member_profiles", "cstp_requests"]) {
  const response = await request(`/rest/v1/${table}?select=*&limit=1`);
  assert.ok([401, 403].includes(response.status), `${table} unexpectedly allowed anonymous REST read (${response.status}).`);
}

for (const table of ["cstp_requests", "cstp_tests", "grow_session_reminder_events", "grow_sessions", "sources", "admin_users"]) {
  const response = await request(`/rest/v1/${table}?select=*&limit=1`, { token: serviceRoleKey });
  assert.equal(response.status, 200, `${table} service-role REST read failed: ${response.body}`);
}

for (const table of ["profiles", "grow_gallery_snapshots", "public_member_profiles"]) {
  const response = await request(`/rest/v1/${table}?select=*&limit=1`, { token: serviceRoleKey });
  assert.equal(response.status, 403, `${table} unexpectedly allowed unaudited direct service-role access (${response.status}).`);
}

const otherProfile = await request(
  "/rest/v1/profiles?id=eq.d3a00000-0000-4100-8100-000000000002&select=id",
  { token: accessToken },
);
assert.equal(otherProfile.status, 200);
assert.deepEqual(JSON.parse(otherProfile.body), [], "Private profile isolation leaked another user.");

for (const rpc of ["get_gie_global_analytics", "get_gie_community_analytics"]) {
  const response = await request(`/rest/v1/rpc/${rpc}`, { method: "POST", body: {} });
  assert.equal(response.status, 200, `${rpc} anonymous canonical RPC failed: ${response.body}`);
}

const ownerRpc = await request("/rest/v1/rpc/get_gie_my_analytics", { token: accessToken, method: "POST", body: {} });
assert.equal(ownerRpc.status, 200, `Owner GIE RPC failed: ${ownerRpc.body}`);

const anonymousAdminRpc = await request("/rest/v1/rpc/admin_delete_grow_gallery_snapshot", {
  method: "POST",
  body: { p_snapshot_id: "d3a00000-0000-4000-8000-000000000001" },
});
assert.ok([401, 403, 404].includes(anonymousAdminRpc.status), "Anonymous caller reached an admin RPC.");

const source = await import("node:fs").then(({ readFileSync }) => readFileSync(new URL("../app.js", import.meta.url), "utf8"));
assert.match(
  source,
  /const DEVELOPER_SCENARIO_WRITE_MESSAGE = "Preview Studio data is preview-only and cannot be saved or published\.";/,
  "Preview Studio must retain its canonical preview-only write and publication guard.",
);
assert.ok(!/supabase[^\n]{0,120}(?:DEV_SEED_VAULT|developer preview fixture)/i.test(source), "Developer Preview fixtures must not be written to Supabase.");

console.log("Security access regression passed: REST, RPC, RLS, Storage, service-role, and cross-user boundaries verified.");
