import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const notes = require(path.resolve(__dirname, "../src/growing-workspace-notes.js"));
const sessionId = "session-a";
const authorId = "owner-a";
const raw = {
  id: "note-a", session_id: sessionId, author_user_id: authorId,
  narrative: "  Canopy recovered after watering.  ", context_type: "task",
  task_id: "task-a", created_at: "2026-07-23T18:00:00Z", updated_at: "2026-07-23T18:00:00Z",
};
const before = JSON.stringify(raw);
const canonical = notes.normalizeNoteRecord(raw);
assert.equal(canonical.id, "note-a");
assert.equal(canonical.sessionId, sessionId);
assert.equal(canonical.authorId, authorId);
assert.equal(canonical.narrative, "Canopy recovered after watering.");
assert.equal(canonical.taskId, "task-a");
assert.equal(JSON.stringify(raw), before, "normalization must not mutate persistence rows");

const valid = notes.validateNoteInput(
  { narrative: "Corrected narrative", contextType: "task", contextId: "task-a" },
  { sessionId, tasks: [{ id: "task-a", sessionId }], events: [], plantGroups: [] },
);
assert.equal(valid.isValid, true);
assert.deepEqual(notes.buildNotePersistencePayload(valid.value, { sessionId, authorId }), {
  session_id: sessionId, author_user_id: authorId, narrative: "Corrected narrative",
  context_type: "task", plant_group_id: null, task_id: "task-a", event_id: null,
});
const correction = notes.buildNotePersistencePayload(valid.value, { sessionId, authorId, existing: canonical });
assert.equal(Object.hasOwn(correction, "author_user_id"), false, "correction cannot relabel authorship");
const retainedUnavailable = notes.validateNoteInput(
  { narrative: "Correction after Task deletion", contextType: "task", contextId: "task-a" },
  { sessionId, tasks: [], events: [], plantGroups: [], existingNote: canonical },
);
assert.equal(retainedUnavailable.isValid, true, "an unchanged unavailable context must survive narrative correction");
assert.equal(notes.validateNoteInput(
  { narrative: "Invalid replacement", contextType: "task", contextId: "task-b" },
  { sessionId, tasks: [], events: [], plantGroups: [], existingNote: canonical },
).isValid, false, "an unavailable replacement must still be rejected");
assert.equal(notes.validateNoteInput({ narrative: "", contextType: "session" }, { sessionId }).isValid, false);
assert.equal(notes.validateNoteInput(
  { narrative: "Wrong Session", contextType: "event", contextId: "event-b" },
  { sessionId, events: [{ id: "event-b", sessionId: "session-b" }] },
).isValid, false);

const moduleSource = fs.readFileSync(path.resolve(__dirname, "../src/growing-workspace-notes.js"), "utf8");
for (const forbidden of ["localStorage", "sessionStorage", "indexedDB", ".from(", "fetch(", "document.", "window."]) {
  assert.ok(!moduleSource.includes(forbidden), `canonical Notes contract must remain unaware of ${forbidden}`);
}
const appSource = fs.readFileSync(path.resolve(__dirname, "../app.js"), "utf8");
assert.ok(appSource.includes("normalizeNoteRecord"));
assert.ok(appSource.includes("validateNoteInput"));
assert.ok(appSource.includes("buildNotePersistencePayload"));
assert.ok(appSource.includes("GROW_COMPANION_ACTIVITY_TABLES.notes"));
assert.ok(!appSource.includes("buildActivityItems(controller.tasks, controller.events, controller.notes)"));
assert.ok(!appSource.includes("projectTemporalRecords(controller.tasks, controller.events, controller.notes"));
const schema = fs.readFileSync(path.resolve(__dirname, "../supabase-schema.sql"), "utf8");
assert.match(schema, /create table if not exists public\.grow_session_notes/);
assert.match(schema, /Owners can delete their Session notes/);
assert.doesNotMatch(schema, /grow_session_notes[\s\S]{0,500}(archived_at|deleted_at|tombstone)/i);
console.log("Growing Workspace Notes regression checks passed.");
