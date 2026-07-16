import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runLocalSql } from "../local-demo/db.mjs";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
export const APPROVED_FINGERPRINT_PATH = resolve(SCRIPT_DIRECTORY, "approved-security-fingerprint.json");

const SNAPSHOT_SQL = String.raw`
with relevant_roles(role_name) as (
  values ('anon'), ('authenticated'), ('service_role')
), relation_state as (
  select
    case c.relkind when 'v' then 'view' when 'm' then 'view' when 'S' then 'sequence' else 'table' end as kind,
    jsonb_build_object(
      'resource', format('%I.%I', n.nspname, c.relname),
      'type', c.relkind,
      'rls_enabled', c.relrowsecurity,
      'rls_forced', c.relforcerowsecurity
    ) as value
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm', 'S')
), relation_privileges as (
  select
    'relation_privilege' as kind,
    jsonb_build_object(
      'resource', format('%I.%I', n.nspname, c.relname),
      'role', relevant_roles.role_name,
      'select', has_table_privilege(relevant_roles.role_name, c.oid, 'select'),
      'insert', has_table_privilege(relevant_roles.role_name, c.oid, 'insert'),
      'update', has_table_privilege(relevant_roles.role_name, c.oid, 'update'),
      'delete', has_table_privilege(relevant_roles.role_name, c.oid, 'delete'),
      'truncate', has_table_privilege(relevant_roles.role_name, c.oid, 'truncate'),
      'references', has_table_privilege(relevant_roles.role_name, c.oid, 'references'),
      'trigger', has_table_privilege(relevant_roles.role_name, c.oid, 'trigger')
    ) as value
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  cross join relevant_roles
  where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm')
), sequence_privileges as (
  select
    'sequence_privilege' as kind,
    jsonb_build_object(
      'resource', format('%I.%I', n.nspname, c.relname),
      'role', relevant_roles.role_name,
      'select', has_sequence_privilege(relevant_roles.role_name, c.oid, 'select'),
      'usage', has_sequence_privilege(relevant_roles.role_name, c.oid, 'usage'),
      'update', has_sequence_privilege(relevant_roles.role_name, c.oid, 'update')
    ) as value
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  cross join relevant_roles
  where n.nspname = 'public' and c.relkind = 'S'
), function_state as (
  select
    'function' as kind,
    jsonb_build_object(
      'resource', format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)),
      'security_definer', p.prosecdef,
      'search_path', coalesce((select setting from unnest(coalesce(p.proconfig, '{}'::text[])) setting where setting like 'search_path=%' limit 1), ''),
      'anon_execute', has_function_privilege('anon', p.oid, 'execute'),
      'authenticated_execute', has_function_privilege('authenticated', p.oid, 'execute'),
      'service_role_execute', has_function_privilege('service_role', p.oid, 'execute')
    ) as value
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
), policy_state as (
  select
    'policy' as kind,
    jsonb_build_object(
      'resource', format('%I.%I', schemaname, tablename),
      'name', policyname,
      'command', cmd,
      'permissive', permissive,
      'roles', to_jsonb(roles),
      'using', regexp_replace(coalesce(qual, ''), E'\\s+', ' ', 'g'),
      'with_check', regexp_replace(coalesce(with_check, ''), E'\\s+', ' ', 'g')
    ) as value
  from pg_policies
  where schemaname = 'public' or (schemaname = 'storage' and tablename = 'objects')
), bucket_state as (
  select
    'storage_bucket' as kind,
    jsonb_build_object(
      'id', id,
      'name', name,
      'public', public,
      'file_size_limit', file_size_limit,
      'allowed_mime_types', coalesce(to_jsonb(allowed_mime_types), '[]'::jsonb)
    ) as value
  from storage.buckets
)
select kind || '|' || value::text
from (
  select * from relation_state
  union all select * from relation_privileges
  union all select * from sequence_privileges
  union all select * from function_state
  union all select * from policy_state
  union all select * from bucket_state
) snapshot
order by kind, value::text;
`;

export function calculateSecurityFingerprint() {
  const output = runLocalSql(SNAPSHOT_SQL, { tuplesOnly: true, quiet: true });
  const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const fingerprint = createHash("sha256").update(`${lines.join("\n")}\n`, "utf8").digest("hex");
  const count = (prefix) => lines.filter((line) => line.startsWith(`${prefix}|`)).length;
  return {
    algorithm: "sha256",
    fingerprint,
    counts: {
      tables: count("table"),
      views: count("view"),
      sequences: count("sequence"),
      policies: count("policy"),
      functions: count("function"),
      storageBuckets: count("storage_bucket"),
    },
    snapshot: lines,
  };
}

const summarizeDiff = (approvedLines, actualLines) => {
  const approved = new Set(approvedLines);
  const actual = new Set(actualLines);
  const removed = approvedLines.filter((line) => !actual.has(line));
  const added = actualLines.filter((line) => !approved.has(line));
  const format = (label, lines) => lines.length
    ? `${label} (${lines.length}):\n${lines.slice(0, 40).map((line) => `  ${line}`).join("\n")}${lines.length > 40 ? `\n  ... ${lines.length - 40} more` : ""}`
    : `${label} (0)`;
  return `${format("Removed or changed", removed)}\n${format("Added or changed", added)}`;
};

export function verifyApprovedSecurityFingerprint({ printSuccess = true } = {}) {
  const approved = JSON.parse(readFileSync(APPROVED_FINGERPRINT_PATH, "utf8"));
  const actual = calculateSecurityFingerprint();
  if (approved.fingerprint !== actual.fingerprint) {
    throw new Error(
      `Security fingerprint mismatch. Review the resource-level diff; do not update the approved snapshot without a security review.\n`
      + `Approved: ${approved.fingerprint}\nActual:   ${actual.fingerprint}\n`
      + summarizeDiff(approved.snapshot || [], actual.snapshot),
    );
  }
  assert.deepEqual(actual.counts, approved.counts, "Security fingerprint counts changed unexpectedly.");
  if (printSuccess) {
    console.log(`Security fingerprint: ${actual.fingerprint}`);
    console.log(`Inspected: ${actual.counts.tables} tables, ${actual.counts.views} views, ${actual.counts.sequences} sequences, ${actual.counts.policies} policies, ${actual.counts.functions} functions, ${actual.counts.storageBuckets} Storage buckets.`);
  }
  return actual;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  verifyApprovedSecurityFingerprint();
}
