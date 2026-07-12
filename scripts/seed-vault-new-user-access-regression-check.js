const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Seed Vault new-user access behavior: ${label}`);
  }
}

function rejectNeedle(source, needle, label = needle) {
  if (source.includes(needle)) {
    throw new Error(`Found obsolete Seed Vault access gate behavior: ${label}`);
  }
}

requireNeedle(appSource, "function routeRequiresSignedInUser(hash = window.location.hash || \"#home\")");
requireNeedle(appSource, 'return route !== "learn";', "signed-in routes are auth-only outside Learn");
requireNeedle(appSource, 'route === "seed-vault"', "Seed Vault route still exists");
requireNeedle(appSource, "Your Seed Vault is your private seed management and planning space.");
requireNeedle(appSource, "Add Your First Seed");
requireNeedle(appSource, "Explore Sources");
requireNeedle(stylesSource, ".seed-vault-empty-state-actions");

[
  "function routeAllowsIncompleteProfile",
  "routeAllowsIncompleteProfile",
  "appState.user && !hasCompletedProfile()",
  "!hasCompletedProfile() &&",
  "function isFirstSessionAccessGateActive",
  "function isFirstSessionLockedRouteHash",
  "function getFirstSessionAccessLockStateForHash",
  "hasFirstSavedGrowSessionForAccessUnlock",
].forEach((needle) => rejectNeedle(appSource, needle));

console.log("Seed Vault new-user access regression check passed.");
