const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const migration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260713143000_explorer_aggregate_legacy_completed_sessions.sql"),
  "utf8",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function getBetween(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert(start >= 0, `Missing ${startNeedle}`);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert(end > start, `Missing ${endNeedle}`);
  return source.slice(start, end);
}

const aggregateBuilder = getBetween(
  app,
  "function buildExplorerCompletedSessionAggregate",
  "function getSeedExplorerRecords",
);
const seedRecords = getBetween(
  app,
  "function getSeedExplorerRecords",
  "function getSeedExplorerSeedById",
);
const sourceAggregate = getBetween(
  app,
  "function buildSourceDirectorySessionAggregate",
  "function getSourceDirectoryTrackRecordForSource",
);
const seedPanel = getBetween(
  app,
  "function renderSeedExplorerPanelMarkup",
  "function bindSeedExplorerControls",
);
const galleryRows = getBetween(
  app,
  "function getSeedReportGallerySessionRows",
  "function renderSeedReportGalleryMarkup",
);
const galleryMarkup = getBetween(
  app,
  "function renderSeedReportGalleryMarkup",
  "function renderSeedReportInsightsMarkup",
);

assert(app.includes("function getExplorerAggregateEligibleCompletedSessions"), "Missing shared Explorer completed-session eligibility helper.");
assert(app.includes("function getExplorerAggregateEligibleCompletedSessions") && app.includes("isExplorerCompletedSessionAggregateEligible(session"), "Aggregate builder must use the Explorer completed-session eligibility helper.");
assert(app.includes("function isExplorerCompletedSessionAggregateEligible"), "Missing Explorer completed-session eligibility helper.");
assert(app.includes('["completed", "complete"].includes(normalizedStatus)') && app.includes("hasCompletedTimestamp"), "Explorer eligibility must support legacy completed status and completed timestamps.");
assert(aggregateBuilder.includes("!partitionResult.hasSeeds") && aggregateBuilder.includes("!partitionResult.hasFinalResultValue"), "Aggregate builder must exclude invalid/incomplete result rows.");
assert(aggregateBuilder.includes("sourceMap") && aggregateBuilder.includes("seedRecords"), "Aggregate builder must produce shared Source and Seed records.");
assert(sourceAggregate.includes("buildExplorerCompletedSessionAggregate"), "Source Explorer must reuse the shared completed-session aggregate.");
assert(seedRecords.includes("buildExplorerCompletedSessionAggregate().seedRecords"), "Seed Explorer must use the shared completed-session aggregate.");
assert(!seedPanel.includes("Public variety profiles built from approved Community Grow reports."), "Seed Explorer must not describe aggregate profiles as approved public reports.");
assert(seedPanel.includes("Seed performance profiles built from anonymized completed session results."), "Seed Explorer aggregate copy is missing.");
assert(galleryRows.includes("isGallerySnapshotPubliclyVisible"), "Seed report evidence must be limited to approved visible public snapshots.");
assert(galleryMarkup.includes("No public session reports available yet."), "Seed report must show a public-evidence empty state when aggregates exist without reports.");

assert(migration.includes("create or replace function public.get_explorer_completed_session_aggregates()"), "Missing Explorer aggregate RPC migration.");
assert(migration.includes("create or replace function public.get_explorer_completed_session_aggregate_diagnostics()"), "Missing Explorer aggregate diagnostic RPC.");
assert(migration.includes("security definer"), "Explorer aggregate RPC must be SECURITY DEFINER.");
assert(migration.includes("normalized_status not in ('completed', 'complete')") && migration.includes("completed_at is null"), "RPC must support legacy completed sessions without requiring completed_at.");
assert(migration.includes("'germinatedCount'") && migration.includes("'totalGerminated'"), "RPC must support current and legacy germinated count fields.");
assert(migration.includes("grant execute on function public.get_explorer_completed_session_aggregates() to anon"), "RPC must expose only aggregate results to anon clients.");
assert(migration.includes("grant execute on function public.get_explorer_completed_session_aggregates() to authenticated"), "RPC must expose only aggregate results to authenticated clients.");
assert(migration.includes("Admin or service-role access is required"), "Diagnostic RPC must be admin/service-role restricted.");
assert(!migration.includes("session_name") && !migration.includes("session_notes") && !migration.includes("session_images"), "RPC must not return private session fields.");
assert(!migration.includes("'userId'") && !migration.includes("'user_id'"), "RPC payload must not return user identifiers.");
assert(!migration.includes("grow_gallery_snapshots"), "Aggregate RPC must not depend on Community snapshot publication state.");

console.log("Explorer completed-session aggregate regression checks passed.");
