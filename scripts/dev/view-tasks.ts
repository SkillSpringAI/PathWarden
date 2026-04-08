import { listQueuedTasks } from "../../core/tasks/taskStore";

const tasks = listQueuedTasks();

if (tasks.length === 0) {
  console.log("No queued tasks found.");
  process.exit(0);
}

console.log(JSON.stringify(tasks, null, 2));
