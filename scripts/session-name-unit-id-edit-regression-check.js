const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");

for (const needle of [
  '<button id="detail-edit-session-details" class="button button-secondary" type="button">Edit Session Details</button>',
  '<select name="unitId">',
  '<button id="detail-session-details-save" type="submit" class="button button-primary">Save Details</button>',
]) {
  if (!indexSource.includes(needle)) {
    throw new Error(`Missing editable detail field markup: ${needle}`);
  }
}

for (const needle of [
  "const unitIdField = form.elements.unitId;",
  "unitIdField instanceof HTMLSelectElement",
  "unitIdField.add(new Option(unitId, unitId));",
  "session.unitId = nextUnitId;",
  "unitId: String(detailsForm?.elements?.unitId?.value || session?.unitId || \"\").trim()",
  "unit_id: normalizeUnitIdValue(session.unitId)",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing Session Name / Unit ID edit behavior: ${needle}`);
  }
}

const stageEditingMatch = appSource.match(/function applyStageEditingMode[\s\S]*?function getSessionStageDisplayLabel/);
if (!stageEditingMatch) {
  throw new Error("Could not locate applyStageEditingMode.");
}

if (stageEditingMatch[0].includes('input[name="sessionName"]')) {
  throw new Error("Session Name must not be disabled by stage editing mode.");
}
if (stageEditingMatch[0].includes('select[name="systemType"], select[name="unitId"]')) {
  throw new Error("Unit ID must not be disabled by stage editing mode.");
}

console.log("Session Name and Unit ID edit regression check passed.");
