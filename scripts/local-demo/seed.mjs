import { pathToFileURL } from "node:url";
import { assertLocalDemoSafety } from "./safety.mjs";
import { runLocalSql } from "./db.mjs";
import { buildSeedSql } from "./fixtures/sql.mjs";

export function seedDemo({ safetyCommand = "seed" } = {}) {
  assertLocalDemoSafety(safetyCommand);
  runLocalSql(buildSeedSql());
  console.log("Deterministic local demo proof dataset reconciled successfully.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) seedDemo();

