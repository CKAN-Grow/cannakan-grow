const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const reminderSource = fs.readFileSync(path.join(repoRoot, "api", "grow-reminders-run.js"), "utf8");

const requireSource = (source, needle, label) => {
  if (!source.includes(needle)) {
    throw new Error(`Missing ${label}: ${needle}`);
  }
};

[
  "const SESSION_LIFECYCLE_STALE_THRESHOLDS = Object.freeze({",
  "soakingAttentionHours: 24",
  "soakingStaleHours: 72",
  "soakingAbandonedHours: 168",
  "germinationAttentionHours: 54",
  "germinationStaleHours: 168",
  "germinationAbandonedHours: 336",
  "inactiveStaleHours: 336",
  "inactiveAbandonedHours: 720",
  "function getGrowSessionLifecycleHealth(session = null, options = {})",
  "classification: \"needs_attention\"",
  "classification: \"stale\"",
  "classification: \"abandoned\"",
  "function isGrowSessionLifecycleRemindable(session = null)",
  "function getSessionLifecycleRecoveryAlert(session = null)",
  "Resume session · Archive session · Mark completed",
  "|| !isGrowSessionLifecycleRemindable(session)",
  "is-lifecycle-${escapeHtml(lifecycleHealth.classification)}",
  "{ key: \"attention\", label: \"Needs Attention\" }",
].forEach((needle) => requireSource(appSource, needle, "app lifecycle cleanup behavior"));

[
  "const SESSION_LIFECYCLE_STALE_THRESHOLDS = Object.freeze({",
  "function getGrowSessionLifecycleHealth(session = {}, now = new Date())",
  "function isGrowSessionReminderLifecycleEligible(session = {}, now = new Date())",
  "if (!isGrowSessionReminderLifecycleEligible(session, now))",
  "summary.skipped += 1;",
  "first_planted_at,completed_at,is_deleted,user_deleted,visibility_status,excluded_from_analytics,created_at,updated_at",
  "const engineState = SessionEngine.calculateSessionState({ session, now, method: getSessionMethodKey(session) });",
  "&& engineState?.startedAt",
  "reason: \"inactive_stale_threshold\"",
  "reason: \"germination_abandoned_threshold\"",
].forEach((needle) => requireSource(reminderSource, needle, "reminder lifecycle cleanup behavior"));

assert(!appSource.includes("auto-delete stale session"), "Lifecycle cleanup must not auto-delete sessions.");
assert(!reminderSource.includes("delete stale session"), "Reminder cleanup must not delete stale sessions.");
assert(!reminderSource.includes("missing_germination_started_at"), "Reminder eligibility must ignore legacy germination-stage timestamps.");

console.log("Session lifecycle cleanup regression check passed.");
