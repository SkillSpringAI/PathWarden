import { listQueuedTasks } from "../../core/tasks/taskStore";

const tasks = listQueuedTasks();

console.log(JSON.stringify({
  ok: true,
  type: "tasks",
  message: tasks.length === 0 ? "No queued tasks found." : "Queued tasks loaded.",
  tasks
}, null, 2));
