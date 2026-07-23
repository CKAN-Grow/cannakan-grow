import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const taskEvents = require(path.join(root, "src", "grow-companion-contract.js"));
const notes = require(path.join(root, "src", "growing-workspace-notes.js"));
const composition = require(path.join(root, "src", "workspace-composition.js"));

const sessionId = "00000000-0000-4000-8000-000000000501";
const ownerId = "00000000-0000-4000-8000-000000000502";
const rawTask = {
  id: "00000000-0000-4000-8000-000000000503",
  session_id: sessionId,
  user_id: ownerId,
  title: "Inspect canopy",
  status: "open",
  due_kind: "date",
  due_date: "2026-07-23",
};
const rawEvent = {
  id: "00000000-0000-4000-8000-000000000504",
  session_id: sessionId,
  user_id: ownerId,
  title: "Canopy inspected",
  category: "observation",
  origin: "user",
  occurred_kind: "date",
  occurred_date: "2026-07-23",
};
const rawNote = {
  id: "00000000-0000-4000-8000-000000000505",
  session_id: sessionId,
  author_user_id: ownerId,
  narrative: "Canopy remains even.",
  context_type: "session",
  created_at: "2026-07-23T15:00:00.000Z",
  updated_at: "2026-07-23T15:00:00.000Z",
};
const canonicalTask = taskEvents.normalizeTaskRecord(rawTask);
const canonicalEvent = taskEvents.normalizeEventRecord(rawEvent);
const canonicalNote = notes.normalizeNoteRecord(rawNote);
const sourceSnapshot = JSON.stringify({ canonicalTask, canonicalEvent, canonicalNote });

const workspace = composition.composeWorkspace({
  sessionId,
  tasks: [canonicalTask],
  events: [canonicalEvent, taskEvents.normalizeEventRecord({ ...rawEvent, id: "other-session", session_id: "other" })],
  notes: [canonicalNote, notes.normalizeNoteRecord({ ...rawNote, id: "other-note", session_id: "other" })],
});

assert.equal(workspace.tasks.length, 1);
assert.equal(workspace.events.length, 1);
assert.equal(workspace.notes.length, 1);
assert.strictEqual(workspace.tasks[0], canonicalTask);
assert.strictEqual(workspace.events[0], canonicalEvent);
assert.strictEqual(workspace.notes[0], canonicalNote);
assert.equal(workspace.taskProjection.open[0].id, canonicalTask.id);
assert.equal(workspace.activity[0].sourceId, canonicalEvent.id);
assert.deepEqual(workspace.temporalEntries.map((entry) => entry.key), [
  `event:${canonicalEvent.id}`,
  `task:${canonicalTask.id}`,
]);
assert.equal(JSON.stringify({ canonicalTask, canonicalEvent, canonicalNote }), sourceSnapshot);
assert.ok(Object.isFrozen(workspace));
assert.ok(Object.isFrozen(workspace.tasks));
assert.throws(() => composition.composeWorkspace({}), /canonical Session/);

const moduleSource = fs.readFileSync(path.join(root, "src", "workspace-composition.js"), "utf8");
assert.doesNotMatch(moduleSource, /normalizeTaskRecord|normalizeEventRecord|normalizeNoteRecord/);
assert.doesNotMatch(moduleSource, /localStorage|sessionStorage|indexedDB|fetch\(|\.from\(/);
assert.doesNotMatch(moduleSource, /ownerId|user_id|belongsToOwner/);

const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
assert.ok(appSource.includes("getGrowCompanionWriteEligibility(controller.session)"));
assert.ok(appSource.includes('.eq("user_id", ownerId)'));
assert.doesNotMatch(appSource, /composeWorkspace\(\{[\s\S]{0,160}ownerId/);

const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const serviceWorkerSource = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
assert.ok(indexSource.includes('/src/workspace-composition.js'));
assert.ok(serviceWorkerSource.includes('"/src/workspace-composition.js"'));

console.log("Workspace Composition regression checks passed.");
