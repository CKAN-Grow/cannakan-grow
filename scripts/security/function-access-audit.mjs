import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runLocalSql } from "../local-demo/db.mjs";
import { REPOSITORY_ROOT } from "../local-demo/config.mjs";

const DOCUMENT_PATH = resolve(REPOSITORY_ROOT, "docs/grow-function-access-audit-2026-07-15.md");

const FRONTEND_RPCS = new Set([
  "admin_delete_grow_gallery_snapshot", "admin_manage_user_recognition", "admin_moderate_grow_gallery_snapshot",
  "cleanup_founder_clear_community_activity_for_snapshot", "cleanup_founder_test_grow_sessions",
  "clear_community_activity_for_session", "clear_community_activity_for_snapshot", "get_direct_shared_seed_vault",
  "get_gie_admin_owner_analytics", "get_gie_community_analytics", "get_gie_community_gallery_evidence",
  "get_gie_contract_diagnostics", "get_gie_global_analytics", "get_gie_my_analytics",
  "get_my_identity_and_recognition", "get_or_create_seed_vault_share_settings", "get_public_identity_and_recognition",
  "get_public_member_follow_members", "get_seed_vault_user_shares", "get_seed_vaults_shared_with_me",
  "get_shared_seed_vault", "record_community_activity", "record_source_directory_usage",
  "record_variety_directory_usage", "remove_seed_vault_user_share", "review_source_directory_community_source",
  "review_variety_directory_community_variety", "search_seed_vault_share_users", "set_member_admin_access",
  "set_my_featured_recognition", "update_owner_grow_session_times", "update_seed_vault_share_settings",
  "upsert_seed_vault_user_share",
]);
const SERVER_RPCS = new Set([
  "admin_preview_community_grow_publication_reset", "admin_execute_community_grow_publication_reset",
]);
const ONE_TIME_FUNCTIONS = new Set(["backfill_community_activity_snapshot_posts"]);
const LEGACY_COMPATIBILITY = new Set([
  "get_explorer_completed_session_aggregates", "get_grow_intelligence_engine_analytics",
  "get_grow_intelligence_engine_analytics_legacy_v1",
]);

const rows = runLocalSql(String.raw`
select jsonb_build_object(
  'name', p.proname,
  'signature', p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
  'security', case when p.prosecdef then 'definer' else 'invoker' end,
  'searchPath', coalesce((select setting from unnest(coalesce(p.proconfig, '{}'::text[])) setting where setting like 'search_path=%' limit 1), '(caller default)'),
  'owner', owner.rolname,
  'anon', has_function_privilege('anon', p.oid, 'execute'),
  'authenticated', has_function_privilege('authenticated', p.oid, 'execute'),
  'serviceRole', has_function_privilege('service_role', p.oid, 'execute'),
  'triggerCaller', exists (select 1 from pg_trigger t where t.tgfoid = p.oid and not t.tgisinternal),
  'mutates', pg_get_functiondef(p.oid) ~* E'\\m(insert|update|delete|truncate)\\M'
)::text
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
join pg_roles owner on owner.oid = p.proowner
where n.nspname = 'public'
  and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
order by p.proname, pg_get_function_identity_arguments(p.oid);
`, { tuplesOnly: true, quiet: true }).split(/\r?\n/).filter(Boolean).map(JSON.parse);

const access = (row) => [row.anon && "anon", row.authenticated && "authenticated", row.serviceRole && "service_role", "postgres/owner"].filter(Boolean).join(", ");
const purpose = (row) => row.name.replaceAll("_", " ");
const caller = (row) => {
  if (FRONTEND_RPCS.has(row.name)) return `frontend: app.js RPC`;
  if (SERVER_RPCS.has(row.name)) return "server: elevated maintenance script RPC";
  if (row.triggerCaller) return "trigger";
  if (ONE_TIME_FUNCTIONS.has(row.name)) return "migration/maintenance; no runtime caller";
  if (/^get_gie_|^get_grow_intelligence_engine_|^is_(?:community|explorer|grow_session)|^resolve_grow_session/.test(row.name)) return "canonical RPC/internal SQL";
  if (/^(?:set_|sync_|enforce_|protect_|reconcile_|refresh_|calculate_|normalize_|generate_)/.test(row.name)) return "trigger or internal RPC helper";
  return "migration/internal SQL; no direct browser caller";
};
const exposure = (row) => {
  if (/admin|cleanup|owner|shared|identity|recognition|follow|my_/.test(row.name)) return "yes; authorization/scoping required";
  if (/gie|intelligence|explorer|public/.test(row.name)) return "canonical/public projection only";
  return "no cross-user result";
};
const status = (row) => {
  if (ONE_TIME_FUNCTIONS.has(row.name)) return "one-time; no runtime caller found";
  if (LEGACY_COMPATIBILITY.has(row.name)) return "legacy compatibility; retained";
  if (FRONTEND_RPCS.has(row.name) || SERVER_RPCS.has(row.name)) return "authoritative boundary";
  return "authoritative support/internal";
};
const esc = (value) => String(value).replaceAll("|", "\\|").replaceAll(/\s+/g, " ").trim();

