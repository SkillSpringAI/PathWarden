import { makeId } from "../../core/common/ids";
import { nowIso } from "../../core/common/time";
import { saveTask } from "../../core/tasks/taskStore";
import type { PathwardenTask } from "../../core/tasks/taskTypes";
import type { PathwardenCommit, PathwardenPlan } from "../../core/kernel/types";

const sourcePath = "C:\\Users\\Laptop\\Documents\\PathWardenTest\\in\\sample.txt";
const destinationPath = "C:\\Users\\Laptop\\Documents\\PathWardenTest\\out\\sample.txt";

const planId = makeId("plan");

const plan: PathwardenPlan = {
  plan_id: planId,
  risk_level: "medium",
  requires_confirmation: true,
  actions: [
    {
      type: "filesystem",
      operation: "move",
      selector: {
        path: sourcePath
      },
      destination: {
        path: destinationPath
      }
    }
  ]
};

const commit: PathwardenCommit = {
  commit_id: makeId("commit"),
  plan_id: planId,
  confirmed: true
};

const task: PathwardenTask = {
  task_id: makeId("task"),
  name: "Safe Move Test",
  description: "Move a test file inside the allowed Documents sandbox.",
  type: "execute_plan",
  mode: "core",
  status: "pending",
  created_at: nowIso(),
  requires_confirmation: true,
  approved: false,
  auto_run: false,
  payload: {
    plan,
    commit
  }
};

const filePath = saveTask(task);

console.log(JSON.stringify({
  ok: true,
  type: "safe-move-task-create",
  task,
  filePath
}, null, 2));