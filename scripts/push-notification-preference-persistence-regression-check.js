const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const migrationSource = fs.readFileSync(
  path.join(repoRoot, "supabase", "migrations", "20260606100000_ensure_push_notification_preference_persistence.sql"),
  "utf8",
);

function requireSource(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`Missing ${label}: ${needle}`);
  }
}

[
  "logPushNotificationPersistenceDiagnostics(\"preference:loaded\"",
  "logPushNotificationPersistenceDiagnostics(\"preference:save:readback\"",
  "Notification preferences saved, but Supabase returned a different Push Notifications value.",
  "loadStoredUserNotificationPreferences(appState.user.id)",
  "function synchronizePushNotificationPreferenceWithDevice(reason = \"unspecified\")",
  "synchronizePushNotificationPreferenceWithDevice(`auth:${reason}`)",
  "requirePersistence: true",
  "logPushNotificationPersistenceDiagnostics(\"subscription:saved\"",
].forEach((needle) => requireSource(appSource, needle, "push preference persistence"));

[
  "create table if not exists public.user_notification_preferences",
  "add column if not exists push_notifications_enabled boolean not null default false",
  "create unique index if not exists user_notification_preferences_user_id_key",
  "alter table public.user_notification_preferences enable row level security",
  "create policy \"Users can update their own notification preferences\"",
].forEach((needle) => requireSource(migrationSource, needle, "push preference migration"));

assert(
  !/safelyEnsureUserNotificationPreferences\(appState\.user\),\s*getDefaultNotificationPreferences\(\)/.test(appSource),
  "Auth hydration must not fall back to default pushNotificationsEnabled=false when a local saved preference exists.",
);

console.log("Push notification preference persistence regression check passed.");
