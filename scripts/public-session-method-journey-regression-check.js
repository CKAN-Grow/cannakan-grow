const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing public Method Journey behavior: ${label}`);
  }
}

function forbidNeedle(source, needle, label = needle) {
  if (source.includes(needle)) {
    throw new Error(`Obsolete public Method Journey behavior remains: ${label}`);
  }
}

[
  "function buildPublicSessionJourneyEngineState({",
  "return buildSessionEngineState(sessionRecord, {",
  "function buildPublicSessionJourneyEvents(state = {})",
  "state.engineState.timelineSteps.filter",
  "const useFirstGerminatedEvent = Boolean(firstPlantedAt && isPublicJourneyCheckStep(step));",
  "label: getPublicJourneyDisplayLabel(step, { firstGerminated: useFirstGerminatedEvent }),",
  "engineState: buildPublicSessionJourneyEngineState({",
].forEach((needle) => requireNeedle(appSource, needle));

[
  "const germinationDurationEndAt = state.firstPlantedAt || state.completedAt;",
  "const events = [\n    {\n      label: \"Started\",",
  "label: \"Soaking\",\n      timeLabel: state.startedAt ? formatPublicJourneyTimestamp(state.startedAt) : \"Not shared\",",
  "label: \"Germination\",\n      timeLabel: formatPublicJourneyTimestamp(state.germinationStartedAt),",
].forEach((needle) => forbidNeedle(appSource, needle));

[
  ".public-session-timeline-section {\n  position: relative;\n  overflow: hidden;\n  display: flex;",
  ".public-session-journey {\n  --journey-rail-left: 29px;\n  --journey-step-count:",
  "display: flex;\n  flex-direction: column;\n  justify-content: space-between;",
  ".public-session-journey-step {\n  --journey-accent: #94d159;",
  "flex: 1 1 0;",
  ".public-session-journey-step--silver",
  ".public-session-journey-step--orange",
  ".public-session-journey-step--cyan",
  ".public-session-journey-step--gray",
].forEach((needle) => requireNeedle(stylesSource, needle));

console.log("Public session Method Journey regression check passed.");
