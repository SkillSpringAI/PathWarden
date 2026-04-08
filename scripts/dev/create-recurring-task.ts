import { makeId } from "../../core/common/ids";
import { nowIso } from "../../core/common/time";
import { saveTask } from "../../core/tasks/taskStore";
import type { PathwardenTask, TaskType, TaskSchedule } from "../../core/tasks/taskTypes";

const type = (process.argv[2] ?? "run_diagnostics") as TaskType;
const name = process.argv[3] ?? `Recurring ${type}`;
const kind = (process.argv[4] ?? "daily") as "daily" | "weekly";
const hour = Number(process.argv[5] ?? "9");
const minute = Number(process.argv[6] ?? "0");
const dayOfWeek = Number(process.argv[7] ?? "1");

const schedule: TaskSchedule =
  kind === "weekly"
    ? { kind: "weekly", day_of_week: dayOfWeek, hour, minute }
    : { kind: "daily", hour, minute };

const mutatingTypes: TaskType[] = ["execute_plan"];
const autoRunnable = ["run_diagnostics", "export_audit", "validate_plan"].includes(type);

const task: PathwardenTask = {
  task_id: makeId("task"),
  name,
  type,
  mode: "core",
  status: "scheduled",
  created_at: nowIso(),
  schedule,
  requires_confirmation: mutatingTypes.includes(type),
  approved: !mutatingTypes.includes(type),
  auto_run: autoRunnable
};

const path = saveTask(task);

console.log(JSON.stringify(task, null, 2));
console.log(`Recurring task written to: ${path}`);
