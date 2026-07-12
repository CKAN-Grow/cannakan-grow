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

requireNeedle(appSource, "function routeAllowsIncompleteProfile(hash = window.location.hash || \"#home\")");
requireNeedle(appSource, "return route === \"seed-vault\";");
requireNeedle(appSource, "appState.user && !hasCompletedProfile() && !routeAllowsIncompleteProfile");
requireNeedle(appSource, "!hasCompletedProfile() && !routeAllowsIncompleteProfile");
requireNeedle(appSource, "function isFirstSessionAccessGateActive(sessions = getSessions())");
requireNeedle(appSource, "Your Seed Vault is your private seed management and planning space.");
requireNeedle(appSource, "Add Your First Seed");
requireNeedle(appSource, "Explore Sources");
requireNeedle(stylesSource, ".seed-vault-empty-state-actions");

const firstSessionLockMatch = appSource.match(/function isFirstSessionLockedRouteHash[\s\S]*?function getFirstSessionAccessLockStateForHash/);
if (!firstSessionLockMatch) {
  throw new Error("Could not locate first-session access lock helper.");
}

if (firstSessionLockMatch[0].includes('route === "seed-vault"')) {
  throw new Error("Seed Vault must not be locked behind first saved session access.");
}

const firstSessionGateMatch = appSource.match(/function isFirstSessionAccessGateActive\(sessions = getSessions\(\)\) \{[\s\S]*?\n}\n/);
if (!firstSessionGateMatch || !firstSessionGateMatch[0].includes("return false;")) {
  throw new Error("First-session access gate must not block brand-new authenticated users.");
}

console.log("Seed Vault new-user access regression check passed.");
