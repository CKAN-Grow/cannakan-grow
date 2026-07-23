import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const contract = require(path.resolve(__dirname, "../src/grow-companion-contract.js"));
const projection = require(path.resolve(__dirname, "../src/growing-workspace-temporal-projection.js"));

const sessionId = "session-owner-a";
const ownerId = "owner-a";
const phaseId = "phase-a";
const groupId = "group-a";

function projectProductionRecords(taskRecords = [], eventRecords = [], options = {}) {
  const rawBefore = JSON.stringify([taskRecords, eventRecords]);
  const canonicalTasks = taskRecords.map(contract.normalizeTaskRecord);
  const canonicalEvents = eventRecords.map(contract.normalizeEventRecord);
  const canonicalBefore = JSON.stringify([canonicalTasks, canonicalEvents]);
  const projected = projection.projectTemporalRecords(canonicalTasks, canonicalEvents, options);
  assert.equal(JSON.stringify([taskRecords, eventRecords]), rawBefore, "canonical normalization must not mutate raw persistence records");
  assert.equal(JSON.stringify([canonicalTasks, canonicalEvents]), canonicalBefore, "projection must not mutate canonical records");
  return projected;
}
const datedTask = {
  id: "task-b", session_id: sessionId, user_id: ownerId, growing_phase_id: phaseId,
  plant_group_id: groupId, title: "Water plants", status: "open", due_kind: "date",
  due_date: "2026-07-23", origin: "user",
};
const datedEvent = {
  id: "event-a", session_id: sessionId, user_id: ownerId, growing_phase_id: phaseId,
  plant_group_id: groupId, title: "Checked canopy", occurred_kind: "date",
  occurred_date: "2026-07-22", category: "observation", origin: "user",
};
const inputs = { tasks: [datedTask], events: [datedEvent] };
const before = JSON.stringify(inputs);
const entries = projectProductionRecords(inputs.tasks, inputs.events, { sessionId, ownerId });
assert.equal(entries.length, 2);
assert.deepEqual(entries.map((entry) => entry.key), ["event:event-a", "task:task-b"]);
assert.equal(entries[0].sourceType, "event");
assert.equal(entries[0].sourceId, "event-a");
assert.equal(entries[0].contextId, groupId);
assert.equal(entries[0].temporalKind, "date");
assert.equal(entries[0].startsAt, "2026-07-22");
assert.equal(entries[1].sourceType, "task");
assert.equal(entries[1].sourceId, "task-b");
assert.equal(entries[1].contextId, groupId);
assert.equal(entries[1].temporalKind, "date");
assert.equal(entries[1].startsAt, "2026-07-23");
assert.equal(JSON.stringify(inputs), before, "projection must not mutate source inputs");

const equalEvent = { ...datedEvent, id: "same", occurred_date: "2026-07-23" };
const equalTaskA = { ...datedTask, id: "a" };
const equalTaskZ = { ...datedTask, id: "z" };
const equalEntries = projectProductionRecords([equalTaskZ, equalTaskA], [equalEvent], { sessionId, ownerId });
assert.deepEqual(equalEntries.map((entry) => entry.key), ["event:same", "task:a", "task:z"], "ties use source type then canonical source identity");

const instantTask = {
  ...datedTask, id: "instant-task", due_kind: "instant", due_date: null,
  due_at: "2026-07-23T13:30:00.000Z", due_local_datetime: "2026-07-23 09:30",
  due_timezone: "America/New_York", due_utc_offset_minutes: -240,
};
const instantEntry = projectProductionRecords([instantTask], [], { sessionId, ownerId })[0];
assert.equal(instantEntry.temporalKind, "instant");
assert.equal(instantEntry.startsAt, "2026-07-23T13:30:00.000Z");
assert.equal(instantEntry.dateKey, "2026-07-23");
assert.equal(instantEntry.localTime, "09:30");
assert.equal(instantEntry.timeZone, "America/New_York");

const instantEvent = {
  ...datedEvent, id: "instant-event", occurred_kind: "instant", occurred_date: null,
  occurred_at: "2026-07-23T14:30:00.000Z", occurred_local_datetime: "2026-07-23 10:30",
  occurred_timezone: "America/New_York", occurred_utc_offset_minutes: -240,
};
const instantEventEntry = projectProductionRecords([], [instantEvent], { sessionId, ownerId })[0];
assert.equal(instantEventEntry.temporalKind, "instant");
assert.equal(instantEventEntry.startsAt, "2026-07-23T14:30:00.000Z");
assert.equal(instantEventEntry.dateKey, "2026-07-23");
assert.equal(instantEventEntry.localTime, "10:30");
assert.equal(instantEventEntry.timeZone, "America/New_York");

