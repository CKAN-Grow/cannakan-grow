import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowlistRelativePath = "scripts/gee-terminology-legacy-allowlist.json";
const allowlistPath = path.join(root, allowlistRelativePath);
const writeAllowlist = process.argv.includes("--write-allowlist");
const legacyShort = ["g", "i", "e"].join("");
const legacyProductWords = ["Grow", "Intelligence", "Engine"].join(" ");
const legacySqlStem = ["grow", "intelligence", "engine"].join("_");
const transitionalA = [legacyShort.toUpperCase(), "GEE"].join("/");
const transitionalB = ["GEE", legacyShort.toUpperCase()].join("/");
const excludedPrefixes = [
  ".git/",
  ".edge-test/",
  ".chrome-test/",
  ".qa-home/",
  ".qa-home-live/",
  "node_modules/",
  "test-results/",
  "playwright-report/",
  "coverage/",
  "dist/",
  "build/",
  "out/",
];
const textExtensions = new Set([
  ".cjs", ".css", ".html", ".js", ".json", ".md", ".mjs", ".ps1", ".sql",
  ".svg", ".toml", ".txt", ".xml", ".yaml", ".yml",
]);

function normalizePath(value) {
  return String(value || "").replaceAll("\\", "/").replace(/^\.\//, "");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function getRepositoryFiles() {
  const output = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  return output.split("\0")
    .map(normalizePath)
    .filter(Boolean)
    .filter((relativePath) => relativePath !== allowlistRelativePath)
    .filter((relativePath) => !excludedPrefixes.some((prefix) => relativePath.startsWith(prefix)))
    .filter((relativePath) => textExtensions.has(path.extname(relativePath).toLowerCase()))
    .filter((relativePath) => fs.existsSync(path.join(root, relativePath)));
}

function createLegacyPattern() {
  return new RegExp(
    [
      transitionalA.replace("/", "\\/"),
      transitionalB.replace("/", "\\/"),
      legacyProductWords,
      legacySqlStem + "(?:_[A-Za-z0-9]+)*",
      "(?<![A-Za-z0-9])" + legacyShort + "(?![A-Za-z0-9])",
    ].join("|"),
    "gi",
  );
}

function extractIdentifier(text, start, length) {
  const allowed = /[A-Za-z0-9_./#*:-]/;
  let left = start;
  let right = start + length;
  while (left > 0 && allowed.test(text[left - 1])) left -= 1;
  while (right < text.length && allowed.test(text[right])) right += 1;
  return text.slice(left, right) || text.slice(start, start + length);
}

function reasonFor(relativePath, source) {
  if (source === "path" && relativePath.startsWith("scripts/" + legacyShort + "-")) {
    return "E: legacy regression filename retained because the local security workflow discovers the released suite by its compatibility filename.";
  }
  if (relativePath.startsWith("supabase/migrations/")) {
    return "F: immutable released migration; SQL objects, version values, assertions, comments, and filename are historical compatibility records.";
  }
  if (relativePath === "scripts/security/approved-security-fingerprint.json") {
    return "E: generated security fingerprint records exact released database identifiers and cannot be cosmetically renamed.";
  }
  if (relativePath === "app.js") {
    return "E: released RPC name, contract-version value, or legacy route alias retained for runtime compatibility.";
  }
  if (relativePath.startsWith("docs/")) {
    return "E: active documentation names an exact released RPC, contract version, migration filename, route alias, or historical Git tag.";
  }
  if (relativePath.startsWith("tests/") || relativePath.startsWith("scripts/")) {
    return "C/E: focused regression or local verification literal protects a released RPC, version, route, migration, fingerprint, or compatibility filename.";
  }
  return "E: reviewed legacy compatibility identifier with no current-facing product terminology.";
}

function collectOccurrences() {
  const occurrences = [];
  for (const relativePath of getRepositoryFiles()) {
    const absolutePath = path.join(root, relativePath);
    const content = fs.readFileSync(absolutePath, "utf8");
    const lines = content.split(/\r?\n/);
    lines.forEach((lineText, index) => {
      const pattern = createLegacyPattern();
      let match;
      while ((match = pattern.exec(lineText)) !== null) {
        occurrences.push({
          path: relativePath,
          source: "content",
          line: index + 1,
          column: match.index + 1,
          match: match[0],
          identifier: extractIdentifier(lineText, match.index, match[0].length),
          line_sha256: sha256(lineText),
          reason: reasonFor(relativePath, "content"),
        });
        if (match[0].length === 0) pattern.lastIndex += 1;
      }
    });

    const pathPattern = createLegacyPattern();
    let pathMatch;
    while ((pathMatch = pathPattern.exec(relativePath)) !== null) {
      occurrences.push({
        path: relativePath,
        source: "path",
        line: 0,
        column: pathMatch.index + 1,
        match: pathMatch[0],
        identifier: extractIdentifier(relativePath, pathMatch.index, pathMatch[0].length),
        line_sha256: sha256(relativePath),
        reason: reasonFor(relativePath, "path"),
      });
      if (pathMatch[0].length === 0) pathPattern.lastIndex += 1;
    }
  }
  return occurrences.sort((left, right) => (
    left.path.localeCompare(right.path)
    || left.source.localeCompare(right.source)
    || left.line - right.line
    || left.column - right.column
    || left.match.localeCompare(right.match)
  ));
}

function occurrenceKey(entry) {
  return [
    entry.path,
    entry.source,
    entry.line,
    entry.column,
    entry.match,
    entry.identifier,
    entry.line_sha256,
  ].join("|");
}

const occurrences = collectOccurrences();

if (writeAllowlist) {
  const payload = {
    version: 1,
    canonical_name: "GEE",
    canonical_expansion: "Grow Evidence Engine",
    rule: "Every legacy occurrence is exact and reviewed; new or changed occurrences fail.",
    entries: occurrences,
  };
  fs.writeFileSync(allowlistPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log("Wrote exact GEE legacy terminology allowlist (" + occurrences.length + " entries).");
  process.exit(0);
}

if (!fs.existsSync(allowlistPath)) {
  throw new Error("Missing exact legacy terminology allowlist: " + allowlistRelativePath);
}

const allowlist = JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
const allowedByKey = new Map((allowlist.entries || []).map((entry) => [occurrenceKey(entry), entry]));
const currentByKey = new Map(occurrences.map((entry) => [occurrenceKey(entry), entry]));
const unexpected = occurrences.filter((entry) => !allowedByKey.has(occurrenceKey(entry)));
const stale = (allowlist.entries || []).filter((entry) => !currentByKey.has(occurrenceKey(entry)));

if (unexpected.length || stale.length) {
  const details = [];
  if (unexpected.length) {
    details.push("Unexpected legacy terminology:\n" + unexpected.map((entry) => (
      "  " + entry.path + ":" + entry.line + ":" + entry.column + " " + JSON.stringify(entry.identifier)
    )).join("\n"));
  }
  if (stale.length) {
    details.push("Stale allowlist entries:\n" + stale.map((entry) => (
      "  " + entry.path + ":" + entry.line + ":" + entry.column + " " + JSON.stringify(entry.identifier)
    )).join("\n"));
  }
  throw new Error(details.join("\n\n"));
}

const currentFacingPattern = new RegExp(
  [
    transitionalA.replace("/", "\\/"),
    transitionalB.replace("/", "\\/"),
    legacyProductWords,
    "(?<![A-Za-z0-9])" + legacyShort.toUpperCase() + "(?![A-Za-z0-9])",
  ].join("|"),
);
const currentFacingOutsideHistory = occurrences.filter((entry) => (
  !entry.path.startsWith("supabase/migrations/")
  && currentFacingPattern.test(entry.match)
));
if (currentFacingOutsideHistory.length) {
  throw new Error(
    "Current-facing legacy terminology remains outside immutable migrations:\n"
    + currentFacingOutsideHistory.map((entry) => "  " + entry.path + ":" + entry.line + " " + entry.match).join("\n"),
  );
}

console.log(
  "GEE terminology regression passed: current-facing legacy terminology is absent; "
  + occurrences.length
  + " exact compatibility occurrences are allowlisted.",
);