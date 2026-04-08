import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const taskId = process.argv[2];

if (!taskId) {
  console.log("Usage: reset-task-run-state <task_id>");
  process.exit(1);
}

const path = resolve(process.cwd(), "Pathwarden", "runtime", "recurrence", `${taskId}.json`);

if (!existsSync(path)) {
  console.log(`No recurrence state found for task: ${taskId}`);
  process.exit(0);
}

rmSync(path, { force: true });
console.log(`Recurrence state reset for task: ${taskId}`);
