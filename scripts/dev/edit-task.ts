import { loadTask, updateTask } from "../../core/tasks/taskStore";
import { editTaskField } from "../../core/tasks/taskEditor";

const taskId = process.argv[2];
const field = process.argv[3];
const value = process.argv.slice(4).join(" ");

if (!taskId || !field || !value) {
  console.log('Usage: edit-task <task_id> <field> <value>');
  process.exit(1);
}

const task = loadTask(taskId);

if (!task) {
  console.log(`Task not found: ${taskId}`);
  process.exit(1);
}

try {
  const updated = editTaskField(task, field, value);
  updateTask(updated);
  console.log(JSON.stringify(updated, null, 2));
} catch (error) {
  console.log(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
