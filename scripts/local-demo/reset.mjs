import { pathToFileURL } from "node:url";
import { clearDemo } from "./clear.mjs";
import { seedDemo } from "./seed.mjs";
import { verifyDemo } from "./verify.mjs";

export async function resetDemo() {
  clearDemo({ safetyCommand: "reset" });
  seedDemo({ safetyCommand: "reset" });
  await verifyDemo({ safetyCommand: "reset" });
  console.log("Local demo reset returned the proof dataset to its deterministic state.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await resetDemo();

