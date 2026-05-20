const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

const stageColorNeedles = [
  "--stage-color-soaking: #7fb8ff;",
  "--stage-color-germinating: #f39a53;",
  "--stage-color-first-germinated: #94d159;",
  "--stage-color-completed: #b58a61;",
];

for (const needle of stageColorNeedles) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing official stage color: ${needle}`);
  }
}

for (const needle of [
  'germination: "germinating"',
  '"first-germinated": "first-germinated"',
  'actionBar.dataset.currentStageTone = state.currentTone;',
  'actionBar.dataset.nextStageTone = state.nextTone;',
  '.detail-session-action-bar[data-current-stage-tone="germinating"] .detail-stage-progress-card',
  '.detail-session-action-bar[data-next-stage-tone="first-germinated"] .detail-stage-progress-card',
  "--current-stage-accent: var(--stage-color-germinating);",
  "--next-stage-accent: var(--stage-color-first-germinated);",
]) {
  const source = needle.startsWith(".") || needle.startsWith("--") ? stylesSource : appSource;
  if (!source.includes(needle)) {
    throw new Error(`Missing Update Stage color mapping behavior: ${needle}`);
  }
}

console.log("Stage color mapping regression check passed.");
