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
  "const panelHeight = partitionItemCount > 8 ? 318 : (partitionItemCount > 0 ? 284 : 228);",
  "const dividerX = x + (roomy ? width * 0.34 : width * 0.292);",
  "const rightRegionX = dividerX + (roomy ? 34 : 26);",
  "const percentFontSize = roomy ? 150 : 78;",
  'context.font = roomy ? "700 27px Arial, sans-serif" : "700 20px Arial, sans-serif";',
  "const gap = roomy ? 10 : (items.length > 8 ? 6 : 8);",
  "const rowHeight = roomy ? 52 : (items.length > 8 ? 34 : 44);",
  "context.font = `700 ${roomy ? 16 : (items.length > 8 ? 10.5 : 13)}px Arial, sans-serif`;",
  "context.font = `600 ${roomy ? 13 : (items.length > 8 ? 8.5 : 10)}px Arial, sans-serif`;",
]) {
  requireNeedle(appSource, needle);
}

console.log("Snapshot partition layout regression check passed.");
