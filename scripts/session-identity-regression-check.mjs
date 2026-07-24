import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync("app.js", "utf8");
const index = fs.readFileSync("index.html", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

for (const helper of [
  "getSessionIdentityVarietyNames",
  "formatSessionIdentityVarieties",
  "getSessionIdentityLifecycleLabel",
  "getSessionIdentityRepresentativeImage",
  "syncSessionIdentityPresentation",
]) {
  assert.match(app, new RegExp(`function ${helper}\\(`), `Missing Session Identity helper: ${helper}`);
}

assert.match(app, /normalizeSessionPartitions\(session\?\.partitions \|\| \[\]\)/, "Variety identity must consume canonical Session partitions.");
assert.match(app, /formatPartitionSeedVariety\(partition\)/, "Variety identity must reuse canonical variety formatting.");
assert.match(app, /normalizeVarietyDirectoryText\(name\)/, "Variety identity must reuse canonical variety normalization.");
assert.match(app, /getSessionLifecyclePresentation\(session\)/, "Lifecycle identity must use the canonical lifecycle presentation.");
assert.match(app, /getEffectiveSessionImages\(session\)\.find/, "Representative imagery must use canonical Session images first.");
assert.match(app, /varieties\.length === 1/, "Variety imagery must only represent a single-variety Session.");
assert.match(app, /getVarietyDirectoryAutocompleteEntries\(\)/, "Variety image fallback must consume the canonical Variety Directory.");
assert.match(app, /kind: "fallback"[\s\S]*?my-sessions-hero-bg\.png/, "Missing neutral Session fallback image.");
assert.match(app, /syncSessionIdentityPresentation\(detail, session\);/, "Session detail rendering must synchronize the identity surface.");

for (const id of [
  "detail-title",
  "detail-session-identity-varieties",
  "detail-session-identity-image",
  "detail-session-identity-phase",
]) {
  assert.match(index, new RegExp(`id="${id}"`), `Missing Session Identity element: ${id}`);
}

assert.match(styles, /\.session-identity-copy h2[\s\S]*?overflow-wrap: anywhere/, "Long Session names must wrap.");
assert.match(styles, /@media \(max-width: 520px\)[\s\S]*?session-identity-image-frame/, "Missing narrow Session Identity layout.");

for (const forbidden of [
  "localStorage.setItem",
  "sessionStorage.setItem",
  ".from(",
  ".insert(",
  ".update(",
  ".upsert(",
]) {
  const identitySlice = app.slice(
    app.indexOf("function getSessionIdentityVarietyNames"),
    app.indexOf("function buildSessionDetailMetaCards"),
  );
  assert.equal(identitySlice.includes(forbidden), false, `Session Identity must not introduce persistence: ${forbidden}`);
}

console.log("Session Identity regression check passed.");
