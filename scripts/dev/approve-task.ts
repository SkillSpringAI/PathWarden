import { approveTask } from "../../core/tasks/taskStore";

const taskId = process.argv[2];

if (!taskId) {
  console.log(JSON.stringify({
    ok: false,
    type: "task-action",
    message: "Missing task_id"
  }));
  process.exit(0);
}

const result = approveTask(taskId);

console.log(JSON.stringify({
  ok: result,
  type: "task-action",
  action: "approve",
  task_id: taskId,
  message: result ? "Task approved" : "Task not found"
}, null, 2));
