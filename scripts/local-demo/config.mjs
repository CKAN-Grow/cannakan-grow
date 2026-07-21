import { fileURLToPath } from "node:url";
import path from "node:path";

export const LOCAL_DEMO_ROOT = path.dirname(fileURLToPath(import.meta.url));
export const REPOSITORY_ROOT = path.resolve(LOCAL_DEMO_ROOT, "..", "..");
export const LOCAL_PROJECT_ID = "Cannakan_Grow_App";
export const LOCAL_DB_CONTAINER = `supabase_db_${LOCAL_PROJECT_ID}`;
export const DEMO_REFERENCE_TIME = "2026-07-15T12:00:00.000Z";
export const DEMO_OWNER_JOINED_AT = "2026-05-02T12:00:00.000Z";
export const DEMO_EXECUTION_MODE = "development";
export const DEMO_OWNER_EMAIL = "founder.demo@example.test";
export const DEMO_OWNER_PASSWORD = "CannaKAN-Local-Demo-2026!";
export const DEMO_OWNER_DISPLAY_NAME = "CannaKAN Demo Founder";
export const DEMO_COMMAND_ARGUMENT = (command) => `--local-demo-command=${command}`;

