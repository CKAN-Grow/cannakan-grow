const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const styleSource = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const migrationSource = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260521143000_add_grow_gallery_public_note_fields.sql"),
  "utf8",
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(
  indexSource.match(/Community Grow Note/g)?.length >= 2,
  "Expected Community Grow Note labels in create and detail note sections.",
);
assert(
  indexSource.match(/class="session-notes-step-badge" aria-hidden="true">1<\/span>/g)?.length >= 2,
  "Expected numbered Notes step badges in create and detail note sections.",
);
assert(
  indexSource.match(/<span>Private to you<\/span>/g)?.length >= 2,
  "Expected Notes privacy indicators in create and detail note sections.",
);
assert(
  indexSource.match(/data-note-privacy-mode="private" aria-live="polite"/g)?.length >= 2,
  "Expected Notes privacy indicators to expose dynamic state and announce changes.",
);
assert(
  indexSource.match(/Private session notes/g)?.length >= 4,
  "Expected private session notes subtitle and accessible labels in both note sections.",
);
for (const copy of [
  "Keep note private",
  "Only you can see this note",
  "Create separate Community Grow note",
  "Keep your private note separate",
  "Share this note with Community Grow snapshot",
  "Include this note in your snapshot",
  "Your note is saved automatically",
]) {
  assert(indexSource.includes(copy), `Expected redesigned Notes copy: ${copy}`);
}
assert(
  indexSource.match(/This note can be shown with your Community Grow snapshot\./g)?.length >= 2,
  "Expected public Community Grow note helper text in both note sections.",
);
assert(
  indexSource.match(/placeholder="Add a public note for your Community Grow snapshot\.\.\."/g)?.length >= 2,
  "Expected production placeholder copy for both public note textareas.",
);
assert(
  appSource.includes('options.publicGrowNoteField?.closest("[data-public-note-field-shell]")'),
  "Expected snapshot initializer to resolve public note shell from the external notes field.",
);
assert(
  appSource.includes('state.publicGrowNoteFieldShell.hidden = normalizedMode !== "separate";'),
  "Expected separate note mode to reveal and hide the public note field shell.",
);
for (const needle of [
  "function getSessionNotesPrivacyIndicatorMarkup(mode = \"private\")",
  "function syncSessionNotesPrivacyIndicator(state = null, mode = \"private\")",
  "Private note + Community note",
  "Shared with Community Grow",
  "syncSessionNotesPrivacyIndicator(state, normalizedMode);",
]) {
  assert(appSource.includes(needle), `Expected dynamic Notes privacy indicator behavior: ${needle}`);
}
assert(
  appSource.includes('return normalizePublicGrowNote(state?.sessionNotesField?.value || "");'),
  "Expected same-note mode to use the private Session Notes textarea as the shared note source.",
);
assert(
  appSource.includes("public_grow_note: includePublicGrowNote ? publicGrowNote : null")
    && appSource.includes("include_public_grow_note: includePublicGrowNote"),
  "Expected Community Grow publish payload to persist the public note separately.",
);
assert(
  appSource.includes("isSupabaseColumnMissingError(error, \"grow_gallery_snapshots\", [\"include_public_grow_note\", \"public_grow_note\"])"),
  "Expected legacy schema fallback for Community Grow public note columns.",
);
assert(
  styleSource.includes("@keyframes public-note-field-reveal"),
  "Expected polished reveal styling for the separate Community Grow note field.",
);
for (const selector of [
  ".session-notes-header",
  ".session-notes-step-badge",
  ".session-notes-privacy",
  ".session-notes-privacy[data-note-privacy-mode=\"private\"]",
  ".session-notes-privacy[data-note-privacy-mode=\"separate\"]",
  ".session-notes-privacy[data-note-privacy-mode=\"session\"]",
  "@keyframes session-note-privacy-pulse",
  ".session-note-sharing-card-icon",
  ".session-note-sharing-copy",
  ".session-notes-autosave-state",
  ".session-workspace-shell .session-note-sharing-options {\n  grid-template-columns: repeat(3, minmax(0, 1fr));",
]) {
  assert(styleSource.includes(selector), `Expected redesigned Notes style: ${selector}`);
}
for (const needle of [
  "grid-template-columns: auto 30px minmax(0, 1fr);",
  "min-height: 112px;",
  ".session-note-sharing-card-icon svg {\n  width: 22px;\n  height: 22px;",
  ".session-workspace-shell .session-note-sharing-option .session-note-sharing-copy strong {\n  color: #f3f7f0;\n  font-size: 0.98rem;",
  ".session-workspace-shell .session-note-sharing-option .session-note-sharing-copy small {\n  color: rgba(220, 229, 218, 0.7);\n  font-size: 0.84rem;\n  line-height: 1.4;",
]) {
  assert(styleSource.includes(needle), `Expected readable Community Grow sharing card refinement: ${needle}`);
}

const darkPublicNoteBlockMatch = styleSource.match(/body\.theme-dark \.session-workspace-shell \.session-public-note-block \{[\s\S]*?\n\}/);
assert(
  darkPublicNoteBlockMatch,
  "Expected dark theme public note block override.",
);
assert(
  darkPublicNoteBlockMatch[0].includes("border-top: 1px solid rgba(148, 209, 89, 0.16);")
    && darkPublicNoteBlockMatch[0].includes("background: transparent;")
    && darkPublicNoteBlockMatch[0].includes("box-shadow: none;"),
  "Expected Community Grow Sharing divider to stay clean in dark theme.",
);
assert(
  !darkPublicNoteBlockMatch[0].includes("radial-gradient")
    && !darkPublicNoteBlockMatch[0].includes("linear-gradient"),
  "Community Grow Sharing divider must not use glow or gradient effects.",
);
assert(
  migrationSource.includes("add column if not exists include_public_grow_note")
    && migrationSource.includes("add column if not exists public_grow_note"),
  "Expected additive Community Grow public note migration columns.",
);

console.log("Community Grow note sharing regression check passed.");
