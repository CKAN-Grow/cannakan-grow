const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const migrationSource = fs.readFileSync(
  path.join(repoRoot, "supabase", "migrations", "20260520023000_add_filter_paper_inventory_preference.sql"),
  "utf8",
);

for (const needle of [
  "const FILTER_PAPER_INVENTORY_PREFERENCE_COLUMN = \"filter_paper_inventory\";",
  "function getFilterPaperInventoryStorageKey(userId = appState.user?.id || \"\")",
  "function syncFilterPaperInventoryCache(userId = appState.user?.id || \"\", inventory = DEFAULT_FILTER_PAPER_INVENTORY, options = {})",
  "async function ensureFilterPaperInventoryForUser(user = appState.user)",
  "async function saveFilterPaperInventoryForCurrentUser(inventory)",
  "await saveFilterPaperInventoryForCurrentUser({",
  "Filter paper count could not be saved:",
  "Enter a valid filter paper count of 0 or more.",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing filter paper supply save behavior: ${needle}`);
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

console.log("Filter paper supply save regression check passed.");
