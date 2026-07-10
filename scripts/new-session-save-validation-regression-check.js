const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8").replace(/\r\n/g, "\n");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function indexOfNeedle(needle) {
  const index = appSource.indexOf(needle);
  assert(index >= 0, `Missing app source: ${needle}`);
  return index;
}

[
  "function validateNewSessionRequiredFields(form)",
  "function getNewSessionPartitionValidationCopy(validation = {})",
  "function setFeedbackMessageBlock(element, title = \"\", message = \"\", tone = \"\")",
  "function focusInvalidSessionField(field)",
  "Please complete all required fields or clear the row before saving.",
  "Please complete or remove all incomplete rows before saving.",
  "Something went wrong while saving your session. Please try again.",
  "console.error(\"Failed to save session\", error);",
  "row.classList.toggle(\"partition-row--save-invalid\", rowInvalid);",
].forEach((needle) => assert(appSource.includes(needle), `Missing validation behavior: ${needle}`));

const persistStart = indexOfNeedle("const persistNewSession = async");
const requiredValidationIndex = appSource.indexOf("const requiredFieldValidation = validateNewSessionRequiredFields(form);", persistStart);
const partitionValidationIndex = appSource.indexOf("const validation = validatePartitions(form, { showMessage: true });", persistStart);
const uploadIndex = appSource.indexOf("session.sessionImages = await uploadPendingSessionImages(form, session.id, imageSection);", persistStart);
const createCloudIndex = appSource.indexOf(": await createCloudSession(session);", persistStart);
assert(requiredValidationIndex > persistStart, "Required session fields must validate inside persistNewSession.");
assert(partitionValidationIndex > requiredValidationIndex, "Partition validation must run after required session fields.");
assert(partitionValidationIndex < uploadIndex, "Partition validation must run before image upload.");
assert(partitionValidationIndex < createCloudIndex, "Partition validation must run before Supabase session creation.");

[
  "setFeedbackMessageBlock(formMessage, requiredFieldValidation.title, requiredFieldValidation.message, \"error\");",
  "setFeedbackMessageBlock(formMessage, validationCopy.title, validationCopy.message, \"error\");",
  "focusInvalidSessionField(validation.firstInvalidField || validation.firstInvalidRow);",
  "setUnsavedChangesLastSaveError(new Error(genericSaveError), genericSaveError);",
  "setFeedbackMessage(formMessage, genericSaveError, \"error\");",
].forEach((needle) => assert(appSource.includes(needle), `Missing guarded save UI behavior: ${needle}`));

[
  ".form-message strong",
  ".form-message span",
  "body.theme-dark .partition-row.partition-row--save-invalid",
  "inset 4px 0 0 rgba(255, 180, 88, 0.7)",
].forEach((needle) => assert(stylesSource.includes(needle), `Missing validation styling: ${needle}`));

console.log("New Session save validation regression check passed.");
