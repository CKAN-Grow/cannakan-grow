import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { REPOSITORY_ROOT } from "../local-demo/config.mjs";

const run = (command, args) => {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: REPOSITORY_ROOT,
    stdio: "inherit",
    shell: process.platform === "win32" && /\.(?:cmd|bat)$/i.test(command),
    windowsHide: true,
  });
  if (result.status !== 0) process.exit(result.status || 1);
};
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const node = process.execPath;

run(npx, ["supabase", "db", "reset"]);
run(npm, ["run", "demo:seed"]);
run(npm, ["run", "demo:verify"]);
run(npm, ["run", "security:access-audit"]);
run(npm, ["run", "security:fingerprint"]);
run(npm, ["run", "security:function-audit"]);
run(npm, ["run", "security:function-hardening"]);

const regressionNames = readdirSync(resolve(REPOSITORY_ROOT, "scripts"))
  .filter((name) => /^(?:gie-|canonical-rank-display|community-insights|explorer-completed-session-aggregate|grow-intelligence-health|seed-vault-owner-analytics-ambiguity|source-report-redesign).*regression-check\.js$/.test(name))
  .sort();
for (const name of regressionNames) run(node, [resolve(REPOSITORY_ROOT, "scripts", name)]);

run(npx, ["supabase", "db", "lint", "--local", "--level", "warning"]);
run(npx, ["playwright", "test"]);
run(npm, ["run", "build"]);
run("git", ["diff", "--check"]);

console.log("\nComplete security verification passed.");
