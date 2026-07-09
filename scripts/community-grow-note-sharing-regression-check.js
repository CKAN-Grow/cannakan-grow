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
  indexSource.match(/Private to you/g)?.length >= 2,
  "Expected Notes privacy indicators in create and detail note sections.",
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
  ".session-note-sharing-card-icon",
  ".session-note-sharing-copy",
  ".session-notes-autosave-state",
  ".session-workspace-shell .session-note-sharing-options {\n  grid-template-columns: repeat(3, minmax(0, 1fr));",
]) {
  assert(styleSource.includes(selector), `Expected redesigned Notes style: ${selector}`);
}
assert(
  migrationSource.includes("add column if not exists include_public_grow_note")
    && migrationSource.includes("add column if not exists public_grow_note"),
  "Expected additive Community Grow public note migration columns.",
);

console.log("Community Grow note sharing regression check passed.");
