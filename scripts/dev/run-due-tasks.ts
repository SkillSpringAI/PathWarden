import { listQueuedTasks } from "../../core/tasks/taskStore";
import { isTaskDue, canAutoRun, hasAlreadyRunInCurrentWindow } from "../../core/tasks/taskScheduler";
import { runTask } from "../../core/tasks/taskRunner";
import { recordTaskRun } from "../../core/tasks/taskRunRecorder";
import { acquireGlobalLock, releaseGlobalLock } from "../../core/common/globalLock";

const lockAttempt = acquireGlobalLock("due-task-runner");

if (!lockAttempt.ok) {
  console.log(lockAttempt.reason);
  process.exit(1);
}

try {
  const tasks = listQueuedTasks();
  const dueTasks = tasks.filter(task => isTaskDue(task));

  if (dueTasks.length === 0) {
    console.log("No due tasks found.");
    process.exit(0);
  }

  const results = [];

  for (const task of dueTasks) {
    if (!canAutoRun(task)) {
      results.push({
        task_id: task.task_id,
        status: "skipped",
        message: "Task is due but not eligible for auto-run"
      });
      continue;
    }

    if (hasAlreadyRunInCurrentWindow(task)) {
      results.push({
        task_id: task.task_id,
        status: "skipped",
        message: "Task already ran in current recurrence window"
      });
      continue;
    }

    const result = runTask(task);
    results.push(result);

    if (result.status === "completed") {
      recordTaskRun(task);
    }
  }

  console.log(JSON.stringify(results, null, 2));
} finally {
  releaseGlobalLock("due-task-runner");
}
