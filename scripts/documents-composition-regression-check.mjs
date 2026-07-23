import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const documents = require(path.join(root, "src", "documents-composition.js"));
const workspace = require(path.join(root, "src", "workspace-composition.js"));

const sessionId = "00000000-0000-4000-8000-000000000701";
const ownerId = "00000000-0000-4000-8000-000000000702";
const rawDocument = {
  id: "00000000-0000-4000-8000-000000000703",
  session_id: sessionId,
  owner_id: ownerId,
  structured_meaning: {
    kind: "cultivation-record",
    sections: [{ heading: "Observation", values: ["Canopy remains even."] }],
  },
};
const rawSnapshot = JSON.stringify(rawDocument);
const canonicalDocument = documents.normalizeDocumentRecord(rawDocument, { sessionId, ownerId });

assert.deepEqual(canonicalDocument, {
  id: rawDocument.id,
  sessionId,
  ownerId,
  structuredMeaning: rawDocument.structured_meaning,
});
assert.ok(Object.isFrozen(canonicalDocument));
assert.ok(Object.isFrozen(canonicalDocument.structuredMeaning));
assert.ok(Object.isFrozen(canonicalDocument.structuredMeaning.sections));
assert.equal(JSON.stringify(rawDocument), rawSnapshot);
assert.equal(documents.normalizeDocumentRecord({ ...rawDocument, id: "" }, { sessionId, ownerId }), null);
assert.equal(documents.normalizeDocumentRecord({ ...rawDocument, session_id: "other" }, { sessionId, ownerId }), null);
assert.equal(documents.normalizeDocumentRecord({ ...rawDocument, owner_id: "other" }, { sessionId, ownerId }), null);
assert.equal(documents.normalizeDocumentRecord({ ...rawDocument, structured_meaning: null }, { sessionId, ownerId }), null);

const canonicalDocuments = documents.normalizeDocumentRecords([rawDocument], { sessionId, ownerId });
assert.equal(canonicalDocuments.length, 1);
assert.ok(Object.isFrozen(canonicalDocuments));

const composed = workspace.composeWorkspace({
  sessionId,
  documents: [
    canonicalDocument,
    Object.freeze({ ...canonicalDocument, id: "other-document", sessionId: "other-session" }),
  ],
});
assert.equal(composed.documents.length, 1);
assert.strictEqual(composed.documents[0], canonicalDocument);
assert.ok(Object.isFrozen(composed.documents));

const documentSource = fs.readFileSync(path.join(root, "src", "documents-composition.js"), "utf8");
const workspaceSource = fs.readFileSync(path.join(root, "src", "workspace-composition.js"), "utf8");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const serviceWorkerSource = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");

assert.doesNotMatch(documentSource, /localStorage|sessionStorage|indexedDB|fetch\(|\.from\(/);
assert.doesNotMatch(documentSource, /lifecycle|evidence|representation|render|upload|storage/i);
assert.ok(workspaceSource.includes("documentsContract"));
assert.doesNotMatch(workspaceSource, /normalizeDocumentRecord|normalizeDocumentRecords/);
assert.ok(appSource.includes("normalizeDocumentRecords"));
assert.ok(appSource.includes("root.dataset.workspaceDocumentCount = String(composition.documents.length)"));
assert.ok(indexSource.includes('/src/documents-composition.js'));
assert.ok(serviceWorkerSource.includes('"/src/documents-composition.js"'));

console.log("Documents Composition regression checks passed.");
