import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contract = require(path.join(root, "src", "grow-companion-contract.js"));

const SESSION_ID = "00000000-0000-4000-8000-000000000001";
const OTHER_SESSION_ID = "00000000-0000-4000-8000-000000000002";
const OWNER_ID = "00000000-0000-4000-8000-000000000003";
const PHASE_ID = "00000000-0000-4000-8000-000000000004";
const GROUP_ID = "00000000-0000-4000-8000-000000000005";
const context = {
  sessionId: SESSION_ID,
  growingPhase: {
    id: PHASE_ID,
    sessionId: SESSION_ID,
    plantGroups: [{ id: GROUP_ID, growingPhaseId: PHASE_ID }],
  },
};

const legacyIdentity = "00000000-0000-4000-8000-000000000010";
const legacy = contract.normalizeTaskRecord({
  id: legacyIdentity,
  session_id: SESSION_ID,
  user_id: OWNER_ID,
  title: "Legacy local task",
  due_date: "2026-11-01",
  due_time: "01:30",
  status: "upcoming",
  completed_at: null,
});
assert.equal(legacy.id, legacyIdentity);
assert.equal(legacy.status, "open");
assert.equal(legacy.stateClassification, "legacy");
assert.equal(legacy.dueKind, "legacy-local");
assert.equal(legacy.dueClassification, "legacy");
assert.equal(legacy.dueAt, "");

const absent = contract.normalizeTaskRecord({ id: "absent", title: "No due" });
assert.equal(absent.status, "open");
assert.equal(absent.dueKind, "none");

const malformed = contract.normalizeTaskRecord({
  id: "malformed",
  title: "Malformed",
  status: "mystery",
  due_kind: "instant",
  due_at: "not-an-instant",
  due_local_datetime: "2026-07-23 09:00",
  due_timezone: "America/New_York",
  due_utc_offset_minutes: -240,
});
assert.equal(malformed.stateClassification, "invalid");
assert.equal(malformed.dueClassification, "invalid");

const completedUnknown = contract.normalizeTaskRecord({
  id: "completed-unknown",
  title: "Legacy completed",
  status: "completed",
  completed_at: null,
});
assert.equal(completedUnknown.status, "completed");
assert.equal(completedUnknown.completedAt, "");

const sameSession = contract.validateTaskContext({
  growingPhaseId: PHASE_ID,
  plantGroupId: GROUP_ID,
}, context);
assert.equal(sameSession.isValid, true);
assert.equal(contract.validateTaskContext({ growingPhaseId: PHASE_ID }, {
  ...context,
  sessionId: OTHER_SESSION_ID,
}).isValid, false);
assert.equal(contract.validateTaskContext({
  growingPhaseId: PHASE_ID,
  plantGroupId: "00000000-0000-4000-8000-000000000099",
}, context).isValid, false);

const noneInput = contract.validateTaskInput({
  title: "Inspect canopy",
  dueKind: "none",
  status: "open",
}, context);
assert.equal(noneInput.isValid, true);
const nonePayload = contract.buildTaskPersistencePayload(noneInput.value, {
  sessionId: SESSION_ID,
  ownerId: OWNER_ID,
  now: "2026-07-23T14:00:00.000Z",
});
assert.deepEqual({
  due_kind: nonePayload.due_kind,
  due_date: nonePayload.due_date,
  due_at: nonePayload.due_at,
  status: nonePayload.status,
}, { due_kind: "none", due_date: null, due_at: null, status: "open" });

const dateInput = contract.validateTaskInput({
  title: "Water beds",
  dueKind: "date",
  dueDate: "2026-07-24",
  status: "open",
  growingPhaseId: PHASE_ID,
  plantGroupId: GROUP_ID,
}, context);
assert.equal(dateInput.isValid, true);
const datePayload = contract.buildTaskPersistencePayload(dateInput.value, {
  sessionId: SESSION_ID,
  ownerId: OWNER_ID,
});
assert.equal(datePayload.due_kind, "date");
assert.equal(datePayload.due_date, "2026-07-24");
assert.equal(datePayload.growing_phase_id, PHASE_ID);
assert.equal(datePayload.plant_group_id, GROUP_ID);

const instantInput = contract.validateTaskInput({
  title: "Check irrigation",
  dueKind: "instant",
  dueLocalDateTime: "2026-07-24T09:30",
  dueTimeZone: "America/New_York",
  status: "open",
}, context);
assert.equal(instantInput.isValid, true);
const instantPayload = contract.buildTaskPersistencePayload(instantInput.value, {
  sessionId: SESSION_ID,
  ownerId: OWNER_ID,
});
assert.equal(instantPayload.due_kind, "instant");
assert.equal(instantPayload.due_at, "2026-07-24T13:30:00.000Z");
assert.equal(instantPayload.due_local_datetime, "2026-07-24 09:30");
assert.equal(instantPayload.due_timezone, "America/New_York");
assert.equal(instantPayload.due_utc_offset_minutes, -240);
const canonicalInstantRow = {
  ...instantPayload,
  id: "valid-canonical-instant",
  title: "Valid canonical instant",
};
const validCanonicalInstant = contract.normalizeTaskRecord(canonicalInstantRow);
assert.equal(validCanonicalInstant.dueClassification, "valid");
const inconsistentUtcInstant = contract.normalizeTaskRecord({
  ...canonicalInstantRow,
  id: "inconsistent-utc-instant",
  due_at: "2026-07-24T14:30:00.000Z",
});
assert.equal(inconsistentUtcInstant.dueClassification, "invalid");
const inconsistentStoredOffset = contract.normalizeTaskRecord({
  ...canonicalInstantRow,
  id: "inconsistent-stored-offset",
  due_utc_offset_minutes: -300,
});
assert.equal(inconsistentStoredOffset.dueClassification, "invalid");
assert.equal(contract.validateTaskInput({
  title: "DST gap",
  dueKind: "instant",
  dueLocalDateTime: "2026-03-08T02:30",
  dueTimeZone: "America/New_York",
  status: "open",
}, context).isValid, false);

