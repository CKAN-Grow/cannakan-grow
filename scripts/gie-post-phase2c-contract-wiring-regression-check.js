const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260713233000_gie_community_evidence_and_home_global_wiring.sql"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function between(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert(startIndex >= 0 && endIndex > startIndex, `Missing range ${start} -> ${end}`);
  return source.slice(startIndex, endIndex);
}

const galleryLoader = between(app, "async function loadGallerySnapshots", "async function loadGallerySnapshotLikes");
const galleryVisibility = between(app, "function isGallerySnapshotPubliclyVisible", "function canCurrentViewerSeeGallerySnapshot");
const galleryEligibility = between(app, "function isGallerySnapshotAnalyticsEligible", "function getGallerySnapshotDebugSignature");
const homeSource = between(app, "function renderHomeTestedSourcesPreviewSectionMarkup", "function getHomeSeedExplorerPreviewData");
const homeSeed = between(app, "function getHomeSeedExplorerPreviewData", "function renderHomeSeedExplorerPreviewSectionMarkup");
const homeGlobalState = between(app, "function getHomeGlobalAnalyticsCacheState", "function renderHomeTestedSourcesPreviewSectionMarkup");
const homeRender = between(app, "function renderHome()", "function renderHomeCurrentSessionExperience");
const communityLoader = between(app, "async function loadGieCommunityAnalytics", "async function loadGieContractDiagnostics");
const mutationRefresh = between(app, "async function refreshGrowAnalyticsAfterSessionMutation", "function getFounderSessionCleanupCandidateIds");

assert(migration.includes("get_gie_community_evidence_v1()"), "A canonical Community evidence resolver is required.");
assert(migration.includes("from public.get_gie_community_evidence_v1() evidence"), "Community scoped rows must consume the canonical evidence resolver.");
assert(migration.includes("get_gie_canonical_seed_count") && migration.includes("'totalCount'"), "Current gallery partition totalCount must be recognized by the canonical GIE parser.");
for (const predicate of [
  "lower(coalesce(snapshot_row.status, '')) = 'approved'",
  "coalesce(snapshot_row.is_published, false) = true",
  "coalesce(snapshot_row.analytics_excluded, false) = false",
  "coalesce(snapshot_row.is_mock, false) = false",
  "ranked.session_rank = 1",
]) {
  assert(migration.includes(predicate), `Canonical Community evidence is missing ${predicate}.`);
}
assert(migration.includes("get_gie_community_gallery_evidence()") && migration.includes("get_gie_community_analytics()"), "Gallery and Community contract must expose the same resolver-backed evidence.");
assert(!migration.includes("update public.grow_gallery_snapshots") && !migration.includes("delete from public.grow_gallery_snapshots"), "The wiring migration must not modify production reports.");

assert(galleryLoader.includes('.rpc("get_gie_community_gallery_evidence")'), "Community gallery must load canonical GIE evidence.");
assert(galleryLoader.includes("communityEvidenceEligible: true"), "Canonical evidence identity must be retained in the gallery cache.");
assert(galleryVisibility.includes("snapshot.communityEvidenceEligible === true"), "Public gallery visibility must render the resolver decision.");
assert(galleryEligibility.includes("snapshot.communityEvidenceEligible === true"), "Gallery analytics eligibility must render the resolver decision.");

assert(homeGlobalState.includes("appState.explorerCompletedSessionAggregateLoaded") && homeGlobalState.includes("appState.explorerCompletedSessionAggregate"), "Home Explorer must consume the isolated normalized Global cache.");
assert(homeGlobalState.includes('state: "loading"') && homeGlobalState.includes('state: "unavailable"') && homeGlobalState.includes('state: "available"'), "Global cache state must distinguish loading, unavailable, and true-zero-capable available payloads.");
assert(homeSeed.includes("getHomeGlobalAnalyticsCacheState") && homeSeed.includes("globalAnalytics.seedRecords"), "Home Seed Explorer must consume Global Analytics.");
assert(homeSource.includes("getHomeGlobalAnalyticsCacheState") && homeSource.includes("globalAnalytics?.sourceRecords"), "Home Source Explorer must consume Global Analytics.");
for (const field of ["totalCompletedSessions", "totalSeedsTested", "totalSeedsGerminated", "totalVarietiesLogged", "communityConfidence"]) {
  assert(homeSeed.includes(field), `Home Seed Explorer is missing canonical Global ${field}.`);
}
for (const field of ["totalCompletedSessions", "totalSeedsTested", "totalBreedersLogged", "sourceAttributionRate", "totalSeedsWithSource", "totalSeedsWithoutSource"]) {
  assert(homeSource.includes(field), `Home Source Explorer is missing canonical Global ${field}.`);
}
for (const homeExplorer of [homeSeed, homeSource]) {
  assert(!homeExplorer.includes("getCanonicalCommunityAnalytics") && !homeExplorer.includes("buildCommunityInsightsState"), "Home Explorer teasers must not consume Community Analytics.");
  assert(!homeExplorer.includes(".reduce(") && !homeExplorer.includes("getSessions("), "Home Explorer teasers must not calculate analytics locally.");
}
assert(app.includes("Canonical Seed Explorer metrics could not be loaded") && app.includes("Canonical Source Explorer metrics could not be loaded"), "Home Explorer teasers need explicit unavailable states.");
assert(communityLoader.includes('.rpc("get_gie_community_analytics")'), "Community Insights must remain on the Community contract.");
assert(homeRender.includes('loadExplorerCompletedSessionAggregate("route:home")') && homeRender.includes('loadGieOwnerAnalytics("route:home")') && homeRender.includes('refreshGallerySnapshots("route:home")'), "Direct Home entry must hydrate Global, authenticated Owner, and Community contracts.");
assert(app.includes('refreshGallerySnapshots("route:community-insights")'), "Direct Community entry must hydrate canonical Community evidence and analytics.");
for (const cache of ["explorerCompletedSessionAggregate", "gieOwnerAnalytics", "gieCommunityAnalytics"]) {
  assert(app.includes(`appState.${cache}`), `Normalized contract cache is missing or conflated: ${cache}.`);
}
assert(mutationRefresh.includes("if (aggregate)") && mutationRefresh.includes("appState.explorerCompletedSessionAggregate = aggregate"), "A failed refresh must not replace valid Global data with a null/zero fallback.");
assert(app.includes("hasCanonicalGieAnalyticsPayload") && app.includes("if (communityAnalytics)"), "Empty contract responses must not replace valid normalized caches.");
for (const reason of ["moderation:", "published-moderation:", "published-delete", "owner-unpublish", "owner-delete", "post-publish:"]) {
  assert(app.includes(reason), `Community publication/deletion refresh is missing: ${reason}`);
}

console.log("Post-Phase 2C Community/Home contract wiring regression checks passed.");
