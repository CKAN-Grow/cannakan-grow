const fs = require("fs");
const path = require("path");

const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

const requiredNeedles = [
  "adminTutorialActionSaving",
  "Publishing...",
  "Tutorial published successfully. Published to local preview.",
  "Tutorial draft saved. Saved to local preview.",
  "Tutorial marked Coming Soon. Saved to local preview.",
  "showAdminTutorialActionToast",
  "handleAdminTutorialFormSubmit",
  "waitForAdminTutorialActionPaint",
  "console.log(\"[Tutorial Admin] Tutorial action succeeded.\"",
  "console.error(\"[Tutorial Admin] Tutorial action failed.\"",
];

const missingNeedles = requiredNeedles.filter((needle) => !appSource.includes(needle));
if (missingNeedles.length) {
  throw new Error(`Learn tutorial publish feedback regression: missing ${missingNeedles.join(", ")}`);
}

const submitHandlerPattern = /data-admin-tutorial-form[\s\S]*?addEventListener\("submit"[\s\S]*?handleAdminTutorialFormSubmit/;
if (!submitHandlerPattern.test(appSource)) {
  throw new Error("Learn tutorial publish feedback regression: tutorial form submit must use handleAdminTutorialFormSubmit.");
}

const publishButtonPattern = /renderAdminTutorialSaveButtonMarkup\("published", "button button-primary", tutorial\.id\)/;
if (!publishButtonPattern.test(appSource)) {
  throw new Error("Learn tutorial publish feedback regression: publish button must render through feedback-aware helper.");
}

console.log("Learn tutorial publish feedback regression checks passed.");
