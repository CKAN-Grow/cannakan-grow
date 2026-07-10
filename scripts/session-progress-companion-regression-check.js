const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const kanCompanionHeroAssetPath = path.join(repoRoot, "public", "assets", "images", "methods", "kan-grow-companion-hero.png");
const methodCompanionBackgroundFiles = Object.freeze([
  "kan-grow-companion-bg.png",
  "paper-towel-grow-companion-bg.png",
  "rockwool-grow-companion-bg.png",
  "starter-plug-grow-companion-bg.png",
  "glass-grow-companion-bg.png",
  "direct-sow-grow-companion-bg.png",
  "other-grow-companion-bg.png",
]);
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
const nextActionDisplaySource = getFunctionSource(appSource, "getSessionProgressCompanionNextActionDisplay");
const lifecycleUpdaterSource = getFunctionSource(appSource, "updateSessionLifecycleTimeline");
const companionScrollSource = getFunctionSource(appSource, "requestSessionProgressCompanionCurrentStepScroll");
const sessionTimeDisplaySource = getFunctionSource(appSource, "getSessionEngineSessionTimeDisplay");
const homeRendererSource = getFunctionSource(appSource, "renderHome");
const commandCenterListSource = getFunctionSource(appSource, "renderMySessionsCommandCenterListMarkup");
const commandCenterSectionSource = getFunctionSource(appSource, "renderMySessionsCommandCenterSectionMarkup");
const commandCenterMountSource = getFunctionSource(appSource, "mountSharedSessionCommandCenter");

if (!fs.existsSync(kanCompanionHeroAssetPath)) {
  throw new Error("KAN Grow Companion hero background asset is missing.");
}

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
  "companionHeroBackgroundAttributes",
  "data-method-companion-bg-src",
  "data-method-companion-bg-position",
].forEach((needle) => {
  if (!rendererSource.includes(needle)) {
    throw new Error(`Session Progress companion renderer is missing: ${needle}`);
  }
});

[
  'const GROW_COMPANION_METHOD_BACKGROUND_BASE = "/assets/images/images/methods";',
  "const KAN_GROW_COMPANION_HERO_BACKGROUND = `${GROW_COMPANION_METHOD_BACKGROUND_BASE}/kan-grow-companion-bg.png`;",
  "const PAPER_TOWEL_GROW_COMPANION_HERO_BACKGROUND = `${GROW_COMPANION_METHOD_BACKGROUND_BASE}/paper-towel-grow-companion-bg.png`;",
  "const ROCKWOOL_GROW_COMPANION_HERO_BACKGROUND = `${GROW_COMPANION_METHOD_BACKGROUND_BASE}/rockwool-grow-companion-bg.png`;",
  "const STARTER_PLUG_GROW_COMPANION_HERO_BACKGROUND = `${GROW_COMPANION_METHOD_BACKGROUND_BASE}/starter-plug-grow-companion-bg.png`;",
  "const GLASS_GROW_COMPANION_HERO_BACKGROUND = `${GROW_COMPANION_METHOD_BACKGROUND_BASE}/glass-grow-companion-bg.png`;",
  "const DIRECT_SOW_GROW_COMPANION_HERO_BACKGROUND = `${GROW_COMPANION_METHOD_BACKGROUND_BASE}/direct-sow-grow-companion-bg.png`;",
  "const OTHER_GROW_COMPANION_HERO_BACKGROUND = `${GROW_COMPANION_METHOD_BACKGROUND_BASE}/other-grow-companion-bg.png`;",
  "const GROW_COMPANION_METHOD_BACKGROUNDS = Object.freeze({",
  "KAN: KAN_GROW_COMPANION_HERO_BACKGROUND",
  "TRA: KAN_GROW_COMPANION_HERO_BACKGROUND",
  "PAPER_TOWEL: PAPER_TOWEL_GROW_COMPANION_HERO_BACKGROUND",
  "WATER_SOAK: GLASS_GROW_COMPANION_HERO_BACKGROUND",
  "ROCKWOOL: ROCKWOOL_GROW_COMPANION_HERO_BACKGROUND",
  "RAPID_ROOTER: STARTER_PLUG_GROW_COMPANION_HERO_BACKGROUND",
  "DIRECT_SOW: DIRECT_SOW_GROW_COMPANION_HERO_BACKGROUND",
  "OTHER: OTHER_GROW_COMPANION_HERO_BACKGROUND",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.KAN",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.PAPER_TOWEL",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.ROCKWOOL",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.RAPID_ROOTER",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.WATER_SOAK",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.DIRECT_SOW",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.OTHER",
  "function preloadMethodCompanionBackground",
  "function hydrateMethodCompanionBackgrounds",
  "hydrateMethodCompanionBackgrounds(summaryElement)",
].forEach((needle) => {
  if (!appSource.includes(needle)) {
    throw new Error(`Method visual theme should expose method-specific hero backgrounds: ${needle}`);
  }
});

[
  'if (normalizedValue === "KAN_SYSTEM")',
  'normalizedValue === "TRA_SYSTEM"',
  'normalizedValue === "GLASS"',
  'normalizedValue === "CUSTOM_METHOD"',
].forEach((needle) => {
  if (!appSource.includes(needle)) {
    throw new Error(`Method normalization should support stored display names for companion backgrounds: ${needle}`);
  }
});

