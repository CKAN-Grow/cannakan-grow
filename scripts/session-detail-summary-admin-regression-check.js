const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");
const migrationSource = fs.readFileSync(
  path.join(repoRoot, "supabase", "migrations", "20260519113000_founder_admin_session_time_editing.sql"),
  "utf8",
);

for (const needle of [
  "function canAuthenticatedAdminEditGrowSessionTimestamps()",
  "getAdminAccessLevel(authenticatedUser, { allowLocalDemoAdmin: false }).isAdmin",
  "function canCurrentUserEditSessionTimes(session = null)",
  "function ensureSessionTimesEditButton(detail)",
  "function removeSessionTimesEditUi(detail)",
  "const canEditSessionTimes = canCurrentUserEditSessionTimes(session);",
  "if (canEditSessionTimes) {",
  "ensureSessionTimesEditButton(detail);",
  "removeSessionTimesEditUi(detail);",
  "if (!canCurrentUserEditSessionTimes(session)) {",
  "throw new Error(GROW_SESSION_MANUAL_TIMESTAMP_RESTRICTED_MESSAGE);",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing admin-only session time editing guard: ${needle}`);
  }
}

if (indexSource.includes('id="detail-edit-session-times"')) {
  throw new Error("Edit Times must not be statically rendered for regular users.");
}

const detailsFormMatch = indexSource.match(/<form id="detail-session-details-form"[\s\S]*?<\/form>/);
if (!detailsFormMatch) {
  throw new Error("Missing Edit Session Details form.");
}

for (const forbiddenField of ["sessionStartedAt", "soakStartedAt", "germinationStartedAt", "completedAt", "Session Date", "Session Time"]) {
  if (detailsFormMatch[0].includes(forbiddenField)) {
    throw new Error(`General Edit Session Details form must not expose timestamp field: ${forbiddenField}`);
  }
}

for (const needle of [
  "detail-header-label",
  "Session Overview",
  "meta-card--status",
  "meta-card--seed-age",
  'data-session-summary-card="${escapeHtml(card.key || card.label || "")}"',
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing compact session detail summary markup: ${needle}`);
  }
}

for (const needle of [
  ".session-workspace-shell--detail .detail-header",
  "grid-template-columns: repeat(5, minmax(112px, 1fr));",
  ".session-workspace-shell--detail .detail-header-label",
  ".session-workspace-shell--detail .detail-header .meta-card--status",
  ".session-workspace-shell--detail .session-workspace-header .inline-actions",
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing compact session detail summary styling: ${needle}`);
  }
}

if (!migrationSource.includes("if not public.is_grow_session_timestamp_admin() then")
  || !migrationSource.includes("Manual grow session timestamp editing is restricted to founder/admin accounts.")) {
  throw new Error("Timestamp editing RPC must remain founder/admin restricted.");
}

console.log("Session detail summary/admin regression check passed.");
