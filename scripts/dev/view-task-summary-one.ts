import { loadTask } from "../../core/tasks/taskStore";

const taskId = process.argv[2];

if (!taskId) {
  console.log("Usage: view-task-summary-one <task_id>");
  process.exit(1);
}

const task = loadTask(taskId);

if (!task) {
  console.log(`Task not found: ${taskId}`);
  process.exit(1);
}

console.log(`Task: ${task.name}`);
console.log(`  ID: ${task.task_id}`);
console.log(`  Type: ${task.type}`);
console.log(`  Status: ${task.status}`);
console.log(`  Mode: ${task.mode}`);
console.log(`  Requires Confirmation: ${task.requires_confirmation ? "Yes" : "No"}`);
console.log(`  Approved: ${task.approved ? "Yes" : "No"}`);
console.log(`  Auto Run: ${task.auto_run ? "Yes" : "No"}`);
console.log(`  Scheduled For: ${task.scheduled_for ?? "N/A"}`);
console.log(`  Description: ${task.description ?? "N/A"}`);
