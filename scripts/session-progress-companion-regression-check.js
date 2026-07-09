const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8").replace(/\r\n/g, "\n");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8").replace(/\r\n/g, "\n");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");

function getFunctionSource(source, functionName) {
  const startNeedle = `function ${functionName}`;
  const startIndex = source.indexOf(startNeedle);
  if (startIndex === -1) {
    throw new Error(`Missing function ${functionName}.`);
  }
  const nextFunctionIndex = source.indexOf("\nfunction ", startIndex + startNeedle.length);
  return source.slice(startIndex, nextFunctionIndex === -1 ? source.length : nextFunctionIndex);
}

const rendererSource = getFunctionSource(appSource, "renderSessionProgressCommandCenterMarkup");
const roadmapSource = getFunctionSource(appSource, "renderSessionProgressCompanionRoadmapMarkup");

function getMarkupSlice(startNeedle, endNeedle) {
  const startIndex = indexSource.indexOf(startNeedle);
  if (startIndex === -1) {
    throw new Error(`Missing markup start: ${startNeedle}`);
  }
  const endIndex = indexSource.indexOf(endNeedle, startIndex);
  if (endIndex === -1) {
    throw new Error(`Missing markup end after ${startNeedle}: ${endNeedle}`);
  }
  return indexSource.slice(startIndex, endIndex);
}

const sessionLifecycleSection = getMarkupSlice(
  'id="session-lifecycle-section"',
  'id="session-timing-section"',
);
const detailLifecycleSection = getMarkupSlice(
  'id="detail-lifecycle-section"',
  '<section class="session-workspace-content">',
);

if (!sessionLifecycleSection.includes("session-lifecycle-section--companion")) {
  throw new Error("New Session lifecycle host should be flattened for the Grow Companion panel.");
}

if (!detailLifecycleSection.includes("session-lifecycle-section--companion")) {
  throw new Error("Detail lifecycle host should be flattened for the Grow Companion panel.");
}

[
  sessionLifecycleSection,
  detailLifecycleSection,
].forEach((sectionSource, index) => {
  if (sectionSource.includes("progress-chart-heading") || sectionSource.includes(">Timeline<") || sectionSource.includes("section-title-icon")) {
    throw new Error(`Lifecycle companion host ${index + 1} still contains the old outer Timeline / Session Progress header.`);
  }
});

[
  "session-progress-companion-card",
  "session-progress-companion-ring",
  "session-progress-companion-hero",
  "session-progress-companion-recommendation",
  "session-progress-companion-roadmap",
  "session-progress-companion-metrics",
  "session-progress-companion-reminder",
  "getSessionEngineVisualTimelineTheme(engineState)",
  "renderSessionProgressCompanionRoadmapMarkup(engineState)",
  'data-session-reminders-manage="true"',
].forEach((needle) => {
  if (!rendererSource.includes(needle)) {
    throw new Error(`Session Progress companion renderer is missing: ${needle}`);
  }
});

if (!appSource.includes("navigateToProfilePreferences();")) {
  throw new Error("Manage Reminders should route to notification preferences.");
}

[
  "<dt>Current Phase</dt>",
  "<dt>Elapsed</dt>",
  "<dt>Next Milestone</dt>",
  "<dt>Expected Completion</dt>",
  "<dt>Overdue Status</dt>",
  "<dt>Required Action</dt>",
  "Timeline Steps",
  "session-progress-command-card",
].forEach((needle) => {
  if (rendererSource.includes(needle)) {
    throw new Error(`Session Progress companion renderer still contains old dashboard markup: ${needle}`);
  }
});

if (!roadmapSource.includes("engineState?.timelineSteps")) {
  throw new Error("Companion roadmap must render from Session Engine timelineSteps.");
}

[
  ".session-progress-companion-card",
  ".session-progress-companion-ring",
  ".session-progress-companion-hero",
  ".session-progress-companion-recommendation",
  ".session-progress-companion-roadmap-list",
  ".session-progress-companion-metrics",
  ".session-progress-companion-reminder",
  ".session-lifecycle-section--companion",
  "@media (max-width: 720px)",
].forEach((needle) => {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing Session Progress companion style: ${needle}`);
  }
});

console.log("Session Progress companion regression check passed.");
