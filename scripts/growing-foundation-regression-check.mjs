import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const moduleSource = fs.readFileSync(new URL("../src/growing-foundation.js", import.meta.url), "utf8");
const migration = fs.readFileSync(new URL("../supabase/migrations/20260723120000_growing_phase_and_plant_groups.sql", import.meta.url), "utf8");
const schemaSnapshot = fs.readFileSync(new URL("../supabase-schema.sql", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(index, /src\/growing-foundation\.js[^]*app\.js/, "Growing module must load before app.js.");
assert.match(app, /attachCanonicalGrowingCommencementsToSessions\(sessions\)/);
assert.match(app, /attachGrowingEvidenceToSessions\(sessionsWithCommencement\)/);
assert.match(app, /post_germination_decision/);
assert.match(app, /POST_GERMINATION_DECISION/);
assert.match(app, /renderPostGerminationDecisionMarkup/);
assert.match(app, /renderGrowingFoundationMarkup\(session\)/);
assert.match(moduleSource, /grow_session_growing_phases/);
assert.match(moduleSource, /grow_session_plant_groups/);
assert.match(moduleSource, /environmentType/);
assert.match(moduleSource, /growMethod/);
assert.match(moduleSource, /plantCount/);
assert.match(moduleSource, /harvestedCount/);
assert.match(moduleSource, /initializeSourceDirectoryAutocompletes/);
assert.match(moduleSource, /initializeVarietyDirectoryAutocompletes/);
assert.match(moduleSource, /Every Plant Group must have a positive whole Number of Plants/);

for (const value of ["Indoor", "Outdoor", "Greenhouse", "Protected Outdoor", "Mixed", "Other"]) {
  assert.ok(moduleSource.includes(`"${value}"`), `Missing Environment Type ${value}.`);
}
for (const value of ["Soil", "Living Soil", "Coco", "Hydro", "DWC", "RDWC", "Rockwool", "NFT", "Aeroponic", "Raised Bed", "Container", "Other"]) {
  assert.ok(moduleSource.includes(`"${value}"`), `Missing Grow Method ${value}.`);
}
for (const value of ["Seed", "Seedling", "Clone", "Cutting", "Established Plant", "Other"]) {
  assert.ok(moduleSource.includes(`"${value}"`), `Missing Plant Group Type ${value}.`);
}
for (const value of ["Unknown", "Feminized", "Female", "Male", "Regular", "Other"]) {
  assert.ok(moduleSource.includes(`"${value}"`), `Missing Plant Group Sex ${value}.`);
}

assert.match(migration, /session_id uuid not null unique references public\.grow_sessions/);
assert.match(migration, /growing_phase_id uuid not null references public\.grow_session_growing_phases/);
assert.match(migration, /plant_count integer not null check \(plant_count > 0\)/);
assert.match(migration, /enable row level security/g);
assert.match(migration, /session_row\.user_id = auth\.uid\(\)/g);
assert.match(migration, /revoke all on public\.grow_session_growing_phases from anon/);
assert.match(migration, /revoke all on public\.grow_session_plant_groups from anon/);
assert.match(schemaSnapshot, /create table if not exists public\.grow_session_growing_phases/);
assert.match(schemaSnapshot, /create table if not exists public\.grow_session_plant_groups/);
assert.match(schemaSnapshot, /grow_sessions_post_germination_decision_check/);

for (const prohibited of ["expected_timing", "actual_timing", "harvest_date", "yield", "reflection", "gee_"]) {
  assert.equal(migration.toLowerCase().includes(prohibited), false, `Migration must not include deferred ${prohibited} storage.`);
}
for (const prohibitedOwner of ["snapshot_state", "session_notes", "session_images", "partitions json", "grow_session_tasks", "grow_session_events"]) {
  assert.equal(moduleSource.includes(prohibitedOwner), false, `Growing evidence must not use ${prohibitedOwner}.`);
}

console.log("Growing foundation static regression checks passed.");
