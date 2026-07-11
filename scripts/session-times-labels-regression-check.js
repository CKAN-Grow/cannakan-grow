const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const migrationSource = fs.readFileSync(path.join(repoRoot, "supabase", "migrations", "20260519113000_founder_admin_session_time_editing.sql"), "utf8");

const editorMatch = indexSource.match(/<form id="detail-session-times-form"[\s\S]*?<\/form>/);
if (!editorMatch) {
  throw new Error("Missing Edit Session Times form.");
}

const editorMarkup = editorMatch[0];
const expectedLabels = ["Session Started", "Phase Started", "First Result", "Completion Time"];
for (const label of expectedLabels) {
  if (!editorMarkup.includes(`<span>${label}</span>`)) {
    throw new Error(`Missing official Edit Session Times label: ${label}`);
  }
}

for (const oldLabel of ["Soaking", "Germinating", "Germination Started", "Completed"]) {
  if (editorMarkup.includes(`<span>${oldLabel}</span>`)) {
    throw new Error(`Edit Session Times should not show old label: ${oldLabel}`);
  }
}

if (indexSource.includes('id="detail-edit-session-times"')) {
  throw new Error("Edit Times must not be statically rendered for regular users.");
}

const requiredFieldNames = ["sessionStartedAt", "soakStartedAt", "germinationStartedAt", "completedAt"];
for (const fieldName of requiredFieldNames) {
  if (!editorMarkup.includes(`name="${fieldName}"`)) {
    throw new Error(`Timestamp field mapping changed or disappeared: ${fieldName}`);
  }
}

if (!appSource.includes("p_session_started_at: payload.sessionStartedAt")
  || !appSource.includes("p_soak_started_at: payload.soakStartedAt")
  || !appSource.includes("p_germination_started_at: payload.germinationStartedAt || null")
  || !appSource.includes("p_completed_at: payload.completedAt || null")) {
  throw new Error("Owner timestamp RPC mappings must remain wired to the original timestamp fields.");
}

for (const needle of [
  "function canAuthenticatedAdminEditGrowSessionTimestamps()",
  "getAdminAccessLevel(authenticatedUser, { allowLocalDemoAdmin: false }).isAdmin",
  "function ensureSessionTimesEditButton(detail)",
  "function removeSessionTimesEditUi(detail)",
  "if (!canCurrentUserEditSessionTimes(session))",
  "GROW_SESSION_MANUAL_TIMESTAMP_RESTRICTED_MESSAGE",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing admin-only session time editing behavior: ${needle}`);
  }
}

if (!migrationSource.includes("if not public.is_grow_session_timestamp_admin() then")
  || !migrationSource.includes("Manual grow session timestamp editing is restricted to founder/admin accounts.")) {
  throw new Error("Timestamp editing RPC must remain founder/admin restricted.");
}

console.log("Session times labels regression check passed.");
