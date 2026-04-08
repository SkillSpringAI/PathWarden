import { loadTaskLock } from "../../core/tasks/taskLockManager";

const taskId = process.argv[2];

if (!taskId) {
  console.log("Usage: view-task-lock <task_id>");
  process.exit(1);
}

const lock = loadTaskLock(taskId);

if (!lock) {
  console.log(`No lock found for task: ${taskId}`);
  process.exit(0);
}

console.log(JSON.stringify(lock, null, 2));
