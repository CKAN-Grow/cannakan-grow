const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const phase1Migration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260713190000_gie_multi_contract_phase1.sql"),
  "utf8",
);
const migration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260713200000_gie_owner_contract_auth_hardening.sql"),
  "utf8",
);
const docs = fs.readFileSync(
  path.join(root, "docs", "architecture", "grow-evidence-engine.md"),
  "utf8",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function between(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert(start >= 0, `Missing ${startNeedle}`);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert(end > start, `Missing ${endNeedle}`);
  return source.slice(start, end);
}

const myOwnerContract = between(
  migration,
  "create or replace function public.get_gie_my_analytics()",
  "create or replace function public.get_gie_admin_owner_analytics(target_user_id uuid)",
);
assert(!migration.includes("get_gie_my_analytics(" + "p_"), "Normal Owner analytics must accept no owner parameter.");
assert(myOwnerContract.includes("requester_id uuid := auth.uid()"), "Normal Owner identity must come from auth.uid().");
assert(myOwnerContract.includes("if requester_id is null then"), "Normal Owner analytics must reject unauthenticated callers.");
assert(myOwnerContract.includes("return public.get_gie_owner_analytics(requester_id)"), "Authenticated owners must receive only their session-derived Owner payload.");
assert(!myOwnerContract.includes("target_user_id") && !myOwnerContract.includes("p_owner_id"), "Normal Owner RPC must not accept or use a caller-supplied owner UUID.");
assert(myOwnerContract.includes("set search_path = public"), "Normal Owner SECURITY DEFINER function needs an explicit safe search_path.");
assert(myOwnerContract.includes("revoke all on function public.get_gie_my_analytics() from anon"), "Anon must not execute normal Owner analytics.");
assert(myOwnerContract.includes("grant execute on function public.get_gie_my_analytics() to authenticated"), "Authenticated users must be able to execute their own Owner analytics.");

const adminOwnerContract = between(
  migration,
  "create or replace function public.get_gie_admin_owner_analytics(target_user_id uuid)",
  "-- The caller-supplied UUID function",
);
assert(adminOwnerContract.includes("if requester_id is null then"), "Admin Owner analytics must reject anonymous callers.");
assert(adminOwnerContract.includes("from public.admin_users") && adminOwnerContract.includes("admin_users.user_id = requester_id"), "Admin Owner analytics must enforce the existing admin authorization model.");
assert(adminOwnerContract.includes("raise exception 'Admin access required for cross-owner analytics'"), "Authenticated non-admin callers must be rejected.");
assert(adminOwnerContract.includes("return public.get_gie_owner_analytics(target_user_id)"), "Authorized admins must reuse the canonical Owner implementation.");
assert(adminOwnerContract.includes("set search_path = public"), "Admin Owner SECURITY DEFINER function needs an explicit safe search_path.");
assert(adminOwnerContract.includes("revoke all on function public.get_gie_admin_owner_analytics(uuid) from anon"), "Anon must not execute Admin Owner analytics.");
assert(adminOwnerContract.includes("grant execute on function public.get_gie_admin_owner_analytics(uuid) to authenticated"), "Admin RPC may be callable by authenticated users only with internal admin enforcement.");

for (const role of ["public", "anon", "authenticated"]) {
  assert(migration.includes(`revoke all on function public.get_gie_owner_analytics(uuid) from ${role}`), `Legacy UUID Owner RPC must be revoked from ${role}.`);
}
assert(migration.includes("DEPRECATED internal Owner Analytics implementation"), "Legacy UUID Owner RPC must be explicitly deprecated.");

for (const wrapper of [myOwnerContract, adminOwnerContract]) {
  assert(!wrapper.includes("from public.grow_sessions") && !wrapper.includes("jsonb_array_elements"), "Owner wrappers must not duplicate analytics calculations.");
}
assert(phase1Migration.includes("get_gie_contract_metadata_v1('owner_analytics', 'gie-owner.v1')"), "Owner payload identity must remain gie-owner.v1.");
assert(!migration.includes("create or replace function public.get_gie_global_analytics"), "Owner hardening must not redefine the Global contract.");
assert(!migration.includes("create or replace function public.get_gie_community_analytics"), "Owner hardening must not redefine the Community contract.");

const diagnostics = between(
  migration,
  "create or replace function public.get_gie_contract_diagnostics()",
  "revoke all on function public.get_gie_contract_diagnostics() from public",
);
for (const value of [
  "'canonical_rpc', 'get_gie_my_analytics()'",
  "'admin_rpc', 'get_gie_admin_owner_analytics(uuid)'",
  "'caller_supplied_owner_id', 'Disabled'",
  "'cross_owner_access_protection', 'Enforced'",
  "'admin_authorization_status'",
]) {
  assert(diagnostics.includes(value), `Owner diagnostics are missing ${value}.`);
}
assert(diagnostics.includes("public.get_gie_my_analytics()"), "Diagnostics must exercise the canonical no-argument Owner RPC.");

assert(!app.includes('.rpc("get_gie_owner_analytics"'), "Browser code must never call the legacy UUID Owner RPC.");
const adminOwnerCall = between(app, 'if (normalizedScope === "admin-owner")', 'return { state: "unavailable", scope: normalizedScope');
assert(adminOwnerCall.includes("isAdminUser()") && adminOwnerCall.includes('.rpc("get_gie_admin_owner_analytics"'), "Browser admin cross-owner access must be explicitly admin-gated and use only the admin RPC.");
assert(app.includes('appState.supabase.rpc("get_gie_contract_diagnostics")'), "Health may read only the admin diagnostic envelope.");
for (const field of ["canonicalRpc", "adminRpc", "callerSuppliedOwnerId", "crossOwnerAccessProtection", "adminAuthorizationStatus"]) {
  assert(app.includes(field), `Grow Intelligence Health must render ${field}.`);
}

assert(docs.includes("Normal owner analytics must derive identity from"), "Documentation is missing the permanent session-identity rule.");
assert(docs.includes("never from a caller-supplied owner identifier"), "Documentation must prohibit caller-supplied owner identity.");
assert(docs.includes("get_gie_my_analytics()") && docs.includes("get_gie_admin_owner_analytics"), "Documentation must distinguish normal and admin Owner RPCs.");

console.log("GEE Owner contract authorization hardening regression checks passed.");
