const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const migration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260713160000_grow_intelligence_engine.sql"),
  "utf8",
);
const geeDocs = fs.readFileSync(
  path.join(root, "docs", "architecture", "grow-evidence-engine.md"),
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
const sourceMetrics = getBetween(
  app,
  "function getSourceDirectoryMetrics",
  "function getSourceDirectoryCommunityConfidenceLabel",
);
const seedMetrics = getBetween(
  app,
  "function getSeedExplorerMetrics",
  "function renderSeedExplorerCommunityConfidenceMetricMarkup",
);
const seedPanel = getBetween(
  app,
  "function renderSeedExplorerPanelMarkup",
  "function bindSeedExplorerControls",
);
const varietyReport = getBetween(
  app,
  "function renderSeedProfilePage",
  "function renderExploreSegmentedNavItemMarkup",
);

assert(app.includes("function resolveGrowSessionLifecycle"), "Missing canonical local Grow Session lifecycle resolver.");
assert(app.includes("function getExplorerCompletedSessionAggregateExclusionReason"), "Missing local Explorer compatibility exclusion-reason helper.");
assert(app.includes("function isExplorerCompletedSessionAggregateEligible"), "Missing Explorer completed-session eligibility helper.");
assert(app.includes('appState.supabase.rpc("get_gie_global_analytics")'), "Explorer must consume the canonical Global Analytics Contract.");
assert(!app.includes('appState.supabase.rpc("get_explorer_completed_session_aggregates")'), "Explorer UI must not call a legacy compatibility wrapper.");
assert(app.includes("return getExplorerCompletedSessionAggregateExclusionReason(session, options) === \"\";"), "Explorer eligibility must resolve through the exclusion-reason helper.");
assert(app.includes("return resolveGrowSessionLifecycle(session, options).included === true;"), "Analytics eligibility must resolve through the lifecycle resolver.");
assert(app.includes('["completed", "complete"].includes(normalizedStatus)') && app.includes("hasCompletedTimestamp"), "Explorer eligibility must support legacy completed status and completed timestamps.");
assert(app.includes('const hidden = visibilityStatus === "hidden";') && app.includes("userDeleted || hardDeleted || archived || hidden || deletedStatus"), "Lifecycle resolver must treat hidden/deleted visibility as excluded.");
assert(!app.includes("function getExplorerAggregateEligibleCompletedSessions"), "Explorer must not rebuild GEE aggregates from locally loaded sessions.");
assert(aggregateBuilder.includes("buildExplorerAggregateFromCachedPayload(appState.explorerCompletedSessionAggregate)"), "Explorer must consume the cached canonical GEE payload.");
assert(!aggregateBuilder.includes("getSessions(") && !aggregateBuilder.includes("resultSummary") && !aggregateBuilder.includes(".reduce("), "Explorer aggregate adapter must not calculate analytics locally.");
assert(aggregateBuilder.includes("sourceMap") && aggregateBuilder.includes("seedRecords"), "Aggregate adapter must expose canonical Source and Seed records.");
assert(sourceAggregate.includes("buildExplorerCompletedSessionAggregate"), "Source Explorer must reuse the shared completed-session aggregate.");
assert(sourceAggregate.includes("buildExplorerCompletedSessionAggregate();"), "Source Explorer must use the cached RPC aggregate instead of rebuilding from local session state.");
assert(sourceAggregate.includes("totalCompletedSessions"), "Source Explorer aggregate must carry the shared completed-session count.");
assert(sourceMetrics.includes("aggregate.totalCompletedSessions"), "Source Explorer metrics must use the shared completed-session count.");
assert(seedRecords.includes("buildExplorerCompletedSessionAggregate().seedRecords"), "Seed Explorer must use the shared completed-session aggregate.");
assert(seedRecords.includes("isMockDataEnabled() ? getSeedExplorerDemoSeeds() : []"), "Seed Explorer must not fall back to demo seed records in production.");
assert(seedMetrics.includes("aggregate.totalCompletedSessions"), "Seed Explorer metrics must use the shared completed-session count.");
assert(!seedPanel.includes("Public variety profiles built from approved Community Grow reports."), "Seed Explorer must not describe aggregate profiles as approved public reports.");
assert(seedPanel.includes("Seed performance profiles built from anonymized completed session results."), "Seed Explorer aggregate copy is missing.");
assert(varietyReport.includes("getCanonicalCommunityVarietyReport"), "Variety reports must use the canonical Community report payload.");
assert(!varietyReport.includes("getApprovedPublicGallerySnapshots") && !varietyReport.includes(".reduce("), "Variety reports must not rebuild public analytics from snapshots.");
assert(geeDocs.includes("The Grow Evidence Engine (GEE) is the canonical analytics layer"), "Missing canonical GEE architecture documentation.");
assert(geeDocs.includes("Do not create a second analytics engine."), "GEE docs must forbid duplicate analytics engines.");

const aggregateRpc = getBetween(
  migration,
  "create or replace function public.get_grow_intelligence_engine_analytics()",
  "revoke all on function public.get_grow_intelligence_engine_analytics()",
);
const explorerWrapperRpc = getBetween(
  migration,
  "create or replace function public.get_explorer_completed_session_aggregates()",
  "revoke all on function public.get_explorer_completed_session_aggregates()",
);
const diagnosticRpc = getBetween(
  migration,
  "create or replace function public.get_explorer_completed_session_aggregate_diagnostics()",
  "revoke all on function public.get_explorer_completed_session_aggregate_diagnostics()",
);

assert(migration.includes("create or replace function public.resolve_grow_session_lifecycle"), "Missing canonical SQL Grow Session lifecycle resolver.");
assert(migration.includes("create or replace function public.get_grow_session_lifecycle_exclusion_reason"), "Missing canonical SQL lifecycle exclusion-reason helper.");
assert(migration.includes("create or replace function public.is_community_intelligence_session_eligible"), "Missing canonical SQL Community Intelligence eligibility helper.");
assert(migration.includes("create or replace function public.get_grow_intelligence_engine_analytics()"), "Missing canonical Grow Evidence Engine analytics RPC.");
assert(migration.includes("'engine_version', 'gie.v1'") && migration.includes("'schema_version', '2026-07-13.2'"), "GEE payload must expose engine and schema version metadata.");
assert(migration.includes("create or replace function public.get_explorer_grow_session_exclusion_reason"), "Missing Explorer SQL compatibility exclusion-reason wrapper.");
assert(migration.includes("create or replace function public.is_explorer_grow_session_eligible"), "Missing Explorer SQL compatibility eligibility wrapper.");
assert(migration.includes("create or replace function public.get_explorer_completed_session_aggregates()"), "Missing Explorer aggregate RPC migration.");
assert(migration.includes("create or replace function public.get_explorer_completed_session_aggregate_diagnostics()"), "Missing Explorer aggregate diagnostic RPC.");
assert(migration.includes("security definer"), "Explorer aggregate RPC must be SECURITY DEFINER.");
assert(migration.includes("normalized_status not in ('completed', 'complete')") && migration.includes("completed_at is null"), "RPC must support legacy completed sessions without requiring completed_at.");
assert(migration.includes("grow_session_cleanup_audit") && migration.includes("cleanup_deleted_session"), "Canonical Explorer predicate must exclude confirmed Founder Cleanup-deleted sessions.");
assert(migration.includes("normalized_visibility_status in ('deleted', 'hidden', 'archived', 'archived_test')"), "Canonical Explorer predicate must exclude hidden/deleted visibility states.");
assert(aggregateRpc.includes("public.is_community_intelligence_session_eligible(grow_sessions.id)"), "Public aggregate RPC must use the canonical Community Intelligence eligibility helper.");
assert(explorerWrapperRpc.includes("public.get_grow_intelligence_engine_analytics()"), "Explorer aggregate RPC must remain a wrapper around the GEE.");
assert(diagnosticRpc.includes("public.resolve_grow_session_lifecycle(grow_sessions.id)"), "Diagnostic RPC must use the canonical SQL lifecycle resolver.");
assert(diagnosticRpc.includes("'lifecycle_state'") && diagnosticRpc.includes("'eligibility_state'") && diagnosticRpc.includes("'deletion_source'"), "Diagnostic RPC must expose lifecycle state, eligibility state, and deletion source.");
assert(diagnosticRpc.includes("'health_status'") && diagnosticRpc.includes("'integrity_score'"), "GEE diagnostic RPC must expose health status and integrity score.");
assert(migration.includes("'germinatedCount'") && migration.includes("'totalGerminated'"), "RPC must support current and legacy germinated count fields.");
assert(migration.includes("grant execute on function public.get_grow_intelligence_engine_analytics() to anon"), "GEE RPC must expose only aggregate results to anon clients.");
assert(migration.includes("grant execute on function public.get_grow_intelligence_engine_analytics() to authenticated"), "GEE RPC must expose only aggregate results to authenticated clients.");
assert(migration.includes("grant execute on function public.get_explorer_completed_session_aggregates() to anon"), "RPC must expose only aggregate results to anon clients.");
assert(migration.includes("grant execute on function public.get_explorer_completed_session_aggregates() to authenticated"), "RPC must expose only aggregate results to authenticated clients.");
assert(migration.includes("Admin or service-role access is required"), "Diagnostic RPC must be admin/service-role restricted.");
assert(!aggregateRpc.includes("session_name") && !aggregateRpc.includes("session_notes") && !aggregateRpc.includes("session_images"), "Public RPC must not return private session fields.");
assert(!aggregateRpc.includes("'userId'") && !aggregateRpc.includes("'user_id'"), "Public RPC payload must not return user identifiers.");
assert(!aggregateRpc.includes("grow_gallery_snapshots"), "Aggregate RPC must not depend on Community snapshot publication state.");

console.log("Explorer completed-session aggregate regression checks passed.");
