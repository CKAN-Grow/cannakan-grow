const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function getFunctionBody(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert(start >= 0, `Missing ${functionName}`);
  const braceStart = source.indexOf("{", start);
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(braceStart + 1, index);
      }
    }
  }
  throw new Error(`Could not parse ${functionName}`);
}

function getBetween(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert(start >= 0, `Missing ${startNeedle}`);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert(end > start, `Missing ${endNeedle}`);
  return source.slice(start, end);
}

const lifecycleBody = getFunctionBody(app, "normalizeGrowSessionLifecycleState");
const badgeBody = getFunctionBody(app, "getSessionCommandCenterStageBadge");
const listMarkupBody = getBetween(
  app,
  "function renderMySessionsCommandCenterListMarkup",
  "function renderMySessionsCommandCenterMetricsMarkup",
);

assert(app.includes("function getSessionDisplayStatus"), "Missing canonical session display status helper.");
assert(app.includes("function hasSessionOfficialStart"), "Missing saved-session start detector.");
assert(
  lifecycleBody.includes("hasSessionOfficialStart(session)") && lifecycleBody.includes('return "active";'),
  "Saved sessions with official start timestamps must normalize to active.",
);
assert(
  badgeBody.includes("return getSessionDisplayStatus(session);"),
  "Command Center stage badges must use the canonical display status helper.",
);
assert(
  listMarkupBody.includes("session-command-session-focus"),
  "Active Session cards should use compact Current/Next focus rows.",
);
assert(
  !listMarkupBody.includes("<b>Elapsed:</b>"),
  "Active Session cards should not duplicate elapsed time from the Stage Progress panel.",
);
assert(
  !listMarkupBody.includes("session-command-session-strain"),
  "Active Session cards should not duplicate seed/variety detail from the Stage Progress panel.",
);
assert(
  css.includes(".session-command-stage-badge.is-active") && css.includes(".session-command-stage-badge.is-in-progress"),
  "Active/In Progress Command Center badges need explicit non-inactive styling.",
);
assert(
  css.includes(".session-command-session-focus"),
  "Missing compact Active Session card focus styling.",
);

console.log("Active Sessions card/status regression checks passed.");
