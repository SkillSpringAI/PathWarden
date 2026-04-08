import { loadTaskRunState } from "../../core/tasks/recurrenceState";

const taskId = process.argv[2];

if (!taskId) {
  console.log("Usage: view-task-run-state <task_id>");
  process.exit(1);
}

const state = loadTaskRunState(taskId);
console.log(JSON.stringify(state, null, 2));
