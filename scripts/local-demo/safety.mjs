import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { DEMO_COMMAND_ARGUMENT, DEMO_EXECUTION_MODE, LOCAL_DB_CONTAINER, LOCAL_PROJECT_ID, REPOSITORY_ROOT } from "./config.mjs";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "host.docker.internal"]);
const URL_ENV_PATTERN = /(?:SUPABASE|DATABASE).*(?:URL|HOST)|CANNAKAN_SUPABASE_URL/i;
const SECRET_ENV_PATTERN = /SUPABASE.*(?:SERVICE_ROLE|SECRET).*KEY|CANNAKAN_SUPABASE_SERVICE_ROLE_KEY/i;

function parseUrlHost(value) {
  try { return new URL(value).hostname.toLowerCase(); } catch { return ""; }
}

export function evaluateSafety(context) {
  const failures = [];
  const checks = [];
  const check = (name, passed, detail) => {
    checks.push({ name, passed: Boolean(passed), detail });
    if (!passed) failures.push(`${name}: ${detail}`);
  };
  const mode = String(context.nodeEnv || context.executionMode || "").toLowerCase();
  check("development execution mode", ["development", "test"].includes(mode), `received ${mode || "unset"}`);
  check("dedicated demo command", context.argv?.includes(DEMO_COMMAND_ARGUMENT(context.command)), `expected ${DEMO_COMMAND_ARGUMENT(context.command)}`);
  check("npm demo lifecycle", context.lifecycleEvent === `demo:${context.command}`, `received ${context.lifecycleEvent || "unset"}`);
  check("local API URL", LOCAL_HOSTS.has(parseUrlHost(context.status?.API_URL)), String(context.status?.API_URL || "missing"));
  check("local database URL", LOCAL_HOSTS.has(parseUrlHost(context.status?.DB_URL)), String(context.status?.DB_URL || "missing"));
  check("local project config", context.configProjectId === LOCAL_PROJECT_ID, `received ${context.configProjectId || "missing"}`);
  check("local Docker project label", context.dockerProjectLabel === LOCAL_PROJECT_ID, `received ${context.dockerProjectLabel || "missing"}`);
  check("local database identity", context.databaseIdentity === "postgres|postgres|supabase-local", `received ${context.databaseIdentity || "missing"}`);
  check("no remote project target", !context.remoteProjectTarget, String(context.remoteProjectTarget || "none"));
  for (const [name, value] of Object.entries(context.environment || {})) {
    if (URL_ENV_PATTERN.test(name) && value) check(`environment ${name} is local`, LOCAL_HOSTS.has(parseUrlHost(value)), value);
    if (SECRET_ENV_PATTERN.test(name) && value) {
      const isLocalKey = value === context.status?.SERVICE_ROLE_KEY || value === context.status?.SECRET_KEY;
      check(`environment ${name} is the active local key`, isLocalKey, isLocalKey ? "local key matched" : "non-local key rejected");
    }
  }
  check("no safety override arguments", !(context.argv || []).some((arg) => /force|skip-safety|override|remote/i.test(arg)), "override-style arguments are forbidden");
  return { passed: failures.length === 0, failures, checks };
}

export function collectRuntimeSafetyContext(command) {
  const statusResult = process.platform === "win32"
    ? spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", "npx supabase status -o json"], { cwd: REPOSITORY_ROOT, encoding: "utf8" })
    : spawnSync("npx", ["supabase", "status", "-o", "json"], { cwd: REPOSITORY_ROOT, encoding: "utf8" });
  if (statusResult.status !== 0) throw new Error(`Local Supabase is not running.\n${statusResult.error?.message || statusResult.stderr || statusResult.stdout || "Supabase status failed"}`);
  const status = JSON.parse(statusResult.stdout);
  const configText = fs.readFileSync(path.join(REPOSITORY_ROOT, "supabase", "config.toml"), "utf8");
  const configProjectId = configText.match(/^project_id\s*=\s*"([^"]+)"/m)?.[1] || "";
  const inspectResult = spawnSync("docker", ["inspect", LOCAL_DB_CONTAINER, "--format", "{{json .Config.Labels}}"], { cwd: REPOSITORY_ROOT, encoding: "utf8" });
  if (inspectResult.status !== 0) throw new Error(`Expected local Supabase database container ${LOCAL_DB_CONTAINER} is unavailable.`);
  const labels = JSON.parse(inspectResult.stdout);
  const identityResult = spawnSync("docker", ["exec", LOCAL_DB_CONTAINER, "psql", "-U", "postgres", "-d", "postgres", "-A", "-t", "-c", "select current_database() || '|' || current_user || '|supabase-local';"], { cwd: REPOSITORY_ROOT, encoding: "utf8" });
  if (identityResult.status !== 0) throw new Error("Could not positively identify the local Supabase database.");
  return {
    command, nodeEnv: process.env.NODE_ENV || "", executionMode: DEMO_EXECUTION_MODE,
    argv: process.argv.slice(2), lifecycleEvent: process.env.npm_lifecycle_event || "",
    status, configProjectId, dockerProjectLabel: labels["com.supabase.cli.project"] || "",
    databaseIdentity: identityResult.stdout.trim(),
    remoteProjectTarget: process.env.SUPABASE_PROJECT_REF || process.env.SUPABASE_REMOTE_PROJECT || "",
    environment: process.env,
  };
}

export function assertLocalDemoSafety(command) {
  const result = evaluateSafety(collectRuntimeSafetyContext(command));
  if (!result.passed) {
    throw new Error(`LOCAL DEMO SAFETY CHECK FAILED — no database writes were attempted.\n- ${result.failures.join("\n- ")}`);
  }
  console.log(`Local demo safety checks passed for demo:${command} (${LOCAL_PROJECT_ID}).`);
  return result;
}
