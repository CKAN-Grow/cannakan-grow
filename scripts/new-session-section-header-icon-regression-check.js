const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

const requiredNeedles = [
  ".session-workspace-shell .progress-chart-heading,\n.session-workspace-shell .session-images-heading > div,\n.session-workspace-shell .session-notes-section > .session-notes-field {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);",
  ".session-workspace-shell .progress-chart-heading > .section-title-with-icon,\n.session-workspace-shell .session-images-heading .section-title-with-icon,\n.session-workspace-shell .session-notes-section > .session-notes-field > .section-title-with-icon {\n  display: inline-flex;",
  ".session-workspace-shell .progress-chart-heading > .section-title-with-icon > svg.section-title-icon,\n.session-workspace-shell .session-images-heading .section-title-with-icon > svg.section-title-icon,\n.session-workspace-shell .session-notes-section > .session-notes-field > .section-title-with-icon > svg.section-title-icon {\n  width: 38px;",
  ".session-workspace-shell .session-notes-section > .session-notes-field:has(> .session-detail-lower-heading)",
];

for (const needle of requiredNeedles) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing New Session section header icon rule: ${needle}`);
  }
}

const workspaceHeaderBlock = stylesSource.match(
  /\.session-workspace-shell \.progress-chart-heading,\n\.session-workspace-shell \.session-images-heading > div,\n\.session-workspace-shell \.session-notes-section > \.session-notes-field \{[\s\S]*?\n\}/,
);

if (!workspaceHeaderBlock) {
  throw new Error("Could not find New Session workspace heading block.");
}

if (workspaceHeaderBlock[0].includes("grid-template-areas") || workspaceHeaderBlock[0].includes("64px minmax")) {
  throw new Error("New Session main section headings should not place icons in a separate spanning grid column.");
}

const titleWithIconBlock = stylesSource.match(
  /\.session-workspace-shell \.progress-chart-heading > \.section-title-with-icon,[\s\S]*?\.session-workspace-shell \.session-notes-section > \.session-notes-field > \.section-title-with-icon \{[\s\S]*?\n\}/,
);

if (!titleWithIconBlock || titleWithIconBlock[0].includes("display: contents")) {
  throw new Error("New Session section icons must stay inside the title row, not be flattened into the parent grid.");
}

console.log("New Session section header icon regression check passed.");