methodCompanionBackgroundFiles.forEach((fileName) => {
  const publicPath = path.join(repoRoot, "public", "assets", "images", "images", "methods", fileName);
  const localPath = path.join(repoRoot, "Assets", "images", "images", "methods", fileName);
  if (!fs.existsSync(publicPath)) {
    throw new Error(`Method Grow Companion background asset is missing from deployed public path: ${fileName}`);
  }
  if (!fs.existsSync(localPath)) {
    throw new Error(`Method Grow Companion background asset is missing from local /assets path: ${fileName}`);
  }
});

if (rendererSource.includes('<aside class="session-progress-companion-recommendation"')) {
  throw new Error("Recommendation should be integrated into Current Phase, not rendered as a separate side panel.");
}

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
  'renderSessionProgressCompanionMetricMarkup("calendar", "Next Milestone"',
  'renderSessionProgressCompanionMetricMarkup("bell", "Next Reminder"',
  'renderSessionProgressCompanionMetricMarkup("group", "Community Avg."',
  'renderSessionProgressCompanionMetricMarkup("bulb", "Insight"',
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
  "const nextActionDisplay = getSessionProgressCompanionNextActionDisplay(engineState);",
  "renderSessionProgressCompanionMetricMarkup(nextActionDisplay.iconKey, nextActionDisplay.label, nextActionDisplay.value, nextActionDisplay.detail)",
  'renderSessionProgressCompanionMetricMarkup("clock", sessionTimeDisplay.label, sessionTimeDisplay.value, sessionTimeDisplay.detail)',
  '${summaryMetricItems ? `',
].forEach((needle) => {
  if (!rendererSource.includes(needle)) {
    throw new Error(`Grow Companion supporting summary should be consolidated: ${needle}`);
  }
});

[
  'value: "Save Session to begin"',
  'detail: "Automated timing starts after the session is saved."',
  'value: "Session Complete"',
  'detail: "Results recorded."',
  "getSessionEngineActionList(engineState)[0]",
  "engineState.activeMilestone || engineState.nextMilestone",
  "getSessionEngineCurrentStep(engineState)",
  "getSessionProgressCompanionRecommendation(engineState)",
].forEach((needle) => {
  if (!nextActionDisplaySource.includes(needle)) {
    throw new Error(`Next Action display should stay synchronized with Session Engine state: ${needle}`);
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
  "const forceCenter = options.forceCenter === true",
  "const roadmapRect = roadmap.getBoundingClientRect()",
  "const currentStepRect = currentStep.getBoundingClientRect()",
  "const activeStageCenter = (currentStepRect.left - roadmapRect.left) + roadmap.scrollLeft + (currentStepRect.width / 2)",
  "const centeredLeft = activeStageCenter - (roadmap.clientWidth / 2)",
  "Math.max(0, roadmap.scrollWidth - roadmap.clientWidth)",
  "stepStart < visibleStart",
  "stepEnd > visibleEnd",
  "roadmap.scrollTo({ left: Math.min(maxScrollLeft, Math.max(0, targetLeft)), behavior: \"auto\" });",
  "const clippedLeft = nextStepRect.left < nextRoadmapRect.left + visibilityPadding",
  "const clippedRight = nextStepRect.right > nextRoadmapRect.right - visibilityPadding",
  "companionRoadmapResizeBound",
  "requestSessionProgressCompanionCurrentStepScroll(summaryElement, { forceCenter: true });",
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
  ".session-progress-companion-right",
  ".session-progress-companion-roadmap-list",
  ".session-progress-companion-metrics",
  ".session-progress-companion-card.has-method-companion-background .session-progress-companion-right::before",
  ".session-progress-companion-card.has-method-companion-background .session-progress-companion-right::after",
  ".session-progress-companion-card.has-method-companion-background .session-progress-companion-right > *",
  "--method-companion-bg",
  "background-size: cover;",
  "filter: blur(0.75px) saturate(0.9) brightness(0.9);",
  "opacity: 0.88;",
  "linear-gradient(90deg, rgba(3, 10, 8, 0.9) 0%, rgba(3, 10, 8, 0.86) 24%, rgba(3, 10, 8, 0.79) 52%, rgba(3, 10, 8, 0.68) 100%)",
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

[
  ".session-progress-companion-card.has-method-companion-background .session-progress-companion-hero::before",
  ".session-progress-companion-card.has-method-companion-background .session-progress-companion-roadmap::before",
].forEach((needle) => {
  if (stylesSource.includes(needle)) {
    throw new Error(`Method backgrounds should not repeat on individual panels: ${needle}`);
  }
});

[
  'const GROW_COMPANION_METHOD_BACKGROUND_BASE = "/assets/images/images/methods";',
  "const GROW_COMPANION_METHOD_BACKGROUNDS = Object.freeze({",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.KAN",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.PAPER_TOWEL",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.ROCKWOOL",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.RAPID_ROOTER",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.WATER_SOAK",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.DIRECT_SOW",
  "heroBackgroundImage: GROW_COMPANION_METHOD_BACKGROUNDS.OTHER",
  "const normalizedCompanionMethodType = normalizeMethodType(engineState.methodType || engineState.definition?.id || methodName || \"\");",
  'data-method-type="${escapeHtml(normalizedCompanionMethodType)}"',
  "data-method-companion-bg-src",
  "has-method-companion-background",
].forEach((needle) => {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing Session Progress companion method background wiring: ${needle}`);
  }
});

console.log("Session Progress companion regression check passed.");
