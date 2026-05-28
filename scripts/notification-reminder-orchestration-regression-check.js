const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const reminderRunnerSource = fs.readFileSync(path.join(repoRoot, "api", "grow-reminders-run.js"), "utf8");
const pushSendSource = fs.readFileSync(path.join(repoRoot, "api", "push-send.js"), "utf8");
const reminderActionSource = fs.readFileSync(path.join(repoRoot, "api", "grow-reminder-action.js"), "utf8");

function requireSource(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`Missing ${label}: ${needle}`);
  }
}

[
  "function shouldSuppressManagedAppNotification(notification = {})",
  "function isStageProgressReminderSuppressed(session = null, reminder = null, eventKey = \"\")",
  "function dedupeGrowReminderNotifications(notifications = [])",
  "return dedupeGrowReminderNotifications(dueNotifications);",
  "pushEventAlreadyDelivered",
  "excludeEndpoints",
  "markPushNotificationEventDelivered(eventKey);",
  "This notification points to a session that is no longer available.",
  "const PUSH_NOTIFICATION_SNOOZE_ACTION_OPTIONS = Object.freeze([\"30m\", \"1h\", \"2h\", \"tonight\", \"tomorrow-morning\"]);",
].forEach((needle) => requireSource(appSource, needle, "app notification orchestration"));

[
  "const STALE_PUSH_SUBSCRIPTION_STATUSES = new Set([\"failed\", \"invalid\", \"rejected\", \"expired\", \"stale\", \"removed\"]);",
  "const PUSH_DELIVERY_SUCCESS_STATUSES = new Set([\"sent\", \"delivered\", \"test-sent\"]);",
  "function dedupePushSubscriptionsForDelivery(records = [])",
  "function loadExistingPushDeliveries(userId, eventKey, config)",
  "alreadyDeliveredDeviceKeys.has(subscriptionRecord.deviceKey) || alreadyDeliveredEndpoints.has(subscriptionRecord.endpoint)",
  "skipReason: \"duplicate-device-delivery\"",
  "summary.duplicatesPrevented += Number(deliveryResult.duplicatesPrevented || 0);",
  "const PUSH_NOTIFICATION_SNOOZE_ACTION_OPTIONS = Object.freeze([\"30m\", \"1h\", \"2h\", \"tonight\", \"tomorrow-morning\"]);",
].forEach((needle) => requireSource(reminderRunnerSource, needle, "grow reminder runner orchestration"));

[
  "const STALE_PUSH_SUBSCRIPTION_STATUSES = new Set([\"failed\", \"invalid\", \"rejected\", \"expired\", \"stale\", \"removed\"]);",
  "const PUSH_DELIVERY_SUCCESS_STATUSES = new Set([\"sent\", \"delivered\", \"test-sent\"]);",
  "function dedupePushSubscriptionsForDelivery(records = [])",
  "select=device_key,status,endpoint",
  "excludedEndpoints.has(record.endpoint)",
  "alreadyDeliveredDeviceKeys.has(record.deviceKey) || alreadyDeliveredEndpoints.has(record.endpoint)",
].forEach((needle) => requireSource(pushSendSource, needle, "push send orchestration"));

[
  "const GROW_SESSIONS_TABLE = \"grow_sessions\";",
  "case \"2h\":",
  "function loadOwnedSessionForReminderAction(userId, sessionId, config)",
  "sessionStatus === \"completed\"",
  "Reminder session is no longer available.",
].forEach((needle) => requireSource(reminderActionSource, needle, "reminder action integrity"));

assert(
  !/attempt-\$\{normalizedAttemptCount\}|attempt-\$\{attemptCount\}/.test(reminderRunnerSource),
  "Reminder event keys must stay stable across retry attempts.",
);

console.log("Notification reminder orchestration regression check passed.");
