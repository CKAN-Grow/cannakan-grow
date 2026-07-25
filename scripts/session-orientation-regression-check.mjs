import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync("app.js", "utf8");
const index = fs.readFileSync("index.html", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const browser = fs.readFileSync("tests/e2e/developer-scenarios.spec.js", "utf8");

assert.match(
  app,
  /function syncSessionOrientationPresentation\(/,
  "Missing Session Orientation synchronization helper.",
);

assert.doesNotMatch(
  app,
  /function getSessionOrientationPresentation\(/,
  "Session Orientation must not introduce a separate presentation model.",
);

const orientationStart = app.indexOf(
  "function syncSessionOrientationPresentation",
);
const orientationEnd = app.indexOf(
  "function buildSessionDetailMetaCards",
);

assert.notEqual(
  orientationStart,
  -1,
  "Missing Session Orientation boundary.",
);

assert.notEqual(
  orientationEnd,
  -1,
  "Missing Session Orientation end boundary.",
);

const orientationSlice = app.slice(
  orientationStart,
  orientationEnd,
);

assert.match(
  orientationSlice,
  /formatSessionCommandCenterDayLabel\(session\)/,
  "Current Day must reuse canonical Session day presentation.",
);

assert.match(
  orientationSlice,
  /getSessionLifecyclePresentation\(session\)/,
  "Current Stage must reuse canonical lifecycle presentation.",
);

assert.match(
  orientationSlice,
  /buildSessionEngineState\(session\)/,
  "Stage Progress must reuse canonical Session Engine state.",
);

assert.match(
  orientationSlice,
  /engineState\?\.progressPercentage/,
  "Stage Progress must consume the canonical progress percentage.",
);

assert.doesNotMatch(
  orientationSlice,
  /Object\.freeze\(/,
  "Orientation must not create an independent presentation object.",
);

assert.doesNotMatch(
  orientationSlice,
  /Date\.now\(|getTime\(|24\s*\*\s*60\s*\*\s*60/,
  "Orientation must not introduce an independent time or progress calculation.",
);

assert.doesNotMatch(
  app,
  /startSessionTimer\(\(\) => \{\s*syncSessionOrientationPresentation\(detail, session\);/,
  "Orientation must not couple presentation synchronization to the Session timer.",
);

assert.match(
  app,
  /syncSessionIdentityPresentation\(detail, session\);\s*syncSessionOrientationPresentation\(detail, session\);/,
  "Orientation must reuse the canonical Session detail render/update path.",
);

const markupStart = index.indexOf(
  '<section id="detail-session-orientation"',
);

const markupEnd = index.indexOf(
  "</section>",
  markupStart,
);

assert.notEqual(
  markupStart,
  -1,
  "Missing Session Orientation markup.",
);

assert.notEqual(
  markupEnd,
  -1,
  "Session Orientation markup is incomplete.",
);

const orientationMarkup = index.slice(
  markupStart,
  markupEnd + "</section>".length,
);

for (const label of [
  "Current Day",
  "Current Stage",
  "Stage Progress",
]) {
  assert.match(
    orientationMarkup,
    new RegExp(label),
    `Missing Orientation label: ${label}`,
  );
}

for (const id of [
  "detail-session-orientation",
  "detail-session-orientation-day",
  "detail-session-orientation-stage",
  "detail-session-orientation-progress",
  "detail-session-orientation-progressbar",
]) {
  assert.match(
    orientationMarkup,
    new RegExp(`id="${id}"`),
    `Missing Orientation element: ${id}`,
  );
}

assert.doesNotMatch(
  orientationMarkup,
  /Overall Session Progress/i,
  "Orientation must not introduce Overall Session Progress.",
);

for (const forbidden of [
  "health",
  "confidence",
  "objective",
  "priority",
  "recommendation",
]) {
  assert.equal(
    `${orientationMarkup}\n${orientationSlice}`
      .toLowerCase()
      .includes(forbidden),
    false,
    `Session Orientation exceeds its product boundary: ${forbidden}`,
  );
}

for (const forbidden of [
  "localStorage",
  "sessionStorage",
  ".from(",
  ".insert(",
  ".update(",
  ".upsert(",
]) {
  assert.equal(
    orientationSlice.includes(forbidden),
    false,
    `Session Orientation must not introduce persistence: ${forbidden}`,
  );
}

assert.match(
  styles,
  /\.session-orientation-grid[\s\S]*?grid-template-columns: repeat\(3/,
  "Orientation must present three scannable values on wider screens.",
);

assert.match(
  styles,
  /@media \(max-width: 520px\)[\s\S]*?\.session-orientation-grid/,
  "Orientation must support narrow screens.",
);

assert.match(
  browser,
  /renders canonical Session Identity and Orientation without stale state at 390px, 768px, and 1280px/,
  "Missing observable Session Orientation browser coverage.",
);

assert.match(
  browser,
  /preserves canonical Stage Progress without presentation normalization/,
  "Missing behavioral proof that Orientation presents canonical Stage Progress unchanged.",
);

console.log("Session Orientation regression check passed.");