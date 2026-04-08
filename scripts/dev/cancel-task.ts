import { cancelTask } from "../../core/tasks/taskStore";

const taskId = process.argv[2];

if (!taskId) {
  console.log(JSON.stringify({
    ok: false,
    type: "task-action",
    message: "Missing task_id"
  }));
  process.exit(0);
}

const result = cancelTask(taskId);

console.log(JSON.stringify({
  ok: result,
  type: "task-action",
  action: "cancel",
  task_id: taskId,
  message: result ? "Task cancelled" : "Task not found"
}, null, 2));
