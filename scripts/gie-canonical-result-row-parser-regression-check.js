const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260713233000_gie_community_evidence_and_home_global_wiring.sql"), "utf8");
const ownerMigration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260713210000_gie_phase2_group_a_owner_analytics.sql"), "utf8");
const communityMigration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260713220000_gie_phase2b_group_b_community_analytics.sql"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const helper of [
  "get_gie_canonical_seed_count",
  "get_gie_canonical_germinated_count",
  "get_gie_canonical_variety_name",
  "get_gie_canonical_source_name",
  "get_gie_canonical_result_row_v1",
]) {
  assert(migration.includes(`public.${helper}`), `Missing canonical parser: ${helper}.`);
}

for (const alias of ["seedCount", "seed_count", "totalSeeds", "total_seeds", "totalCount", "total_count", "seedsStarted", "seeds_started"]) {
  assert(migration.includes(`'${alias}'`), `Seed-count parser is missing ${alias}.`);
}
for (const alias of ["plantedCount", "planted_count", "germinatedCount", "germinated_count", "totalGerminated", "total_germinated", "germinatedSeeds", "germinated_seeds"]) {
  assert(migration.includes(`'${alias}'`), `Germinated-count parser is missing ${alias}.`);
}

for (const contractCheck of [
  `'{"totalCount":12}'::jsonb`,
  `'{"seedCount":11}'::jsonb`,
  `'{"totalSeeds":10}'::jsonb`,
  `'{"seed_count":" 9 "}'::jsonb`,
  `'{"seedCount":8,"totalCount":99}'::jsonb`,
  `'{"seedCount":"invalid","totalCount":7}'::jsonb`,
  `'{"seedCount":"invalid"}'::jsonb`,
  `'{"seedCount":-1}'::jsonb`,
  `'{"seedCount":1.5}'::jsonb`,
  `'{"seedCount":2147483648}'::jsonb`,
  `'{"plantedCount":7,"germinatedCount":6}'::jsonb`,
  `'{"germinatedSeeds":" 5 "}'::jsonb`,
]) {
  assert(migration.includes(contractCheck), `Missing migration-time parser contract check: ${contractCheck}.`);
}

assert(migration.includes("The first valid value wins") && migration.includes("never double-counted"), "Alias precedence and no-double-count behavior must be documented.");
assert(migration.includes("parsed_value between 0 and 2147483647"), "Counts must reject negative and overflowing values.");
assert(migration.includes("cross join lateral public.get_gie_canonical_result_row_v1(partition_rows.partition_value) parsed"), "Scoped Global/Owner/Community rows must use the canonical row parser.");
assert(migration.includes("from public.get_gie_canonical_global_result_rows_v1()") && migration.includes("select public.get_gie_canonical_global_analytics_v1()"), "Global Analytics and its compatibility delegate must use canonical parsed rows.");
assert(migration.includes("create or replace function public.get_grow_intelligence_engine_quality_observations()") && migration.includes("get_gie_canonical_result_row_v1(partition_rows.partition)"), "Mature data-quality observations must use the canonical row parser.");
assert(!migration.includes("create or replace function public.get_grow_intelligence_engine_analytics_legacy_v1()"), "The mature Global wrapper must be preserved rather than replaced with a reduced payload.");
assert(migration.includes("existing get_grow_intelligence_engine_analytics_legacy_v1() wrapper is") && migration.includes("preserving the mature payload"), "The retained mature Global wrapper must be documented.");
assert(ownerMigration.includes("get_gie_scoped_result_rows_v1('owner'"), "Owner Analytics must inherit the canonical scoped parser.");
assert(communityMigration.includes("get_gie_scoped_result_rows_v1('community'"), "Community Analytics must inherit the canonical scoped parser.");
assert(migration.includes("create or replace function public.get_explorer_completed_session_aggregate_diagnostics()") && migration.includes("get_gie_canonical_result_row_v1(partition_value)"), "Diagnostics must use the canonical row parser.");
assert(!/partition_value\s*->>\s*'(seedCount|seed_count|totalSeeds|total_seeds|totalCount|total_count|plantedCount|germinatedCount)'/.test(migration), "No active SQL path may independently parse result-row aliases.");

const homeExplorerStart = app.indexOf("function getHomeGlobalAnalyticsCacheState");
const homeExplorerEnd = app.indexOf("function renderHomeCstpTestingIconMarkup", homeExplorerStart);
const homeExplorer = app.slice(homeExplorerStart, homeExplorerEnd);
assert(homeExplorerStart >= 0 && homeExplorerEnd > homeExplorerStart, "Missing Home Explorer contract-rendering range.");
assert(!/seedCount|seed_count|totalCount|germinatedCount|plantedCount/.test(homeExplorer), "Home Explorer UI must render contract fields without parsing raw result-row aliases.");

console.log("GEE canonical result-row parser regression checks passed.");
