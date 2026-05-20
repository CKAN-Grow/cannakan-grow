const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

const systemIdSelectMatch = indexSource.match(/<select name="unitId">([\s\S]*?)<\/select>/);
if (!systemIdSelectMatch) {
  throw new Error("New Session System ID must render as select[name=\"unitId\"].");
}

if (indexSource.includes('input type="text" name="unitId"')) {
  throw new Error("New Session System ID should no longer render as a free-text input.");
}

const optionValues = [...systemIdSelectMatch[1].matchAll(/<option value="([^"]*)">/g)].map((match) => match[1]);
const expectedValues = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
if (JSON.stringify(optionValues) !== JSON.stringify(expectedValues)) {
  throw new Error(`System ID options mismatch: expected ${expectedValues.join(",")} but found ${optionValues.join(",")}`);
}

if (!systemIdSelectMatch[1].includes("<option value=\"\">Not selected</option>")) {
  throw new Error("System ID select must include a blank Not selected option.");
}

if (!appSource.includes('formData.get("unitId")')) {
  throw new Error("New Session save path must continue reading unitId from FormData.");
}

if (!appSource.includes('unit_id: normalizeUnitIdValue(session.unitId)')) {
  throw new Error("Supabase save payload must continue persisting session.unitId to unit_id.");
}

if (!appSource.includes('select[name="systemType"], select[name="unitId"]')) {
  throw new Error("Stage edit mode must disable the System ID select with related system controls.");
}

if (!stylesSource.includes(".session-workspace-shell .system-id-field select")) {
  throw new Error("System ID select must share the styled session workspace dropdown treatment.");
}

console.log("System ID select regression check passed.");
