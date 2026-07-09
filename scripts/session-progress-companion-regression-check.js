const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8").replace(/\r\n/g, "\n");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8").replace(/\r\n/g, "\n");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");

function getFunctionSource(source, functionName) {
  const startNeedle = `function ${functionName}(`;
  const startIndex = source.indexOf(startNeedle);
  if (startIndex === -1) {
    throw new Error(`Missing function ${functionName}.`);
  }
  const nextFunctionIndex = source.indexOf("\nfunction ", startIndex + startNeedle.length);
  return source.slice(startIndex, nextFunctionIndex === -1 ? source.length : nextFunctionIndex);
}

const rendererSource = getFunctionSource(appSource, "renderSessionProgressCommandCenterMarkup");
const roadmapSource = getFunctionSource(appSource, "renderSessionProgressCompanionRoadmapMarkup");
const lifecycleUpdaterSource = getFunctionSource(appSource, "updateSessionLifecycleTimeline");
const companionScrollSource = getFunctionSource(appSource, "requestSessionProgressCompanionCurrentStepScroll");
const sessionTimeDisplaySource = getFunctionSource(appSource, "getSessionEngineSessionTimeDisplay");
const homeRendererSource = getFunctionSource(appSource, "renderHome");
const commandCenterListSource = getFunctionSource(appSource, "renderMySessionsCommandCenterListMarkup");
const commandCenterSectionSource = getFunctionSource(appSource, "renderMySessionsCommandCenterSectionMarkup");
const commandCenterMountSource = getFunctionSource(appSource, "mountSharedSessionCommandCenter");

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
  'id="partition-progress-section"',
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
  'id="session-timing-section"',
  'id="detail-timing-section"',
  'id="session-timing-title"',
  'id="detail-timing-title"',
].forEach((needle) => {
  if (indexSource.includes(needle)) {
    throw new Error(`Obsolete lower timing/timeline section should not render: ${needle}`);
  }
});

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
  "getSessionEngineSessionTimeDisplay(engineState)",
  "getSessionEngineVisualTimelineTheme(engineState)",
  "renderSessionProgressCompanionRoadmapMarkup(engineState)",
].forEach((needle) => {
  if (!rendererSource.includes(needle)) {
    throw new Error(`Session Progress companion renderer is missing: ${needle}`);
  }
});

if (rendererSource.includes('<aside class="session-progress-companion-recommendation"')) {
  throw new Error("Recommendation should be integrated into Current Phase, not rendered as a separate side panel.");
}

[
  "const showReminder = options.showReminder !== false",
  "showReminder && hasReminder",
].forEach((needle) => {
  if (!rendererSource.includes(needle)) {
    throw new Error(`Session Progress companion reminder visibility is missing: ${needle}`);
  }
});

[
  'sectionElement.closest?.("#session-form")',
  "renderOptions.showReminder = false",
].forEach((needle) => {
  if (!lifecycleUpdaterSource.includes(needle)) {
    throw new Error(`New Session should suppress specific reminder cards before save: ${needle}`);
  }
});

[
  "hideWhenNoActive: true",
  "showMetrics: false",
  "showSupply: false",
  "sessionActionLabel: \"Open Session\"",
].forEach((needle) => {
  if (!homeRendererSource.includes(needle)) {
    throw new Error(`Home should mount compact active reminder sessions only after save: ${needle}`);
  }
});

[
  "getSessionCommandCenterNextReminderMeta(session)",
  "getSessionCommandCenterPhaseLabel(session)",
  "getSessionCommandCenterElapsedLabel(session)",
  "getSessionCommandCenterMethodSummary(session)",
  "session-command-session-reminder",
  "reminderMeta.timeLabel || reminderMeta.countdown",
].forEach((needle) => {
  if (!commandCenterListSource.includes(needle)) {
    throw new Error(`Home active session cards should include reminder fields: ${needle}`);
  }
});

if (!commandCenterSectionSource.includes("showSupply ? renderSessionCommandCenterFilterPaperSupplyMarkup() : \"\"")) {
  throw new Error("Home should be able to hide supply management from the active reminder section.");
}

