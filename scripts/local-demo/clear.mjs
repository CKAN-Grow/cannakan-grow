import { pathToFileURL } from "node:url";
import { assertLocalDemoSafety } from "./safety.mjs";
import { runLocalSql } from "./db.mjs";
import { buildClearSql } from "./fixtures/sql.mjs";

export function clearDemo({ safetyCommand = "clear" } = {}) {
  assertLocalDemoSafety(safetyCommand);
  runLocalSql(buildClearSql());
  console.log("Only manifest-owned local demo records were cleared.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) clearDemo();

