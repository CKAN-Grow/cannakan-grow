const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const migrationSource = fs.readFileSync(
  path.join(repoRoot, "supabase", "migrations", "20260520023000_add_filter_paper_inventory_preference.sql"),
  "utf8",
);
const supplySettingsMigrationSource = fs.readFileSync(
  path.join(repoRoot, "supabase", "migrations", "20260520024500_add_user_filter_paper_supply_settings.sql"),
  "utf8",
);

for (const needle of [
  "const USER_FILTER_PAPER_SUPPLY_SETTINGS_TABLE = \"user_filter_paper_supply_settings\";",
  "const FILTER_PAPER_INVENTORY_PREFERENCE_COLUMN = \"filter_paper_inventory\";",
  "function normalizeFilterPaperInventoryFromSupplySettingsRow(row = null)",
  "function buildFilterPaperSupplySettingsPayload(userId = \"\", inventory = DEFAULT_FILTER_PAPER_INVENTORY)",
  "function getFilterPaperInventoryStorageKey(userId = appState.user?.id || \"\")",
  "function syncFilterPaperInventoryCache(userId = appState.user?.id || \"\", inventory = DEFAULT_FILTER_PAPER_INVENTORY, options = {})",
  "async function ensureFilterPaperInventoryForUser(user = appState.user)",
  "async function saveFilterPaperInventoryForCurrentUser(inventory)",
  "await saveFilterPaperInventoryForCurrentUser({",
  "function shouldAutoDeductFilterPaperForSessionStart(session)",
  "function getFilterPaperUsageForSessionStart(session)",
  "function applyFilterPaperDeductionForStartedSession(session)",
  "FILTER_PAPER_USAGE_PER_STARTED_SESSION",
  "systemType === \"KAN\" || systemType === \"TRA\"",
  "count: Math.max(0, inventory.count - filterPaperUsage)",
  "if (shouldAutoDeductFilterPaperForSessionStart(savedSession))",
  "applyFilterPaperDeductionForStartedSession(savedSession);",
  "Auto subtract when a session starts",
  "each time a grow session is started.",
  ".from(USER_FILTER_PAPER_SUPPLY_SETTINGS_TABLE)",
  ".upsert(payload, { onConflict: \"user_id\" })",
  "throw saveResult.error;",
  "Filter paper count could not be saved to your account.",
  "Filter paper count could not be loaded from your account. Showing the browser fallback for now.",
  "renderFilterPaperInventoryErrorMarkup",
  "Filter paper count could not be saved:",
  "Enter a valid filter paper count of 0 or more.",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing filter paper supply save behavior: ${needle}`);
  }
}

for (const forbiddenNeedle of [
  "shouldAutoDeductFilterPaperForSessionCompletion",
  "applyFilterPaperDeductionForCompletedSession",
  "FILTER_PAPER_USAGE_PER_COMPLETED_SESSION",
  "Auto subtract when a session is completed",
  "each time a grow session is marked completed.",
]) {
  if (appSource.includes(forbiddenNeedle)) {
    throw new Error(`Filter paper deduction should be session-start based, but found: ${forbiddenNeedle}`);
  }
}

for (const needle of [
  "add column if not exists filter_paper_inventory jsonb not null default '{}'::jsonb",
  "notify pgrst, 'reload schema';",
]) {
  if (!migrationSource.includes(needle)) {
    throw new Error(`Missing filter paper supply persistence migration behavior: ${needle}`);
  }
}

for (const needle of [
  "create table if not exists public.user_filter_paper_supply_settings",
  "user_id uuid primary key references auth.users(id) on delete cascade",
  "filter_paper_count integer not null default 0 check (filter_paper_count >= 0)",
  "store_region text not null default 'US' check (store_region in ('US', 'EU'))",
  "auto_subtract_on_complete boolean not null default true",
  "low_supply_reminders_enabled boolean not null default true",
  "alter table public.user_filter_paper_supply_settings enable row level security;",
  "using (auth.uid() = user_id)",
  "with check (auth.uid() = user_id)",
  "notify pgrst, 'reload schema';",
]) {
  if (!supplySettingsMigrationSource.includes(needle)) {
    throw new Error(`Missing dedicated filter paper supply settings migration behavior: ${needle}`);
  }
}

console.log("Filter paper supply save regression check passed.");
