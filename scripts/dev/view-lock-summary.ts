import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve(process.cwd(), "Pathwarden", "runtime", "locks");

if (!existsSync(dir)) {
  console.log("No lock directory found.");
  process.exit(0);
}

const files = readdirSync(dir)
  .filter(name => name.endsWith(".lock.json"))
  .sort();

if (files.length === 0) {
  console.log("No active task locks found.");
  process.exit(0);
}

console.log("Active Pathwarden Task Locks");
console.log("");

for (const file of files) {
  const fullPath = resolve(dir, file);
  const lock = JSON.parse(readFileSync(fullPath, "utf8"));

  console.log(`Task ID: ${lock.task_id}`);
  console.log(`  Owner PID: ${lock.owner_pid}`);
  console.log(`  Created At: ${lock.created_at}`);
  console.log(`  Expires At: ${lock.expires_at}`);
  console.log("");
}
