import { releaseTaskLock } from "../../core/tasks/taskLockManager";

const taskId = process.argv[2];

if (!taskId) {
  console.log("Usage: reset-task-lock <task_id>");
  process.exit(1);
}

releaseTaskLock(taskId);
console.log(`Lock released for task: ${taskId}`);
