import { loadTask } from "../../core/tasks/taskStore";

const taskId = process.argv[2];

if (!taskId) {
  console.log("Usage: view-task <task_id>");
  process.exit(1);
}

const task = loadTask(taskId);

if (!task) {
  console.log(`Task not found: ${taskId}`);
  process.exit(1);
}

console.log(JSON.stringify(task, null, 2));
