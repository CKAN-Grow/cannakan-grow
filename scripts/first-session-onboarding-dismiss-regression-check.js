const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  }
}

assert(
  appJs.includes('const NEW_SESSION_FIRST_SESSION_DISMISSED_STORAGE_KEY = "cannakanNewSessionFirstSessionDismissed";'),
  "First Session onboarding has a dedicated persisted dismissal key.",
);

assert(
  appJs.includes('String(promptId || "").trim() === "new-session" && isNewSessionFirstSessionHelpDismissed()'),
  "First Session prompt visibility respects the persisted dismissed state.",
);

assert(
  appJs.includes('type="button" class="contextual-onboarding-dismiss" data-onboarding-dismiss="true"'),
  "First Session Dismiss renders as a non-submit button.",
);

assert(
  appJs.includes("event.preventDefault();\n      event.stopPropagation();\n      const tutorialId = button.dataset.onboardingTutorialId || \"\";"),
  "Tutorial actions prevent unrelated propagation while preserving tutorial opening.",
);

assert(
  appJs.includes("openLearnTutorialModal(tutorialId, { source });"),
  "Tutorial buttons still open the Learn tutorial modal.",
);

assert(
  appJs.includes("event.preventDefault();\n    event.stopPropagation();\n    dismissContextualOnboardingPromptElement(promptElement, promptId);"),
  "Direct dismiss action prevents unrelated navigation and uses the shared dismissal helper.",
);

assert(
  appJs.includes("saveContextualOnboardingPromptState(normalizedPromptId, \"dismissed\", normalizedTutorialId);"),
  "Shared dismissal helper persists contextual dismissal.",
);

assert(
  appJs.includes("setNewSessionFirstSessionHelpDismissed(true);"),
  "Dismiss action persists the First Session flag using the Quick Start-style local setting.",
);

assert(
  appJs.includes("function handleContextualOnboardingDelegatedClick(event)") && appJs.includes('document.addEventListener("click", handleContextualOnboardingDelegatedClick, true);'),
  "A delegated capture handler protects First Session dismiss from stale direct bindings.",
);

assert(
  appJs.includes("event.stopImmediatePropagation?.();"),
  "Delegated onboarding clicks stop competing click handlers from keeping the card visible.",
);

assert(
  appJs.includes("function removeContextualOnboardingPromptElement(promptElement)") && appJs.includes("promptElement.hidden = true;") && appJs.includes('promptElement.setAttribute("aria-hidden", "true");'),
  "Dismiss action hides the First Session card immediately.",
);

assert(
  appJs.includes("window.restoreCannakanFirstSessionHelp = restoreNewSessionFirstSessionHelp"),
  "A restore hook exists for a future Settings onboarding preference.",
);

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("First Session onboarding dismiss regression check passed.");