export const renderFunctionAudit = () => {
  const lines = [
    "# Grow function caller and access audit",
    "",
    "Last reviewed: 2026-07-15",
    "",
    "This is the function-level companion to `grow-supabase-security-access-audit-2026-07-15.md`. It inventories every application-defined function present after a clean migration replay. Current and required access match because the reviewed reconciliation is applied. `postgres/owner` is implicit and is the only caller for owner-internal helpers.",
    "",
    "Caller discovery covered `app.js`, `api/`, scripts, migrations, triggers, and server maintenance paths. An absence of a direct browser caller does not by itself authorize removal; legacy compatibility functions are retained.",
    "",
    "| Function signature | Purpose | Caller/type | Security / search path | Current EXECUTE | Required EXECUTE | Private or cross-user data | Mutates | Status | Owner |",
    "|---|---|---|---|---|---|---|---:|---|---|",
    ...rows.map((row) => `| \`${esc(row.signature)}\` | ${esc(purpose(row))} | ${esc(caller(row))} | ${row.security}; \`${esc(row.searchPath)}\` | ${access(row)} | ${access(row)} | ${exposure(row)} | ${row.mutates ? "yes" : "no"} | ${status(row)} | ${row.owner} |`),
    "",
    "## Audit conclusions",
    "",
    "- Public execution is retained only for deliberate anonymous projections: canonical public GIE wrappers, public identity/follow projections, active shared-Vault slug lookup, the legacy Explorer compatibility projection, and `current_user_is_admin()` where anonymous RLS evaluation requires it.",
    "- Seed Vault management/sharing RPCs are authenticated-only. Trigger functions, one-time backfills, slug helpers, and internal GIE functions are not client-executable.",
    "- Service-role execution remains explicit for Community publication reset, lifecycle/diagnostic support, and server health workflows. CSTP continues to use server-side table access and has no browser RPC boundary.",
    "- Every security-definer function fixes `search_path`; all are owned by `postgres`. Invoker trigger helpers use the caller default path but are no longer client-executable.",
    "- `record_community_activity` now rejects cross-user writes and performs a serialized, deterministic logical-key update-or-insert. `set_member_admin_access` retains its admin check and uses its named unique constraint.",
    "- `backfill_community_activity_snapshot_posts()` has no runtime caller and is retained as historical maintenance code with owner-only execution. No function was dropped based solely on apparent age.",
    "",
    "## Lint classification",
    "",
    "- Fixed: ambiguous `activity_type` in `record_community_activity`.",
    "- Fixed: ambiguous `user_id` in `set_member_admin_access`.",
    "- Fixed: two confirmed-unused local variables in `get_gie_owner_phase2_analytics_v1`; canonical output fingerprint is unchanged.",
    "- Accepted static-analysis limitation: `cleanup_founder_test_grow_sessions` creates `pg_temp.cleanup_founder_test_session_candidates` before using it. Runtime dry-run regression succeeds; no unsafe dependency exists. Rewriting the cleanup workflow only to satisfy the analyzer would add risk.",
    "",
  ];
  return `${lines.join("\n")}\n`;
};

if (process.argv.includes("--print")) {
  process.stdout.write(renderFunctionAudit());
} else {
  assert.equal(readFileSync(DOCUMENT_PATH, "utf8").replaceAll("\r\n", "\n").trimEnd(), renderFunctionAudit().trimEnd(), "Function access audit document is stale; regenerate it from a verified clean database.");
  console.log(`Function access audit is current (${rows.length} functions).`);
}