const legacyTask = {
  ...datedTask, id: "legacy-task", due_kind: null,
  due_date: "2026-07-24", due_time: "07:45",
};
const legacyEvent = {
  ...datedEvent, id: "legacy-event", occurred_kind: null,
  occurred_date: "2026-07-24", occurred_time: "08:15",
};
const legacyEntries = projectProductionRecords([legacyTask], [legacyEvent], { sessionId, ownerId });
assert.deepEqual(legacyEntries.map((entry) => entry.key), ["task:legacy-task", "event:legacy-event"]);
assert.equal(legacyEntries[0].temporalKind, "legacy-local");
assert.equal(legacyEntries[0].startsAt, "2026-07-24T07:45");
assert.equal(legacyEntries[1].temporalKind, "legacy-local");
assert.equal(legacyEntries[1].startsAt, "2026-07-24T08:15");

const undatedTask = { ...datedTask, id: "undated", due_kind: "none", due_date: null };
const invalidTask = { ...datedTask, id: "invalid", due_kind: "date", due_date: "not-a-date" };
const invalidEvent = { ...datedEvent, id: "invalid-event", occurred_kind: "instant", occurred_date: null, occurred_at: "bad" };
assert.deepEqual(projectProductionRecords([undatedTask, invalidTask], [invalidEvent], { sessionId, ownerId }), []);
assert.equal(undatedTask.due_kind, "none");
assert.equal(invalidTask.due_date, "not-a-date");
assert.equal(invalidEvent.occurred_at, "bad");

const unauthorizedTask = { ...datedTask, id: "other-session", session_id: "session-owner-b", user_id: "owner-b" };
const unauthorizedOwnerTask = { ...datedTask, id: "other-owner", user_id: "owner-b" };
assert.deepEqual(projectProductionRecords([unauthorizedTask, unauthorizedOwnerTask], [], { sessionId, ownerId }), []);

const timeline = projection.createTimelineView(entries, { fromDate: "2026-07-01", toDate: "2026-07-31" });
const calendar = projection.createCalendarView(entries, { fromDate: "2026-07-01", toDate: "2026-07-31" });
assert.deepEqual(timeline.map((entry) => entry.key), ["event:event-a", "task:task-b"]);
assert.deepEqual(calendar.flatMap((group) => group.entries.map((entry) => entry.key)), timeline.map((entry) => entry.key));
assert.strictEqual(timeline[0], entries[0], "Timeline adapter must retain the shared projection entry");
assert.strictEqual(calendar[0].entries[0], entries[0], "Calendar adapter must retain the shared projection entry");
assert.deepEqual(projection.createTimelineView(entries, { sourceTypes: ["task"] }).map((entry) => entry.sourceType), ["task"]);
assert.equal(projection.shiftDateOnly("2026-01-31", 1), "2026-02-28");
assert.deepEqual(projection.getMonthRange("2026-02-14"), { fromDate: "2026-02-01", toDate: "2026-02-28" });
assert.equal(JSON.stringify(inputs), before, "presentation adapters must not mutate source inputs");

const moduleSource = fs.readFileSync(path.resolve(__dirname, "../src/growing-workspace-temporal-projection.js"), "utf8");
assert.ok(!moduleSource.includes("normalizeTaskRecord(record)"), "projection must not re-normalize canonical Tasks");
assert.ok(!moduleSource.includes("normalizeEventRecord(record)"), "projection must not re-normalize canonical Events");
for (const forbidden of ["localStorage", "sessionStorage", "indexedDB", ".from(", "fetch(", "document.", "window.location", "history."]) {
  assert.ok(!moduleSource.includes(forbidden), `projection module must remain unaware of ${forbidden}`);
}
const appSource = fs.readFileSync(path.resolve(__dirname, "../app.js"), "utf8");
const compositionSource = fs.readFileSync(path.resolve(__dirname, "../src/workspace-composition.js"), "utf8");
assert.ok(compositionSource.includes("temporalProjection.projectTemporalRecords(tasks, events"));
assert.ok(appSource.includes("const entries = composition.temporalEntries;"));
assert.ok(appSource.includes("createTimelineView(entries, adapterOptions)"));
assert.ok(appSource.includes("createCalendarView(entries, adapterOptions)"));
assert.ok(appSource.includes("function updateSessionLifecycleTimeline("), "Session lifecycle timeline remains independently owned");
assert.ok(appSource.includes("function renderSessionEngineVisualTimelineMarkup("), "setup timeline remains independently owned");
const indexSource = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
assert.ok(indexSource.includes('/src/growing-workspace-temporal-projection.js'));
const schema = fs.readFileSync(path.resolve(__dirname, "../supabase-schema.sql"), "utf8");
assert.ok(!/create table[^;]*(?:temporal_projection|workspace_calendar|workspace_timeline)/i.test(schema));
const migrations = fs.readdirSync(path.resolve(__dirname, "../supabase/migrations"));
assert.ok(!migrations.some((name) => /temporal.*projection|workspace.*(?:calendar|timeline)/i.test(name)));
console.log("Growing Workspace Temporal Projection regression checks passed.");
