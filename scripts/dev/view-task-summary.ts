import { listQueuedTasks } from "../../core/tasks/taskStore";

const tasks = listQueuedTasks();

if (tasks.length === 0) {
  console.log("No queued tasks found.");
  process.exit(0);
}

console.log("Pathwarden Task Summary");
console.log("");

for (const task of tasks) {
  console.log(`Task: ${task.name}`);
  console.log(`  ID: ${task.task_id}`);
  console.log(`  Type: ${task.type}`);
  console.log(`  Status: ${task.status}`);
  console.log(`  Mode: ${task.mode}`);
  console.log(`  Requires Confirmation: ${task.requires_confirmation ? "Yes" : "No"}`);
  console.log(`  Approved: ${task.approved ? "Yes" : "No"}`);
  console.log(`  Auto Run: ${task.auto_run ? "Yes" : "No"}`);
  console.log(`  Scheduled For: ${task.scheduled_for ?? "N/A"}`);
  console.log("");
}