[
  "options.hideWhenNoActive",
  "host.hidden = true",
  "sessionActionLabel: options.sessionActionLabel",
].forEach((needle) => {
  if (!commandCenterMountSource.includes(needle)) {
    throw new Error(`Shared command center mount should support Home active reminder behavior: ${needle}`);
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
  "Est. Completion",
  "Estimated completion",
  "<dt>Overdue Status</dt>",
  "<dt>Required Action</dt>",
  "Timeline Steps",
  "session-progress-command-card",
].forEach((needle) => {
  if (rendererSource.includes(needle)) {
    throw new Error(`Session Progress companion renderer still contains old dashboard markup: ${needle}`);
  }
});

[
  'renderSessionProgressCompanionMetricMarkup("clock", "Elapsed Time"',
  'renderSessionProgressCompanionMetricMarkup("drop", "Next Check"',
  "No reminder scheduled",
  "Reminders will appear when the Session Engine schedules one.",
  "session-progress-companion-reminder",
].forEach((needle) => {
  if (rendererSource.includes(needle)) {
    throw new Error(`Grow Companion should not repeat data already shown elsewhere: ${needle}`);
  }
});

[
  "const summaryMetricItems = [",
  "milestone",
  'renderSessionProgressCompanionMetricMarkup("calendar", "Next Milestone", milestoneTitle, milestoneTime)',
  'renderSessionProgressCompanionMetricMarkup("bell", "Next Reminder", milestoneTime, reminderPurpose || "Review the next session milestone.")',
  'renderSessionProgressCompanionMetricMarkup("clock", sessionTimeDisplay.label, sessionTimeDisplay.value, sessionTimeDisplay.detail)',
  '${summaryMetricItems ? `',
].forEach((needle) => {
  if (!rendererSource.includes(needle)) {
    throw new Error(`Grow Companion supporting summary should be consolidated: ${needle}`);
  }
});

[
  "label: \"Total Session Time\"",
  "getElapsedDurationMs(startedAt, completedAt)",
  "label: \"Est. Session Time\"",
  "formatSessionEngineWindowOffsetLabel(engineState)",
  "Based on completed sessions",
  "Typical method range",
].forEach((needle) => {
  if (!sessionTimeDisplaySource.includes(needle)) {
    throw new Error(`Session time display helper is missing: ${needle}`);
  }
});

if (!roadmapSource.includes("engineState?.timelineSteps")) {
  throw new Error("Companion roadmap must render from Session Engine timelineSteps.");
}

[
  'data-current-roadmap-step="true"',
  'data-roadmap-step-key="${escapeHtml(step.key || `step-${index}`)}"',
].forEach((needle) => {
  if (!roadmapSource.includes(needle)) {
    throw new Error(`Companion roadmap should mark current steps for auto-scroll: ${needle}`);
  }
});

[
  '.session-progress-companion-roadmap',
  "[data-current-roadmap-step='true']",
  "timelineSignature",
  "previousSignature === timelineSignature",
  "currentStep.offsetLeft + (currentStep.offsetWidth / 2) - (roadmap.clientWidth / 2)",
  "Math.max(0, roadmap.scrollWidth - roadmap.clientWidth)",
  "stepStart < visibleStart",
  "stepEnd > visibleEnd",
  "roadmap.scrollTo({ left: Math.min(maxScrollLeft, Math.max(0, targetLeft)), behavior: \"auto\" });",
  "companionRoadmapUserScrolled",
].forEach((needle) => {
  if (!companionScrollSource.includes(needle)) {
    throw new Error(`Missing companion current-step auto-scroll behavior: ${needle}`);
  }
});

[
  "requestSessionProgressCompanionCurrentStepScroll(summaryElement",
  "previousScrollLeft",
  "preserveUserScroll",
].forEach((needle) => {
  if (!lifecycleUpdaterSource.includes(needle)) {
    throw new Error(`Lifecycle updater should preserve user scroll while centering current companion step: ${needle}`);
  }
});

[
  ".session-progress-companion-card",
  ".session-progress-companion-ring",
  ".session-progress-companion-hero",
  ".session-progress-companion-recommendation",
  ".session-progress-companion-roadmap-list",
  ".session-progress-companion-metrics",
  ".session-command-session-reminder",
  ".session-command-session-reminder-time",
  ".session-lifecycle-section--companion",
  "grid-template-columns: 1fr;",
  "grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));",
  "width: min(100%, 640px);",
  "border: 1px solid color-mix(in srgb, var(--session-companion-accent) 18%, transparent);",
  "background: color-mix(in srgb, var(--session-companion-accent) 7%, rgba(255, 255, 255, 0.024));",
  "box-shadow: none;",
  "scroll-padding-inline: 50%",
  "@media (max-width: 720px)",
].forEach((needle) => {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing Session Progress companion style: ${needle}`);
  }
});

console.log("Session Progress companion regression check passed.");
