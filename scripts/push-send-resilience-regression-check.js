const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const appJs = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const pushSendApi = fs.readFileSync(path.join(rootDir, "api", "push-send.js"), "utf8");
const migration = fs.readFileSync(
  path.join(rootDir, "supabase", "migrations", "20260526102000_ensure_push_delivery_tables.sql"),
  "utf8",
);

const requiredAppSnippets = [
  "PUSH_SEND_FAILURES_STORAGE_KEY",
  "PUSH_SEND_MAX_ATTEMPTS",
  "shouldSkipBackendPushSendForEvent(eventKey)",
  "recordBackendPushSendFailure(eventKey",
  "recordBackendPushSendSkip(eventKey",
  "clearBackendPushSendFailure(eventKey)",
  "Push delivery is temporarily unavailable; background reminders will retry later.",
];

const requiredApiSnippets = [
  "createRequestError(",
  "safeUpsertPushDeliveryRecord(",
  "safeDeletePushSubscriptionRecord(",
  "push_preferences_unavailable",
  "push_subscriptions_unavailable",
  "deliveryLogAvailable = false",
  "responseStatus = statusCode >= 400 && statusCode < 500 ? statusCode : 503",
];

const requiredMigrationSnippets = [
  "create table if not exists public.user_push_subscriptions",
  "create table if not exists public.push_notification_deliveries",
  "alter table public.user_push_subscriptions enable row level security",
  "alter table public.push_notification_deliveries enable row level security",
  "unique (user_id, device_key)",
  "unique (user_id, event_key, device_key)",
];

function assertIncludes(source, snippet, label) {
  if (!source.includes(snippet)) {
    throw new Error(`${label} is missing expected snippet: ${snippet}`);
  }
}

requiredAppSnippets.forEach((snippet) => assertIncludes(appJs, snippet, "app.js"));
requiredApiSnippets.forEach((snippet) => assertIncludes(pushSendApi, snippet, "api/push-send.js"));
requiredMigrationSnippets.forEach((snippet) => assertIncludes(migration, snippet, "push delivery migration"));

if (/return json\(response,\s*500/.test(pushSendApi)) {
  throw new Error("/api/push-send should not return a generic uncaught 500 response.");
}

console.log("Push send resilience regression check passed.");
