const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

const removedUserFacingMessages = [
  ["Community Grow schema", " is out of date. ", "Apply the latest database schema."],
  ["Community Grow data store", " is missing. ", "Run the latest schema setup."],
  ["Community Grow likes are unavailable", " until the latest Supabase schema is applied."],
  ["Community Grow publishing is not available", " until Supabase Storage is ready."],
].map((parts) => parts.join(""));

removedUserFacingMessages.forEach((message) => {
  assert(
    !appSource.includes(message),
    `Community Grow should not expose developer/schema copy: ${message}`,
  );
});

[
  "const COMMUNITY_GROW_TEMPORARILY_UNAVAILABLE_MESSAGE = \"Community Grow is temporarily unavailable. Please try again shortly.\";",
  "function isCommunityGrowSchemaMismatchError(error)",
  "return COMMUNITY_GROW_TEMPORARILY_UNAVAILABLE_MESSAGE;",
  "\"Community Grow duplicate check is unavailable; publishing without duplicate detection.\"",
  "throw new Error(\"Community Grow likes are temporarily unavailable.\");",
].forEach((needle) => {
  assert(appSource.includes(needle), `Expected polished Community Grow schema fallback behavior: ${needle}`);
});

assert(
  appSource.includes("if (isCommunityGrowSchemaMismatchError(error))")
    && appSource.includes("logRuntimeIssueOnce("),
  "Expected Community Grow schema mismatches to remain logged internally.",
);

console.log("Community Grow schema warning regression check passed.");
