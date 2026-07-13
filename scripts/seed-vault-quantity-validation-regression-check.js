"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260713236000_seed_vault_quantity_positive.sql"), "utf8");
const vm = require("vm");

function requireNeedle(source, needle, label) {
  if (!source.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

[
  "function getSeedVaultQuantityValidationMessage(value)",
  'return "Seeds Owned is required."',
  "!Number.isFinite(numericValue) || !Number.isInteger(numericValue)",
  'return "Seeds Owned must be a whole number."',
  "numericValue < 1",
  'return "Seeds Owned must be at least 1."',
  'name="quantity" type="number" min="1" step="1"',
  'data-seed-vault-entry-form novalidate',
  "data-seed-vault-quantity-error",
  "updateSeedVaultQuantityValidation(form, { showError: true })",
  'code: "SEED_VAULT_QUANTITY_INVALID"',
  "const rawQuantity = entry.quantity ?? entry.seedCount ?? entry.seed_count",
].forEach((needle) => requireNeedle(app, needle, "Seed Vault quantity validation"));

const validatorStart = app.indexOf("function getSeedVaultQuantityValidationMessage(value)");
const validatorEnd = app.indexOf("function updateSeedVaultQuantityValidation", validatorStart);
if (validatorStart < 0 || validatorEnd < 0) throw new Error("Could not isolate the Seed Vault quantity validator.");
const validatorSource = app.slice(validatorStart, validatorEnd).trim();
const validateQuantity = vm.runInNewContext(`(${validatorSource.replace(/^function\s+getSeedVaultQuantityValidationMessage/, "function")})`);
[
  ["", "Seeds Owned is required."],
  ["0", "Seeds Owned must be at least 1."],
  ["-2", "Seeds Owned must be at least 1."],
  ["abc", "Seeds Owned must be a whole number."],
  ["1.5", "Seeds Owned must be a whole number."],
  ["1", ""],
  [12, ""],
].forEach(([value, expected]) => {
  const actual = validateQuantity(value);
  if (actual !== expected) throw new Error(`Unexpected validation for ${JSON.stringify(value)}: ${actual}`);
});

requireNeedle(styles, ".seed-vault-entry-form label.field-has-warning .field-warning", "inline validation style");
requireNeedle(styles, ".seed-vault-entry-form input.is-missing", "invalid input style");

[
  "where quantity is null or quantity < 1",
  "No data was changed.",
  "seed_vault_entries_quantity_positive",
  "check (quantity is not null and quantity >= 1) not valid",
  "validate constraint seed_vault_entries_quantity_positive",
].forEach((needle) => requireNeedle(migration, needle, "production-safe positive quantity constraint"));

if (/\b(update|delete|truncate)\s+public\.seed_vault_entries/i.test(migration)) {
  throw new Error("Quantity migration must not modify existing Seed Vault data.");
}

console.log("Seed Vault quantity validation regression check passed.");
