import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

assert.equal(exists("src/grow-companion-contract.js"), true, "Canonical Grow Companion activity contract must exist.");
assert.equal(
  exists("supabase/migrations/20260721180000_grow_companion_phase1.sql"),
  true,
  "Grow Companion Capability 1 persistence migration must exist.",
);

const app = read("app.js");
const styles = read("styles.css");
const foundationNote = read("docs/foundation/foundation-notes/FN-004-session-lifecycle-and-grow-companion.md");

assert.match(app, /Object\.freeze\(\{ id: "grow", label: "Growing", order: 1 \}\)/, "Visible middle phase must be Growing.");
assert.equal(
  app.match(/data-grow-companion-primary/g)?.length,
  1,
  "Session composition must expose exactly one canonical primary Grow Companion surface.",
);
assert.match(app, /data-session-phase-navigator aria-label="Session lifecycle phases"/, "Lifecycle navigator must be composed inside Grow Companion.");
assert.match(
  app,
  /data-grow-companion-primary[\s\S]*data-session-completed-phase-records/,
  "Completed phase records must remain inside the canonical Grow Companion surface.",
);
assert.match(app, /getSessionLifecyclePresentation\(session\)/, "Session Overview must consume the centralized lifecycle presentation selector.");
assert.match(app, /label: "Session Status"/, "Session Overview must label full Session status explicitly.");
assert.match(app, /label: "Current Phase"/, "Session Overview must expose the current lifecycle phase.");
assert.match(app, /isLegacySessionGerminationComplete/, "Legacy completion compatibility must remain centralized.");
assert.match(app, /return isLegacySessionGerminationComplete\(session\) && hasExplicitCompletion/, "Growing completion must require canonical Germination completion.");
assert.match(app, /return isSessionGrowingPhaseComplete\(session\) && hasExplicitCompletion/, "Reflection completion must require canonical Growing completion.");
assert.match(app, /getSessionGerminationPhaseSummary/, "Completed Germination summary must retain the canonical Session selector.");
assert.match(app, /recordBody\.append\(nodes\.lifecycleSection, nodes\.germinationContent\)/, "Authoritative Germination nodes must move, not clone.");
assert.doesNotMatch(app, /cloneNode\([^)]*detail-lifecycle-section|cloneNode\([^)]*session-workspace-content/, "Germination modules must not be cloned.");
assert.match(app, /data-grow-companion-action="add-task" disabled>Add Task<\/button>/, "Task action must begin disabled until canonical authorization resolves.");
assert.match(app, /data-grow-companion-action="add-event" disabled>Add Event<\/button>/, "Event action must begin disabled until canonical authorization resolves.");
assert.equal(app.match(/data-session-reflection-rating=/g)?.length, 2, "Reflection must expose exactly two canonical star-rating concepts.");
assert.match(app, /data-session-reflection-rating="overall"[\s\S]*★★★★★/, "Overall Experience must use the canonical five-star foundation.");
assert.match(app, /data-session-reflection-rating="grow-again"[\s\S]*★★★★★/, "Would Grow Again must use the canonical five-star foundation.");
assert.doesNotMatch(app, /name="future-grow-again"/, "Obsolete Yes/Maybe/No Reflection choices must remain absent.");
assert.doesNotMatch(app, /germination-companion/, "Germination progress must not be labeled as a second Grow Companion.");
assert.doesNotMatch(app, /cloneNode\([^)]*grow-companion/, "Capability activity must remain inside the single Grow Companion renderer.");
assert.match(app, /assertDeveloperScenarioWritesAllowed\("sessions", "change Grow Companion activity"/, "Preview Studio writes must remain blocked.");
assert.match(styles, /\.session-grow-companion-surface/, "Grow Companion hub styling must exist.");
assert.match(styles, /\.session-phase-section-body\[hidden\][\s\S]*display: none !important/, "Collapsed records must leave the focus order.");
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*session-phase-navigator-button[\s\S]*transition: none/, "Reduced-motion navigation behavior must remain intact.");
assert.match(foundationNote, /Grow Companion/i, "FN-004 must remain the product foundation.");

const migrations = fs.readdirSync(path.join(root, "supabase", "migrations"));
assert.equal(
  migrations.filter((name) => /grow_companion.*phase1|20260721180000/i.test(name)).length,
  1,
  "Exactly one additive Grow Companion Capability 1 migration must exist.",
);

console.log("Session Composition Refinement regression checks passed.");
