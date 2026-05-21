const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing snapshot partition layout behavior: ${label}`);
  }
}

for (const needle of [
  "const panelHeight = partitionItemCount > 8 ? 392 : (partitionItemCount > 0 ? 354 : 228);",
  "const inset = roomy ? 72 : 30;",
  "const dividerX = x + (roomy ? width * 0.295 : width * 0.255);",
  "const rightRegionX = dividerX + (roomy ? 26 : 22);",
  "const percentFontSize = roomy ? 138 : 78;",
  'context.font = roomy ? "800 32px Arial, sans-serif" : "800 25px Arial, sans-serif";',
  "const columnCount = 4;",
  "const gap = roomy ? 14 : (items.length > 8 ? 9 : 10);",
  "const rowHeight = roomy ? 68 : (items.length > 8 ? 45 : 68);",
  "context.font = `800 ${roomy ? 22 : (items.length > 8 ? 14 : 18)}px Arial, sans-serif`;",
  "context.font = `700 ${roomy ? 18 : (items.length > 8 ? 11.5 : 14)}px Arial, sans-serif`;",
]) {
  requireNeedle(appSource, needle);
}

console.log("Snapshot partition layout regression check passed.");
