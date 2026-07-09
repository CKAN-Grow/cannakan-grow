const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
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
  "@media (max-width: 720px)",
].forEach((needle) => {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing Session Progress companion style: ${needle}`);
  }
});

console.log("Session Progress companion regression check passed.");
