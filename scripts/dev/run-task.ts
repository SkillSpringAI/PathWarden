import { loadTask } from "../../core/tasks/taskStore";
import { runTask } from "../../core/tasks/taskRunner";

const taskId = process.argv[2];

if (!taskId) {
  console.log(JSON.stringify({
    ok: false,
    type: "task-action",
    action: "run",
    message: "Missing task_id"
  }, null, 2));
  process.exit(0);
}

const task = loadTask(taskId);

if (!task) {
  console.log(JSON.stringify({
    ok: false,
    type: "task-action",
    action: "run",
    task_id: taskId,
    message: "Task not found"
  }, null, 2));
  process.exit(0);
}

const result = runTask(task);

console.log(JSON.stringify({
  ok: result.status === "completed",
  type: "task-action",
  action: "run",
  task_id: taskId,
  message: result.message
}, null, 2));
