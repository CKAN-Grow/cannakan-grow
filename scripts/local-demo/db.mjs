import { spawnSync } from "node:child_process";
import { LOCAL_DB_CONTAINER, REPOSITORY_ROOT } from "./config.mjs";

export function runLocalSql(sql, { tuplesOnly = false, quiet = false } = {}) {
  const args = ["exec", "-i", LOCAL_DB_CONTAINER, "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1"];
  if (tuplesOnly) args.push("-A", "-t");
  const result = spawnSync("docker", args, { cwd: REPOSITORY_ROOT, input: sql, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(`Local demo database command failed.\n${result.stderr || result.stdout}`);
  }
  if (!quiet && result.stdout) process.stdout.write(result.stdout);
  return String(result.stdout || "").trim();
}

export const sqlLiteral = (value) => value === null || value === undefined
  ? "null"
  : `'${String(value).replaceAll("'", "''")}'`;
export const sqlJson = (value) => `${sqlLiteral(JSON.stringify(value))}::jsonb`;
export const sqlArray = (values) => `array[${values.map(sqlLiteral).join(",")}]::text[]`;

