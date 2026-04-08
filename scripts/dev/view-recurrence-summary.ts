import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve(process.cwd(), "Pathwarden", "runtime", "recurrence");

if (!existsSync(dir)) {
  console.log("No recurrence state found.");
  process.exit(0);
}

const files = readdirSync(dir)
  .filter(name => name.endsWith(".json"))
  .sort();

if (files.length === 0) {
  console.log("No recurrence records found.");
  process.exit(0);
}

console.log("Pathwarden Recurrence Summary");
console.log("");

for (const file of files) {
  const path = resolve(dir, file);
  const state = JSON.parse(readFileSync(path, "utf8"));

  console.log(`Task ID: ${state.task_id}`);
  console.log(`  Last Run At: ${state.last_run_at ?? "Never"}`);
  console.log(`  Last Run Key: ${state.last_run_key ?? "None"}`);
  console.log("");
}
