"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const originalMigration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260713210000_gie_phase2_group_a_owner_analytics.sql"),
  "utf8",
);
const fixMigration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260713235000_fix_owner_analytics_ambiguous_seed_totals.sql"),
  "utf8",
);

function requireNeedle(source, needle, label) {
  if (!source.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

requireNeedle(app, 'await upsertSeedVaultRows(row, { single: true })', "Seed Vault frontend upsert");
requireNeedle(app, 'loadGeeOwnerAnalytics("seed-vault-entry-save")', "post-save Owner Analytics refresh");
requireNeedle(app, 'rpc("get_gie_my_analytics")', "canonical Owner Analytics RPC");
requireNeedle(originalMigration, "seeds_tested integer :=", "conflicting PL/pgSQL variable evidence");
requireNeedle(originalMigration, "sum(seeds_tested)::integer as seeds_tested", "original ambiguous CTE evidence");

[
  "sum(history.seeds_tested)",
  "sum(history.seeds_germinated)",
  "history.seeds_tested",
  "history.seeds_germinated",
  "monthly.completed_sessions",
  "monthly.seeds_tested",
  "monthly.seeds_germinated",
  "case when monthly.seeds_tested > 0",
  "execute function_definition",
  "no change was applied",
].forEach((needle) => requireNeedle(fixMigration, needle, "qualified forward migration behavior"));

if (/notify\s+pgrst/i.test(fixMigration)) {
  throw new Error("A schema cache reload is unnecessary because the function signature is unchanged.");
}
if (/\b(insert|update|delete|truncate)\s+(?:into\s+|from\s+)?public\./i.test(fixMigration)) {
  throw new Error("The ambiguity migration must not mutate production table data.");
}

console.log("Seed Vault Owner Analytics ambiguity regression check passed.");