const ambiguous = contract.getZonedLocalCandidates("2026-11-01T01:30", "America/New_York");
assert.equal(ambiguous.length, 2);
assert.deepEqual(ambiguous.map((candidate) => candidate.dueUtcOffsetMinutes), [-240, -300]);
for (const candidate of ambiguous) {
  const repeatedTime = contract.normalizeTaskRecord({
    id: `repeated-${candidate.dueUtcOffsetMinutes}`,
    title: "Repeated local time",
    status: "open",
    due_kind: "instant",
    due_at: candidate.dueAt,
    due_local_datetime: "2026-11-01 01:30",
    due_timezone: "America/New_York",
    due_utc_offset_minutes: candidate.dueUtcOffsetMinutes,
  });
  assert.equal(repeatedTime.dueClassification, "valid");
}
const gapTuple = contract.normalizeTaskRecord({
  id: "dst-gap-tuple",
  title: "DST gap tuple",
  status: "open",
  due_kind: "instant",
  due_at: "2026-03-08T07:30:00.000Z",
  due_local_datetime: "2026-03-08 02:30",
  due_timezone: "America/New_York",
  due_utc_offset_minutes: -300,
});
assert.equal(gapTuple.dueClassification, "invalid");

const completed = contract.buildTaskStateTransitionPayload({
  ...nonePayload,
  id: "state-task",
  title: "State task",
  status: "open",
}, "completed", "2026-07-23T15:00:00.000Z");
assert.equal(completed.isValid, true);
assert.deepEqual(completed.payload, {
  status: "completed",
  completed_at: "2026-07-23T15:00:00.000Z",
});
const completedRecord = { ...nonePayload, id: "state-task", title: "State task", ...completed.payload };
assert.equal(contract.buildTaskStateTransitionPayload(completedRecord, "completed").isNoop, true);
const reopened = contract.buildTaskStateTransitionPayload(completedRecord, "open", "2026-07-23T16:00:00.000Z");
assert.deepEqual(reopened.payload, { status: "open", completed_at: null });
const recompleted = contract.buildTaskStateTransitionPayload({
  ...completedRecord,
  ...reopened.payload,
}, "completed", "2026-07-23T17:00:00.000Z");
assert.equal(recompleted.payload.completed_at, "2026-07-23T17:00:00.000Z");

const projected = contract.projectTasks([
  { ...nonePayload, id: "no-due", title: "No due" },
  { ...datePayload, id: "today", title: "Today", due_date: "2026-07-23" },
  { ...datePayload, id: "upcoming", title: "Upcoming", due_date: "2026-07-24" },
  completedRecord,
  { id: "bad-time", title: "Bad", status: "open", due_kind: "date", due_date: "bad" },
  { ...canonicalInstantRow, id: "inconsistent-utc-instant", due_at: "2026-07-24T14:30:00.000Z" },
  { ...canonicalInstantRow, id: "inconsistent-stored-offset", due_utc_offset_minutes: -300 },
  gapTuple,
  { id: "bad-state", title: "Bad state", status: "mystery", due_kind: "none" },
], "2026-07-23");
assert.deepEqual(projected.open.map((task) => task.id), [
  "bad-time",
  "dst-gap-tuple",
  "inconsistent-stored-offset",
  "inconsistent-utc-instant",
  "no-due",
  "today",
  "upcoming",
]);
assert.deepEqual(projected.completed.map((task) => task.id), ["state-task"]);
assert.deepEqual(projected.today.map((task) => task.id), ["today"]);
assert.deepEqual(projected.upcoming.map((task) => task.id), ["upcoming"]);
const invalidInstantIds = new Set(["inconsistent-utc-instant", "inconsistent-stored-offset", "dst-gap-tuple"]);
for (const datedProjection of [projected.overdue, projected.today, projected.upcoming]) {
  assert.equal(datedProjection.some((task) => invalidInstantIds.has(task.id)), false);
}

const activity = contract.buildActivityItems([completedRecord], []);
assert.equal(activity.length, 1);
assert.equal(activity[0].type, "task");

const migrationPath = path.join(root, "supabase", "migrations", "20260723150000_workspace_tasks_canonical_semantics.sql");
const migration = fs.readFileSync(migrationPath, "utf8");
const schema = fs.readFileSync(path.join(root, "supabase-schema.sql"), "utf8");
for (const marker of [
  "due_kind text",
  "due_local_datetime timestamp without time zone",
  "due_timezone text",
  "due_utc_offset_minutes smallint",
  "growing_phase_id uuid",
  "plant_group_id uuid",
  "grow_session_tasks_due_shape_check",
  "grow_session_tasks_enforce_context",
  "timezone(due_timezone, due_at) = due_local_datetime",
]) assert.ok(migration.includes(marker), `Migration marker missing: ${marker}`);
for (const marker of [
  "Canonical Growing Workspace Tasks (IC-GC-003B)",
  "grow_session_tasks_due_shape_check",
  "grow_session_tasks_enforce_owner",
  "grow_session_tasks_enforce_context",
  "Owners can read their Session tasks",
  "timezone(due_timezone, due_at) = due_local_datetime",
]) assert.ok(schema.includes(marker), `Schema marker missing: ${marker}`);
assert.ok(!migration.match(/update\s+public\.grow_session_tasks/i), "Migration must not backfill existing Tasks.");

console.log("Workspace Tasks regression checks passed.");
