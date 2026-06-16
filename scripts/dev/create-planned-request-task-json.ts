import { saveTask } from "../../core/tasks/taskStore";
import type { PathwardenTask } from "../../core/tasks/taskTypes";
import { makeId } from "../../core/common/ids";
import { nowIso } from "../../core/common/time";

const requestText = process.argv.slice(2).join(" ").trim();

if (!requestText) {
  console.log(JSON.stringify({
    ok: false,
    type: "planned-request-task",
    message: "No request text provided."
  }, null, 2));
  process.exit(1);
}

const task: PathwardenTask = {
  task_id: makeId("planned-request"),
  name: "Planned Request Approval",
  description: "Approval-gated planned request created from user intent.",
  type: "custom",
  mode: "core",
  status: "pending",
  created_at: nowIso(),
  requires_confirmation: true,
  approved: false,
  auto_run: false,
  payload: {
    notes: requestText
  }
};

const path = saveTask(task);

console.log(JSON.stringify({
  ok: true,
  type: "planned-request-task",
  message: "Planned request task created.",
  task,
  path
}, null, 2));
