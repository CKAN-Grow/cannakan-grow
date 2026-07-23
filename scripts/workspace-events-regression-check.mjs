import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const contract = require(path.resolve(__dirname, "../src/grow-companion-contract.js"));
const sessionId = "11111111-1111-4111-8111-111111111111";
const ownerId = "22222222-2222-4222-8222-222222222222";
const phaseId = "33333333-3333-4333-8333-333333333333";
const groupId = "44444444-4444-4444-8444-444444444444";
const context = { sessionId, growingPhase: { id: phaseId, sessionId, plantGroups: [{ id: groupId, growingPhaseId: phaseId }] } };
const canonicalTypes = ["observation", "maintenance", "environment", "treatment", "transplant", "harvest", "issue", "other"];
assert.deepEqual(contract.EVENT_CATEGORIES.map(({ id }) => id), canonicalTypes);

const dateValidation = contract.validateEventInput({ title: "Watered", details: "", category: "maintenance", occurredKind: "date", occurredDate: "2026-07-23", growingPhaseId: phaseId, plantGroupId: groupId }, context);
assert.equal(dateValidation.isValid, true);
const datePayload = contract.buildEventPersistencePayload(dateValidation.value, { sessionId, ownerId });
assert.deepEqual(datePayload, {
  session_id: sessionId, user_id: ownerId, growing_phase_id: phaseId, plant_group_id: groupId,
  title: "Watered", details: "", category: "maintenance", occurred_kind: "date",
  occurred_date: "2026-07-23", occurred_time: null, occurred_at: null,
  occurred_local_datetime: null, occurred_timezone: null, occurred_utc_offset_minutes: null, origin: "user",
});
assert.equal(contract.validateEventInput({ ...dateValidation.value, growingPhaseId: "wrong" }, context).isValid, false);

const candidates = contract.getZonedLocalCandidates("2026-11-01T01:30", "America/New_York");
assert.equal(candidates.length, 2);
for (const candidate of candidates) {
  const result = contract.validateEventInput({ category: "observation", occurredKind: "instant", occurredLocalDateTime: "2026-11-01T01:30", occurredTimeZone: "America/New_York", occurredUtcOffsetMinutes: candidate.dueUtcOffsetMinutes }, context);
  assert.equal(result.isValid, true);
  const payload = contract.buildEventPersistencePayload(result.value, { sessionId, ownerId });
  assert.equal(payload.occurred_at, candidate.dueAt);
  assert.equal(payload.occurred_utc_offset_minutes, candidate.dueUtcOffsetMinutes);
}
assert.equal(contract.validateEventInput({ category: "observation", occurredKind: "instant", occurredLocalDateTime: "2026-03-08T02:30", occurredTimeZone: "America/New_York" }, context).isValid, false);
assert.equal(contract.validateEventInput({ category: "other", occurredKind: "date", occurredDate: "2026-07-23" }, context).isValid, false);

const legacy = contract.normalizeEventRecord({ id: "legacy", session_id: sessionId, occurred_date: "2026-07-20", occurred_time: "09:15", category: "plant-health", origin: "system" });
assert.equal(legacy.occurrenceClassification, "legacy");
assert.equal(legacy.categoryClassification, "legacy");
assert.equal(legacy.category, "plant-health");
assert.equal(legacy.originClassification, "legacy");
assert.equal(legacy.origin, "system");
const malformed = contract.normalizeEventRecord({ id: "bad", session_id: sessionId, occurred_kind: "instant", occurred_at: "2026-07-23T16:00:00Z", occurred_local_datetime: "2026-07-23 09:00", occurred_timezone: "America/New_York", occurred_utc_offset_minutes: -240, category: "mystery", origin: "robot" });
assert.equal(malformed.occurrenceClassification, "invalid");
assert.equal(malformed.rawOccurrence.occurredAt, "2026-07-23T16:00:00Z");
assert.equal(malformed.categoryClassification, "invalid");
assert.equal(malformed.rawCategory, "mystery");
assert.equal(malformed.originClassification, "invalid");
assert.equal(malformed.rawOrigin, "robot");
assert.equal(contract.buildActivityItems([], [malformed]).length, 0);

const canonicalRow = { id: "event-1", ...datePayload, created_at: "2026-07-23T12:00:00Z", updated_at: "2026-07-23T12:00:00Z" };
const mapped = contract.normalizeEventRecord(canonicalRow);
assert.equal(mapped.id, "event-1");
assert.equal(mapped.sessionId, sessionId);
assert.equal(mapped.growingPhaseId, phaseId);
assert.equal(mapped.plantGroupId, groupId);
assert.equal(mapped.occurrenceClassification, "canonical");
assert.equal(mapped.categoryClassification, "canonical");
assert.equal(contract.buildActivityItems([], [canonicalRow])[0].sourceId, "event-1");

const migration = fs.readFileSync(path.resolve(__dirname, "../supabase/migrations/20260723160000_workspace_events_canonical_semantics.sql"), "utf8");
const schema = fs.readFileSync(path.resolve(__dirname, "../supabase-schema.sql"), "utf8");
for (const source of [migration, schema]) {
  for (const marker of ["occurred_kind", "occurred_local_datetime", "occurred_timezone", "occurred_utc_offset_minutes", "enforce_grow_session_event_context", "enforce_grow_session_event_canonical_write", "new.created_at is distinct from old.created_at", "timezone(occurred_timezone, occurred_at) = occurred_local_datetime", "on delete set null"]) assert.ok(source.includes(marker), marker);
}
assert.equal((schema.match(/create table if not exists public\.grow_session_events/g) || []).length, 1);
assert.ok(!/update\s+public\.grow_session_events\s+set/i.test(migration));
assert.ok(!/delete\s+from\s+public\.grow_session_events/i.test(migration));
for (const marker of [
  "alter table public.grow_session_events enable row level security",
  'create policy "Owners can read their Session events"',
  'create policy "Owners can create their Session events"',
  'create policy "Owners can update their Session events"',
  'create policy "Owners can delete their Session events"',
  "revoke all on public.grow_session_events from public, anon, authenticated, service_role",
  "grant select, insert, update, delete on public.grow_session_events to authenticated",
]) assert.ok(schema.includes(marker), `Event security boundary: ${marker}`);for (const marker of [
  "create table if not exists public.grow_session_events",
  "create or replace function public.enforce_grow_session_event_context()",
  "create or replace function public.enforce_grow_session_event_canonical_write()",
  "create trigger grow_session_events_enforce_context",
  "create trigger grow_session_events_enforce_canonical_write",
  "create trigger grow_session_events_enforce_owner",
  "create trigger grow_session_events_set_updated_at",
]) assert.equal(schema.split(marker).length - 1, 1, `duplicate schema object: ${marker}`);
for (const marker of [
  "'observation', 'maintenance', 'environment', 'treatment'",
  "occurred_kind = 'date'",
  "occurred_kind = 'instant'",
  "grow_session_events_canonical_occurrence_idx",
]) {
  assert.ok(migration.includes(marker), `migration parity: ${marker}`);
  assert.ok(schema.includes(marker), `schema parity: ${marker}`);
}console.log("Growing Workspace Event regression checks passed.");
