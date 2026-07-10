const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");
const stylesCss = fs.readFileSync(path.join(root, "styles.css"), "utf8");

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  }
}

assert(
  indexHtml.includes('data-new-session-quick-start-dismiss="true"'),
  "Quick Start Help includes a persisted dismiss button.",
);

assert(
  indexHtml.includes("contextual-onboarding-dismiss new-session-quick-start-dismiss"),
  "Quick Start dismiss button reuses the First Session dismiss styling.",
);

assert(
  appJs.includes("NEW_SESSION_QUICK_START_DISMISSED_STORAGE_KEY"),
  "Quick Start dismissed state has a dedicated storage key.",
);

assert(
  appJs.includes("setNewSessionQuickStartHelpDismissed(true)") && appJs.includes("quickStartSection.hidden = true"),
  "Dismiss action persists the state and hides the Quick Start section.",
);

assert(
  appJs.includes("window.restoreCannakanQuickStartHelp = restoreNewSessionQuickStartHelp"),
  "A restore hook exists for a future Settings onboarding preference.",
);

assert(
  appJs.includes("firstSessionPromptAnchor") && appJs.includes("!quickStartHelpSection.hidden"),
  "First Session onboarding anchor avoids the dismissed Quick Start section.",
);

assert(
  stylesCss.includes(".new-session-quick-start-dismiss") && stylesCss.includes("grid-template-columns: repeat(2, minmax(0, 1fr)) auto"),
  "Quick Start dismiss button is aligned with the tutorial action row.",
);

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("New Session Quick Start dismiss regression check passed.");
