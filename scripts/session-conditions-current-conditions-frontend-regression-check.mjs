import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const growing = fs.readFileSync(new URL("../src/growing-foundation.js", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const completionMigration = fs.readFileSync(new URL("../supabase/migrations/20260808120000_session_conditions_ice_sc_003_completion.sql", import.meta.url), "utf8");
const atomicMigration = fs.readFileSync(new URL("../supabase/migrations/20260808130000_atomic_growing_entry_initial_conditions.sql", import.meta.url), "utf8");

function between(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `Missing start boundary: ${start}`);
  assert.notEqual(endIndex, -1, `Missing end boundary: ${end}`);
  return source.slice(startIndex, endIndex);
}

const changedSet = between(
  growing,
  "function getCanonicalCurrentConditionsChangedSet",
  "async function changeCanonicalCurrentConditions",
);
const mutation = between(
  growing,
  "async function changeCanonicalCurrentConditions",
  "async function persistCanonicalSessionConditions",
);
const productUi = between(
  growing,
  "const SESSION_CONDITION_LABELS",
  "function normalizeGrowingChoice",
);
const growingWorkspace = between(
  app,
  "function renderSessionGrowingPhaseBodyMarkup",
  "function getGrowCompanionActivityController",
);
const historicalWorkspace = between(
  app,
  "function renderSessionGrowingRecordFoundationMarkup",
  "function renderSessionReflectionPhaseBodyMarkup",
);
const germinationDecision = between(
  app,
  "function renderPostGerminationDecisionMarkup",
  "function getSessionCurrentPhaseDescription",
);
const growingEvidenceUi = between(
  growing,
  "function renderGrowingSummaryMarkup",
  "function readGrowingDraft",
);

assert.match(app, /rpc\("enter_canonical_growing_with_initial_conditions", rpcInput\)/);
assert.equal((app.match(/rpc\("enter_canonical_growing_with_initial_conditions"/g) || []).length, 1);
assert.match(germinationDecision, /renderBeginGrowingInitialConditionsMarkup\("post-germination"\)/);
assert.match(germinationDecision, /Continuing starts the Growing phase with the conditions selected below\./);
assert.doesNotMatch(germinationDecision, /Neither choice creates Growing evidence\./);
assert.match(germinationDecision, /data-post-germination-decision="grow" disabled aria-disabled="true"/);
assert.doesNotMatch(germinationDecision, /renderSessionCurrentConditionsMarkup/);

assert.match(growingWorkspace, /renderSessionCurrentConditionsMarkup\(session\)/);
assert.match(historicalWorkspace, /renderSessionCurrentConditionsMarkup\(session, \{ readOnly: true \}\)/);
assert.match(app, /initializeSessionCurrentConditions\(root, session\)/);
assert.match(index, /src\/growing-foundation\.js\?v=20260809-current-conditions-5/);
assert.match(index, /styles\.css\?v=20260809-current-conditions-5/);
assert.doesNotMatch(growingEvidenceUi, /<legend>Grow Context<\/legend>/);
assert.match(growingEvidenceUi, /managed above in Current Conditions/);

assert.match(productUi, /View Conditions/);
assert.match(productUi, /Change Conditions/);
assert.match(productUi, /Condition History/);
assert.match(productUi, /Correct a Record/);
assert.match(productUi, /No changes to save/);
assert.match(productUi, /Effective now/);
assert.match(productUi, /This record will be marked Corrected\./);
assert.match(productUi, /Earlier conditions unavailable/);
assert.doesNotMatch(productUi, /session-current-conditions-status|const statusLabel\s*=/);
assert.match(productUi, /select name="record" required/);
assert.match(productUi, /data-session-conditions-correction-target/);
assert.match(productUi, /Record to correct/);
assert.match(productUi, /Selected record/);
assert.doesNotMatch(productUi, /Canonical record revision|Selected canonical record|selected canonical record|correction-eligible canonical records|<span>Canonical record<\/span>/);
assert.match(productUi, /type="submit" class="button button-primary" disabled>Save correction/);
assert.match(productUi, /submit\.disabled = !proposal\.valid \|\| !proposal\.changed/);
assert.match(productUi, /proposal\.record\.periodId/);
assert.match(growing, /function syncBeginGrowingInitialConditionsState/);

assert.match(changedSet, /changes\.grow_method/);
assert.match(changedSet, /changes\.environment_type/);
assert.match(changedSet, /changedDimensions: Object\.keys\(changes\)/);
assert.match(mutation, /rpc\("change_current_session_conditions"/);
assert.match(mutation, /status: "no_change"/);
assert.match(productUi, /fetchCanonicalSessionConditions\(controller\.sessionId\)/);
assert.match(productUi, /fetchCanonicalSessionConditionHistory\(controller\.sessionId\)/);
assert.match(productUi, /correctCanonicalCurrentSessionCondition\(conditions, proposal\.record\.periodId, correction\)/);
assert.match(productUi, /setCanonicalCurrentConditionsForUnresolvedLegacy/);
assert.doesNotMatch(productUi, /\.from\(/);

assert.match(completionMigration, /change_current_session_conditions\(\s*p_session_id uuid,\s*p_operation_id uuid,\s*p_changes jsonb,\s*p_expected_revision bigint\s*\)/s);
assert.match(atomicMigration, /enter_canonical_growing_with_initial_conditions\(\s*p_session_id uuid,\s*p_operation_id uuid,\s*p_entry_path text,\s*p_initial_conditions jsonb,\s*p_expected_updated_at timestamptz default null,\s*p_session_record jsonb default null\s*\)/s);

for (const selector of [
  ".session-current-conditions",
  ".session-current-conditions-grid",
  ".session-conditions-dialog",
  ".session-condition-history-list",
]) {
  assert.ok(styles.includes(selector), `Missing Current Conditions style: ${selector}`);
}
assert.match(styles, /@media \(max-width: 720px\)[\s\S]*\.session-current-conditions-grid/);
assert.match(styles, /\.session-current-conditions-actions \.button \{[\s\S]*?min-height: 44px/);
assert.match(styles, /\.growing-context-grid label\[hidden\] \{\s*display: none;/);
assert.match(styles, /\.session-conditions-form label\[hidden\] \{\s*display: none;/);

console.log("Current Conditions frontend integration regression checks passed.");
