const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing no-first-session-gate behavior: ${label}`);
  }
}

function rejectNeedle(source, needle, label = needle) {
  if (source.includes(needle)) {
    throw new Error(`Found obsolete first-session gate behavior: ${label}`);
  }
}

requireNeedle(appSource, "function routeRequiresSignedInUser(hash = window.location.hash || \"#home\")");
requireNeedle(appSource, 'return route !== "learn";');
requireNeedle(appSource, 'renderProtectedRouteSignInPrompt();');
requireNeedle(indexSource, 'href="#home" data-profile-welcome-primary>Go to My Grow Home</a>');
requireNeedle(indexSource, 'href="#seed-vault" data-profile-welcome-secondary>Open Seed Vault</a>');
requireNeedle(indexSource, 'href="#new" data-session-entry="true">Start a New Session</a>');

const forbiddenUiPhrases = [
  ["Start your", "first session", "to unlock"].join(" "),
  ["Start", "First", "Session"].join(" "),
  ["full", "Grow experience"].join(" "),
  ["Grow", "Experience", "Locked"].join(" "),
  ["Start My", "First", "Session"].join(" "),
  ["Create Your", "First", "Session"].join(" "),
  "function isFirstSessionAccessGateActive",
  "function isFirstSessionLockedRouteHash",
  "function getFirstSessionAccessLockStateForHash",
  "function isGrowNetworkUnlocked",
  "function isCommunityGrowUnlocked",
];

for (const forbidden of forbiddenUiPhrases) {
  rejectNeedle(appSource, forbidden);
  rejectNeedle(indexSource, forbidden);
}

console.log("Home no-first-session-gate regression check passed.");
