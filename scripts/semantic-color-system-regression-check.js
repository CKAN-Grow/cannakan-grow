const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const app = read("app.js");
const styles = read("styles.css").replace(/\r\n/g, "\n");

const checks = [
  ["canonical entity tokens", [
    "--grow-color-variety: #94d159;",
    "--grow-color-seed: #b8875b;",
    "--grow-color-source: #55cae7;",
    "--grow-color-collection: #b889e8;",
    "--grow-color-grower: var(--grow-color-variety);",
    "--grow-color-recognition: #e9b34d;",
  ].every((token) => styles.includes(token))],
  ["canonical planning and inventory-state tokens", [
    "--grow-color-planned: #e9b34d;",
    "--grow-color-testing: var(--grow-color-variety);",
    "--grow-color-growalong: var(--grow-color-source);",
    "--grow-color-favorite: #e84c5b;",
    "--grow-color-healthy: var(--grow-color-variety);",
    "--grow-color-low-stock: #eda05a;",
    "--grow-color-out-of-stock: #ec6572;",
    "--grow-color-older-seed: #dbb768;",
    "--grow-color-recent: var(--grow-color-source);",
    "--grow-color-archived: #9aa49d;",
  ].every((token) => styles.includes(token))],
  ["legacy brand green aliases canonical variety green", styles.includes("--cannakan-brand-green: var(--grow-color-variety);")],
  ["shared KPI mapper distinguishes canonical entities", [
    'return { tone: "variety", icon: "seedVault" };',
    'return { tone: "collection", icon: "seedVault" };',
    'return { tone: "seed", icon: "mySessionsSprout" };',
    'return { tone: "source", icon: "sourceDirectoryBars" };',
    'return { tone: "grower", icon: "communityGroup" };',
  ].every((fragment) => app.includes(fragment))],
  ["shared KPI tones consume semantic tokens", [
    ".grow-kpi-card.is-variety,",
    ".grow-kpi-card.is-seed {",
    "--grow-kpi-icon: var(--grow-color-seed);",
    "--grow-kpi-icon: var(--grow-color-source);",
    "--grow-kpi-icon: var(--grow-color-collection);",
  ].every((fragment) => styles.includes(fragment))],
  ["Seed Vault overview uses entity tokens", [
    ".seed-vault-overview-stat.is-varieties .seed-vault-overview-stat-icon {\n  color: var(--grow-color-variety);",
    ".seed-vault-overview-stat.is-seeds .seed-vault-overview-stat-icon {\n  color: var(--grow-color-seed);",
    ".seed-vault-overview-stat.is-sources .seed-vault-overview-stat-icon {\n  color: var(--grow-color-source);",
    ".seed-vault-overview-stat.is-collections .seed-vault-overview-stat-icon {\n  color: var(--grow-color-collection);",
  ].every((fragment) => styles.includes(fragment))],
  ["Seed Vault planning uses planning tokens", [
    "color: var(--grow-color-planned);",
    "color: var(--grow-color-testing);",
    "color: var(--grow-color-growalong);",
  ].every((fragment) => styles.includes(fragment))],
  ["Seed Vault health and favorite states use semantic tokens", [
    "color: var(--grow-color-healthy);",
    "color: var(--grow-color-low-stock);",
    "color: var(--grow-color-out-of-stock);",
    "color: var(--grow-color-older-seed);",
    "color: var(--grow-color-recent);",
    "color: var(--grow-color-favorite);",
  ].every((fragment) => styles.includes(fragment))],
  ["Community entity charts use canonical tokens", [
    "--community-glance-chart-accent: var(--grow-color-seed);",
    "--community-glance-chart-accent: var(--grow-color-source);",
    "--community-glance-chart-accent: var(--grow-color-variety);",
  ].every((fragment) => styles.includes(fragment))],
  ["Recognition uses canonical gold", styles.includes("--recognition-accent: var(--grow-color-recognition);")],
  ["Explorer metric modifiers use seed and source tokens", [
    ".source-directory-hero-stat-card--seeds,",
    ".seed-explorer-stat-card--seeds {",
    "--source-directory-metric-accent: var(--grow-color-seed);",
    ".source-directory-hero-stat-card--attribution,",
    "--source-directory-metric-accent: var(--grow-color-source);",
  ].every((fragment) => styles.includes(fragment))],
  ["Grow Network uses canonical grower and source tokens", [
    "--network-accent: var(--grow-color-grower);",
    "--network-accent: var(--grow-color-source);",
  ].every((fragment) => styles.includes(fragment))],
  ["known conflicting entity colors are removed", ![
    "--community-glance-chart-accent: #b8d85a;",
    "--community-glance-chart-accent: #55c98a;",
    "--community-glance-chart-accent: #78d8d0;",
    ".seed-vault-overview-stat.is-seeds .seed-vault-overview-stat-icon {\n  color: #b5e965;",
    ".seed-vault-entry-status-pill.is-testing {\n  border-color: rgba(60, 199, 232, 0.28);",
    ".seed-vault-entry-status-pill.is-grow-along {\n  border-color: rgba(181, 140, 255, 0.28);",
  ].some((fragment) => styles.includes(fragment))],
];

const failures = checks.filter(([, passed]) => !passed);
if (failures.length) {
  for (const [label] of failures) console.error(`FAIL: ${label}`);
  process.exit(1);
}

for (const [label] of checks) console.log(`PASS: ${label}`);
console.log(`Semantic color system regression check passed (${checks.length}/${checks.length}).`);
