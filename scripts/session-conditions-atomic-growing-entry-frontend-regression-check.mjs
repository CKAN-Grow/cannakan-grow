import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const growing = fs.readFileSync(new URL("../src/growing-foundation.js", import.meta.url), "utf8");

function between(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `Missing start boundary: ${start}`);
  assert.notEqual(endIndex, -1, `Missing end boundary: ${end}`);
  return source.slice(startIndex, endIndex);
}

const atomicAdapter = between(
  app,
  "async function enterCanonicalGrowing",
  "async function attachCanonicalGrowingCommencementsToSessions",
);
const directSubmission = between(
  app,
  "const persistNewSession = async",
  "registerUnsavedChangesContext",
);
const decisionHandler = between(
  app,
  "function bindSessionPhaseFoundation",
  "function renderSessionDetail",
);

assert.match(atomicAdapter, /rpc\("enter_canonical_growing_with_initial_conditions", rpcInput\)/);
assert.match(atomicAdapter, /p_initial_conditions: initialConditions/);
assert.match(atomicAdapter, /fetchCanonicalSessionConditions\(session\.id\)/);
assert.match(atomicAdapter, /data\?\.operation_kind !== "begin_growing"/);
assert.match(atomicAdapter, /data\?\.status !== "success"/);
assert.match(atomicAdapter, /Number\(data\?\.canonical_revision\) !== 2/);
assert.doesNotMatch(atomicAdapter, /rpc\("enter_canonical_growing"/);
assert.doesNotMatch(atomicAdapter, /declare_session_condition|change_current_session_conditions/);

assert.match(app, /CANONICAL_GROWING_OPERATION_STORAGE_KEY/);
assert.match(app, /localStorage\.setItem\(storageKey, JSON\.stringify\(\{/);
assert.match(app, /stored\?\.fingerprint !== fingerprint/);
assert.match(app, /function bindDirectGrowingOperationInitialConditions/);
assert.match(directSubmission, /form\.dataset\.beginGrowingPending === "true"/);
assert.match(directSubmission, /getNewSessionSaveButtons\(form\).*button\.disabled = true/);
assert.match(directSubmission, /createCloudSession\(session, \{ initialConditions \}\)/);
assert.match(directSubmission, /retireDirectGrowingOperation\(savedSession\)/);

assert.match(growing, /function renderBeginGrowingInitialConditionsMarkup/);
assert.match(growing, /data-begin-growing-condition="environment_type"/);
assert.match(growing, /data-begin-growing-condition="grow_method"/);
assert.match(growing, /function readBeginGrowingInitialConditions/);
assert.match(app, /renderBeginGrowingInitialConditionsMarkup\("direct-growing-entry"\)/);
assert.match(app, /renderBeginGrowingInitialConditionsMarkup\("post-germination"\)/);

assert.match(decisionHandler, /root\.dataset\.beginGrowingPending === "true"/);
assert.match(decisionHandler, /getCanonicalGrowingOperationId\([\s\S]*initialConditions/);
assert.match(decisionHandler, /enterCanonicalGrowing\(session, \{[\s\S]*initialConditions/);
assert.match(decisionHandler, /retireCanonicalGrowingOperation\(saved\)/);
assert.match(decisionHandler, /delete root\.dataset\.beginGrowingPending/);
assert.match(decisionHandler, /button\.disabled = false/);

console.log("Atomic Begin Growing frontend integration regression checks passed.");
