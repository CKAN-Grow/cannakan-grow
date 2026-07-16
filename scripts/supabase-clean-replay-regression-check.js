const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const migrationsDir = path.join(root, "supabase", "migrations");
const baselineName = "20260501000000_legacy_public_schema_baseline.sql";
const cstpName = "20260511222737_cstp_migration_v1.sql";
const baseline = fs.readFileSync(path.join(migrationsDir, baselineName), "utf8");
const cstp = fs.readFileSync(path.join(migrationsDir, cstpName), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(baselineName < cstpName, "The legacy baseline must sort before the first CSTP migration.");
assert(/create table if not exists public\.sources\s*\(/i.test(baseline), "The baseline must create public.sources.");
assert(/create table if not exists public\.grow_sessions\s*\(/i.test(baseline), "The baseline must create public.grow_sessions.");
assert(/source_id uuid references public\.sources\(id\) on delete set null/i.test(cstp), "CSTP requests must retain the intended source foreign key.");
assert(/create table if not exists public\.cstp_requests\s*\(/i.test(cstp), "The CSTP request table must remain additive.");

for (const destructive of [
  /\bdrop\s+table\b/i,
  /\btruncate\b/i,
  /\bdelete\s+from\b/i,
  /\bupdate\s+public\./i,
]) {
  assert(!destructive.test(baseline), "The remote-safe baseline must not contain destructive or data-mutating SQL.");
}

const sourceReferencesBeforeBaseline = fs.readdirSync(migrationsDir)
  .filter((name) => /^\d+.*\.sql$/.test(name) && name < baselineName)
  .filter((name) => /references\s+public\.sources/i.test(fs.readFileSync(path.join(migrationsDir, name), "utf8")));
assert(sourceReferencesBeforeBaseline.length === 0, "No migration may reference public.sources before the baseline creates it.");

console.log("Supabase clean-replay dependency regression checks passed.");
