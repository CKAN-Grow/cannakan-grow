const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const docs = fs.readFileSync(path.join(root, "docs", "architecture", "grow-intelligence-engine.md"), "utf8");

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

const routeConfig = getBetween(app, "function getAdminDashboardSectionRouteConfig", "function getAdminSubnavItems");
const healthMarkup = getBetween(app, "function renderGrowIntelligenceHealthSectionMarkup", "function renderAdminPage");
const loader = getBetween(app, "async function loadExplorerCompletedSessionAggregate", "async function refreshUserSessionsAfterSave");

assert(routeConfig.includes('case "grow-intelligence-health"'), "Missing canonical Grow Intelligence Health route.");
assert(routeConfig.includes('href: "#admin/grow-intelligence-health"'), "Admin navigation must use the canonical health route.");
assert(routeConfig.includes('label: "Grow Intelligence Health"'), "Admin route label was not renamed.");
assert(routeConfig.includes('case "data-health"') && routeConfig.includes('case "explorer-data-health"') && routeConfig.includes('case "gie"'), "Legacy health hashes must remain aliases.");
assert(app.includes('storedKey === "explorer-data-health" ? "grow-intelligence-health"'), "Saved admin layouts must migrate the legacy panel key.");

assert(loader.includes('appState.supabase.rpc("get_gie_global_analytics")'), "Grow Intelligence Health must load the canonical Global GIE contract.");
assert(healthMarkup.includes("System Health") && healthMarkup.includes("Data Quality"), "System health and data quality must be presented separately.");
assert(healthMarkup.includes("aggregate.dataQualityScore") && healthMarkup.includes("aggregate.dataQualityStatus"), "Health UI must render canonical score fields.");
assert(healthMarkup.includes("formatAdminTimestamp(aggregate.generatedAt)") && healthMarkup.includes("formatAdminTimestamp(contract.generatedAt)"), "Grow Intelligence Health must use the canonical Admin timestamp formatter.");
assert(!healthMarkup.includes("formatDateTimeForDisplay"), "Grow Intelligence Health must not reference the removed date formatter.");
assert(!healthMarkup.includes("Math.round") && !healthMarkup.includes("getGrowIntelligenceEngineAttributionStatus"), "Health UI must not calculate GIE quality classifications.");
assert(!healthMarkup.includes("data-repair") && !healthMarkup.includes("data-delete") && !healthMarkup.includes("data-override"), "Health UI must remain read-only.");

assert(docs.includes("Raw Operational Data") && docs.includes("Canonical Grow Session Lifecycle Resolver") && docs.includes("Canonical Versioned Analytics Payload"), "Architecture documentation is missing the permanent data flow.");
assert(docs.includes("data_quality_score = round(100 - sum(category deductions))"), "Architecture documentation is missing the scoring formula.");
assert(docs.includes("#admin/data-health") && docs.includes("#admin/grow-intelligence-health"), "Architecture documentation must describe route compatibility.");
assert(docs.includes("System Health and Data Quality remain separate"), "Architecture documentation must distinguish system health from data quality.");

console.log("Grow Intelligence Health regression checks passed.");
