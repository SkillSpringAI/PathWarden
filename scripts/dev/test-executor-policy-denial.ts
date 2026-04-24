import { executeCommittedPlan } from "../../core/executor/commitExecutor";

import type { PathwardenPlan } from "../../core/kernel/types";
const mode = "core";

const plan: PathwardenPlan = {
  plan_id: "plan-test-blocked-delete",
  actions: [
    {
      type: "filesystem",
      operation: "delete",
      selector: {
        path: "C:\\Windows\\System32\\drivers\\etc\\hosts"
      }
    }
  ],
  risk_level: "high",
  requires_confirmation: true
};

const commit = {
  commit_id: "commit-test-blocked-delete",
  plan_id: "plan-test-blocked-delete",
  confirmed: true
};

const result = executeCommittedPlan(mode, plan, commit);
console.log(JSON.stringify(result, null, 2));
