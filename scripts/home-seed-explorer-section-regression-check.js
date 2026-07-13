const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function getBetween(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert(start >= 0, `Missing ${startNeedle}`);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert(end > start, `Missing ${endNeedle}`);
  return source.slice(start, end);
}

const homeSecondary = getBetween(
  app,
  "function renderHomeSecondaryInfoRowMarkup",
  "function renderRegisteredMemberCountCardMarkup",
);
const seedRenderer = getBetween(
  app,
  "function renderHomeSeedExplorerPreviewSectionMarkup",
  "function renderHomeCstpTestingIconMarkup",
);
const seedDataHelper = getBetween(
  app,
  "function getHomeSeedExplorerPreviewData",
  "function renderHomeSeedExplorerPreviewSectionMarkup",
);
const iconResolver = getBetween(
  app,
  "function getAppSectionHeaderIconName",
  "function renderAppSectionHeaderIcon",
);

const seedIndex = homeSecondary.indexOf("renderHomeSeedExplorerPreviewSectionMarkup()");
const sourceIndex = homeSecondary.indexOf("renderHomeTestedSourcesPreviewSectionMarkup()");
const cstpIndex = homeSecondary.indexOf("renderHomeCstpOverviewSectionMarkup()");

assert(seedIndex >= 0, "Home secondary flow must render Seed Explorer.");
assert(sourceIndex > seedIndex, "Seed Explorer must render before Source Explorer.");
assert(cstpIndex > sourceIndex, "CSTP must render after Source Explorer.");
assert(seedRenderer.includes("SEED EXPLORER") || seedRenderer.includes("Seed Explorer"), "Seed Explorer header copy is missing.");
assert(seedRenderer.includes("Discover seed varieties through real community germination data."), "Seed Explorer supporting copy is missing.");
assert(seedRenderer.includes('href="#seeds"'), "Seed Explorer CTA must navigate to the existing Seed Explorer route.");
assert(seedRenderer.includes("Trending Varieties"), "Seed Explorer preview must include Trending Varieties.");
assert(seedDataHelper.includes("buildCommunityInsightsState()"), "Seed Explorer Home preview must reuse Community Insights data.");
assert(seedDataHelper.includes("state.mostTestedVarieties"), "Seed Explorer Home preview must use canonical most-tested variety ranking.");
assert(seedDataHelper.includes("getSeedExplorerRecords().sort"), "Seed Explorer Home preview must use the shared completed-session Seed Explorer records.");
assert(!seedRenderer.includes("184") && !seedRenderer.includes("1,240"), "Seed Explorer preview must not hardcode sample stats.");
assert(iconResolver.includes('case "seed"') && iconResolver.includes('return "seedGermination"'), "Shared section icon resolver must support seed markers.");
assert(css.includes(".home-seed-explorer-row"), "Missing Seed Explorer row styling.");

console.log("Home Seed Explorer section regression checks passed.");
