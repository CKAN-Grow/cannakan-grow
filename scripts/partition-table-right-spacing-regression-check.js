const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

for (const needle of [
  "grid-template-columns: 104px minmax(116px, 0.44fr) minmax(260px, 1.12fr) minmax(124px, 144px) minmax(124px, 144px) 88px minmax(122px, 132px) minmax(104px, 112px);",
  "grid-template-columns: 104px minmax(112px, 0.42fr) minmax(250px, 1.06fr) minmax(124px, 142px) minmax(124px, 142px) 84px minmax(118px, 128px) minmax(122px, 132px) minmax(104px, 112px);",
  "padding: 17px 32px 17px 22px;",
  "min-height: 58px;",
  "linear-gradient(180deg, rgba(148, 209, 89, 0.24), rgba(74, 120, 54, 0.13))",
  "border-bottom: 1px solid rgba(148, 209, 89, 0.3);",
  '.chart-header [data-partition-header="germinated"],',
  '.chart-header [data-partition-header="success"]',
  '.partition-row label:has(input[name="plantedCount"]),',
  ".partition-row .success-cell",
  '.partition-row label:has(input[name="plantedCount"]) input[name="plantedCount"]',
  "text-align: center;",
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing partition table right-spacing behavior: ${needle}`);
  }
}

console.log("Partition table right spacing regression check passed.");
