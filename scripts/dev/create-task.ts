import { makeId } from "../../core/common/ids";
import { nowIso } from "../../core/common/time";
import { saveTask } from "../../core/tasks/taskStore";
import type { PathwardenTask, TaskType } from "../../core/tasks/taskTypes";

const type = (process.argv[2] ?? "run_diagnostics") as TaskType;
const name = process.argv[3] ?? `Task ${type}`;
const scheduledFor = process.argv[4];

const mutatingTypes: TaskType[] = ["execute_plan"];

const task: PathwardenTask = {
  task_id: makeId("task"),
  name,
  type,
  mode: "core",
  status: scheduledFor ? "scheduled" : "pending",
  created_at: nowIso(),
  scheduled_for: scheduledFor || undefined,
  requires_confirmation: mutatingTypes.includes(type),
  approved: !mutatingTypes.includes(type),
  auto_run: false
};

const path = saveTask(task);

console.log(JSON.stringify(task, null, 2));
console.log(`Task written to: ${path}`);
