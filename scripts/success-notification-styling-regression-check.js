const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

[
  "function setFeedbackMessageTone(element, tone = \"\")",
  "function setFeedbackMessage(element, message = \"\", tone = \"\")",
  "setFeedbackMessage(",
  "Session saved.",
  "savedSession ? \"success\" : \"error\"",
  "setFeedbackMessage(notesMessage, \"Note saved.\", \"success\")",
  "setFeedbackMessage(detail.notesMessage, \"Note saved.\", \"success\")",
  "setSnapshotMessage(state, \"Snapshot submitted to Community Grow for review.\");",
  "showNavigationLockToast({",
  "message: \"Vault Entry saved.\"",
].forEach((needle) => {
  assert(appSource.includes(needle), `Expected app.js success styling behavior: ${needle}`);
});

[
  ".form-message.is-error",
  ".form-message.is-success",
  "body.theme-dark .form-message.is-error",
  "body.theme-dark .form-message.is-success",
  ".session-detail-edit-message.is-success",
  ".session-notes-message.is-success",
  ".snapshot-message.is-success",
  ".seed-vault-form-message.is-success",
  ".profile-page-message.is-success",
].forEach((needle) => {
  assert(stylesSource.includes(needle), `Expected styles.css success styling rule: ${needle}`);
});

assert(
  stylesSource.indexOf(".form-message.is-error") < stylesSource.indexOf(".form-message.is-success"),
  "Form message error and success states should be explicit, separate states.",
);

console.log("Success notification styling regression check passed.");
