import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(root, file), "utf8");
const app = read("app.js");
const styles = read("styles.css");
const index = read("index.html");
const tests = read("tests/e2e/developer-scenarios.spec.js");
const docs = read("docs/grow-network-foundation.md");
const migration = read("supabase/migrations/20260718120000_grow_identity_layer_phase1.sql");

const networkRendererStart = app.indexOf("function renderGrowNetworkPage() {");
const profileRendererStart = app.indexOf("function renderMyGrowProfilePage() {");
const networkRenderer = networkRendererStart >= 0 && profileRendererStart > networkRendererStart
  ? app.slice(networkRendererStart, profileRendererStart)
  : "";

const checks = [
  ["authenticated Network and Profile navigation", index.includes('href="#network" data-network-nav hidden>Network</a>') && index.includes('href="#grow-profile" data-profile-nav hidden>Profile</a>')],
  ["canonical Network route", app.includes('if (route === "network")') && app.includes('pageLabel: "Grow Network"') && app.includes("refreshCanonicalGrowNetworkDirectory")],
  ["preserved personal Grow Profile route", app.includes('if (route === "grow-profile")') && app.includes("function renderMyGrowProfilePage()")],
  ["canonical Grow Identity RPC consumption", app.includes('rpc("get_grow_identity_v1"') && app.includes('rpc("search_grow_identities_v1"')],
  ["reciprocal accepted-connection resolver", app.includes("function getCanonicalGrowNetworkConnectionIds") && app.includes("directions.outgoing && directions.incoming")],
  ["viewer-aware server contract", migration.includes("viewer_is_connection := public.grow_identity_is_connection_v1") && migration.includes("profile_record.grow_network_discoverable")],
  ["relationship-focused page content", networkRenderer.includes("My Connections") && networkRenderer.includes("Browse Grow Network by type") && networkRenderer.includes("Discover Growers")],
  ["reusable Grow Identity card contract", app.includes("function renderGrowIdentityCardMarkup") && app.includes('data-grow-identity-card="true"')],
  ["no fabricated requests or social feed", !networkRenderer.includes("data-grow-network-requests") && !networkRenderer.includes("Followers") && !networkRenderer.includes("Likes") && !networkRenderer.includes("togglePublicMemberFollow")],
  ["no permanent Network sidebar", !networkRenderer.includes("sidebar") && styles.includes(".canonical-grow-network")],
  ["privacy-aware scenario coverage", app.includes('"Mika Fields", "GB", "England", "source", "connections", false') && app.includes('"Casey Ridge", "AU", "Victoria", "grower", "personal", false')],
  ["reciprocal Full Grow Demo fixtures", app.includes("profiles.slice(1, 5).flatMap") && app.includes("scenario-full-grow-follow-incoming")],
  ["focused browser regression", tests.includes("Grow Network uses reciprocal Grow Identity connections and privacy-aware discovery") && tests.includes("data-grow-network-metric='connections'")],
  ["foundation documentation", docs.includes("# Grow Network Foundation") && docs.includes("reciprocal") && docs.includes("Requests and pending state")],
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Grow Network foundation regression check failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log(`Grow Network foundation regression check passed (${checks.length}/${checks.length}).`);
