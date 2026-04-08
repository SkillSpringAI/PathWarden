import { listQueuedTasks } from "../../core/tasks/taskStore";

const tasks = listQueuedTasks();

const pendingApproval = tasks.filter(task => task.requires_confirmation && !task.approved && task.status !== "cancelled");
const scheduled = tasks.filter(task => task.status === "scheduled");
const autoRunnable = tasks.filter(task => task.auto_run && task.approved && !task.requires_confirmation);

console.log("Pathwarden Task Warnings");
console.log("");

if (pendingApproval.length === 0 && scheduled.length === 0 && autoRunnable.length === 0) {
  console.log("No task warnings or notices.");
  process.exit(0);
}

if (pendingApproval.length > 0) {
  console.log(`Pending approval tasks: ${pendingApproval.length}`);
  for (const task of pendingApproval) {
    console.log(`  - ${task.task_id} | ${task.name} | ${task.type}`);
  }
  console.log("");
}

if (scheduled.length > 0) {
  console.log(`Scheduled tasks: ${scheduled.length}`);
  for (const task of scheduled) {
    console.log(`  - ${task.task_id} | ${task.name} | ${task.scheduled_for ?? "schedule object"}`);
  }
  console.log("");
}

if (autoRunnable.length > 0) {
  console.log(`Auto-runnable approved tasks: ${autoRunnable.length}`);
  for (const task of autoRunnable) {
    console.log(`  - ${task.task_id} | ${task.name} | ${task.type}`);
  }
  console.log("");
}
