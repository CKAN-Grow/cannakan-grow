const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

function requireNeedle(needle, label = needle) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing profile setup optional-settings behavior: ${label}`);
  }
}

function rejectNeedle(needle, label = needle) {
  if (appSource.includes(needle)) {
    throw new Error(`Found obsolete profile setup warning behavior: ${label}`);
  }
}

requireNeedle("const requireOptionalSettingsPersistence = !isSetupMode;");
requireNeedle("requirePersistence: requireOptionalSettingsPersistence,");
requireNeedle("[Cannakan Profile] Optional notification preferences save failed.");
requireNeedle("[Cannakan Profile] Optional public profile settings save failed.");
requireNeedle("Notification preferences unavailable during profile setup; using safe local defaults.");
requireNeedle("Community profile settings unavailable during profile setup; using safe local defaults.");
requireNeedle("appState.notificationPreferences = syncUserNotificationPreferencesCache(");
requireNeedle("appState.profilePageSettings = syncProfilePageSettingsCache(");
requireNeedle("if (!isSetupMode) {\n          warnings.push(`Profile saved, but notification preferences could not be saved:");
requireNeedle("if (!isSetupMode) {\n          const publicMessage = getPublicMemberProfileSaveErrorMessage(error, error.message || \"Unknown settings error.\");");

rejectNeedle("Profile saved, but public profile or notification preferences could not be saved");
rejectNeedle("debugContext: \"profile-editor-notification-settings\"");

console.log("Profile setup optional-settings regression check passed.");
