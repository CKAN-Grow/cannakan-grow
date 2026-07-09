const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");

const requiredNeedles = [
  ".session-workspace-shell .progress-chart-heading,\n.session-workspace-shell .session-images-heading > div {\n  display: grid;\n  grid-template-columns: 64px minmax(0, 1fr);",
  "grid-template-areas:\n    \"icon eyebrow\"\n    \"icon title\";",
  ".session-workspace-shell .progress-chart-heading > .section-title-with-icon,\n.session-workspace-shell .session-images-heading .section-title-with-icon {\n  display: contents;",
  ".session-workspace-shell .progress-chart-heading > .section-title-with-icon > svg.section-title-icon,\n.session-workspace-shell .session-images-heading .section-title-with-icon > svg.section-title-icon {\n  grid-area: icon;\n  width: 64px;",
  ".session-notes-step-badge",
  ".session-notes-header",
];

for (const needle of requiredNeedles) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing New Session section header icon rule: ${needle}`);
  }
}

const workspaceHeaderBlock = stylesSource.match(
  /\.session-workspace-shell \.progress-chart-heading,\n\.session-workspace-shell \.session-images-heading > div \{[\s\S]*?\n\}/,
);

if (!workspaceHeaderBlock) {
  throw new Error("Could not find New Session workspace heading block.");
}

if (!workspaceHeaderBlock[0].includes("64px minmax(0, 1fr)") || !workspaceHeaderBlock[0].includes('"icon eyebrow"')) {
  throw new Error("New Session main section headings should keep icons left of the eyebrow/title block.");
}

const titleWithIconBlock = stylesSource.match(
  /\.session-workspace-shell \.progress-chart-heading > \.section-title-with-icon,[\s\S]*?\.session-workspace-shell \.session-images-heading \.section-title-with-icon \{[\s\S]*?\n\}/,
);

if (!titleWithIconBlock || !titleWithIconBlock[0].includes("display: contents")) {
  throw new Error("New Session section title wrappers should flatten into the shared left-icon/right-copy grid.");
}

if (stylesSource.includes('grid-template-areas:\n      "icon"\n      "eyebrow"\n      "title";')) {
  throw new Error("Partition Chart header icons should not stack above titles on mobile.");
}

console.log("New Session section header icon regression check passed.");
