const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

for (const needle of [
  "function renderHomeSessionDashboardHeroActions(hasSavedGrowSessions = true)",
  "function hydrateHomeSessionDashboardHero({ hasSavedGrowSessions = true } = {})",
  "const shouldShowFirstSessionCta = Boolean(appState.user) && !hasSessionHistory;",
  "hydrateHomeSessionDashboardHero({",
  "hasSavedGrowSessions: !shouldShowFirstSessionCta,",
  'href="#new" data-session-entry="true">Start My First Session</a>',
  'href="#sessions">My Sessions</a>',
  'href="#active-sessions">Active Sessions <span aria-hidden="true">&rarr;</span></a>',
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing first-session Home CTA behavior: ${needle}`);
  }
}

const renderHomeMatch = appSource.match(/function renderHome\(\) \{[\s\S]*?\n}\n\nfunction/);
if (!renderHomeMatch) {
  throw new Error("Could not locate renderHome for first-session CTA regression check.");
}

const renderHomeSource = renderHomeMatch[0];
if (
  renderHomeSource.indexOf("const visibleSessions = getVisibleUserSessions(sessions);")
  > renderHomeSource.indexOf("hydrateHomeSessionDashboardHero({")
) {
  throw new Error("Home hero CTA must be hydrated after visible sessions are calculated.");
}

if (
  renderHomeSource.indexOf("hydrateHomeSessionDashboardHero({")
  > renderHomeSource.indexOf("applySupplyStatusToSessionEntryButtons(app);")
) {
  throw new Error("Supply status should be applied after the first-session CTA is inserted.");
}

console.log("Home first-session CTA regression check passed.");
