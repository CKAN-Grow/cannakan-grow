import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const require = createRequire(import.meta.url);
const contract = require(path.join(root, "src", "grow-companion-contract.js"));

const migration = read("supabase/migrations/20260721180000_grow_companion_phase1.sql");
const app = read("app.js");
const index = read("index.html");
const documentation = read("docs/architecture/grow-companion-capability-1.md");

assert.deepEqual(contract.TASK_STATUSES, ["upcoming", "completed"]);
assert.equal(contract.normalizeTaskRecord({ status: "skipped" }).status, "upcoming", "Unsupported future task states must not enter the Phase 1 contract.");
assert.equal(contract.normalizeDateOnly("2026-07-21"), "2026-07-21");
assert.equal(contract.normalizeDateOnly("2026-02-30"), "", "Invalid calendar dates must be rejected without UTC shifting.");
assert.equal(contract.normalizeTimeOnly("09:05:00"), "09:05");

const groups = contract.groupUpcomingTasks([
  { id: "future-late", title: "Later", due_date: "2026-07-23", due_time: null, status: "upcoming" },
  { id: "today", title: "Today", due_date: "2026-07-21", due_time: "08:30", status: "upcoming" },
  { id: "overdue", title: "Overdue", due_date: "2026-07-20", status: "upcoming" },
  { id: "future-early", title: "Earlier", due_date: "2026-07-23", due_time: "07:15", status: "upcoming" },
  { id: "done", title: "Done", due_date: "2026-07-19", status: "completed", completed_at: "2026-07-19T10:00:00Z" },
], "2026-07-21");
assert.deepEqual(groups.overdue.map((task) => task.id), ["overdue"]);
assert.deepEqual(groups.today.map((task) => task.id), ["today"]);
assert.deepEqual(groups.upcoming.map((task) => task.id), ["future-early", "future-late"]);

const activity = contract.buildActivityItems(
  [{ id: "done", session_id: "session-a", title: "Watered", status: "completed", completed_at: "2026-07-21T15:00:00Z" }],
  [{ id: "event", session_id: "session-a", title: "Transplanted", occurred_date: "2026-07-20", occurred_time: "13:00", category: "transplant" }],
);
assert.deepEqual(activity.map((item) => item.type), ["task", "event"]);
assert.equal(activity[0].sessionId, "session-a");
assert.equal(activity[1].category, "transplant");

assert.match(migration, /create table if not exists public\.grow_session_tasks/);
assert.match(migration, /create table if not exists public\.grow_session_events/);
assert.match(migration, /session_id uuid not null references public\.grow_sessions\(id\) on delete cascade/g);
assert.match(migration, /alter table public\.grow_session_tasks enable row level security/);
assert.match(migration, /alter table public\.grow_session_events enable row level security/);
assert.match(migration, /auth\.uid\(\) = user_id/g);
assert.match(migration, /enforce_grow_session_activity_owner/);
assert.doesNotMatch(migration, /skipped/, "Phase 1 must not persist an unsupported Skip lifecycle.");
assert.doesNotMatch(migration, /grant .* to anon/i, "Anonymous roles must not receive Grow Companion table access.");
assert.doesNotMatch(migration, /(?:references|insert into|update|delete from) public\.(?:gie|community_activity|seed_vault_entries)/i, "Activity persistence must not connect to analytics or public product models.");

assert.match(index, /src\/grow-companion-contract\.js\?v=20260721-grow-companion-capability-1/);
assert.match(app, /GROW_COMPANION_ACTIVITY_TABLES/);
assert.match(app, /\.from\(GROW_COMPANION_ACTIVITY_TABLES\.tasks\)/);
assert.match(app, /\.from\(GROW_COMPANION_ACTIVITY_TABLES\.events\)/);
assert.match(app, /assertDeveloperScenarioWritesAllowed\("sessions", "change Grow Companion activity"/);
assert.match(app, /currentPhaseId !== "grow"/);
assert.match(app, /data-grow-companion-action="add-task"/);
assert.match(app, /data-grow-companion-action="add-event"/);
assert.match(app, /window\.confirm\(`Delete/);
assert.doesNotMatch(app, /localStorage.*grow.?companion|grow.?companion.*localStorage/i);
assert.match(documentation, /Not GIE evidence/i);
assert.match(documentation, /Preview Studio/i);

console.log("Grow Companion Capability 1 regression checks passed.");
