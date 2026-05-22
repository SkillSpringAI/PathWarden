import { mkdirSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateCapabilityGrant } from "../../core/kernel/capabilityGrantValidator";
import { runTask } from "../../core/tasks/taskRunner";
import type { PathwardenTask } from "../../core/tasks/taskTypes";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const grant = validateCapabilityGrant({
  app_id: "skillspring-quantum",
  tool_id: "filesystem.requestMove",
  requested_risk_level: "high"
});

assert(grant.ok, "Expected capability grant to succeed");

const sandboxRoot = resolve(
  process.env.USERPROFILE ?? process.cwd(),
  "Documents",
  "PathWardenTaskAuthorityDiag"
);

if (existsSync(sandboxRoot)) {
  rmSync(sandboxRoot, { recursive: true, force: true });
}

mkdirSync(sandboxRoot, { recursive: true });

const sourcePath = resolve(sandboxRoot, "source.txt");
const destinationPath = resolve(sandboxRoot, "destination.txt");

writeFileSync(sourcePath, "task authority diagnostic", "utf8");

const task: PathwardenTask = {
  trace_id: grant.permission_token.trace_id,
  task_id: "task-authority-diag",
  name: "Authority Task Diagnostic",
  type: "execute_plan",
  mode: "core",
  status: "approved",
  created_at: new Date().toISOString(),
  requires_confirmation: true,
  approved: true,
  auto_run: false,
  payload: {
    permission_token: grant.permission_token,
    plan: {
      plan_id: "plan-authority-diag",
      risk_level: "high",
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
    },
    commit: {
      commit_id: "commit-authority-diag",
      plan_id: "plan-authority-diag",
      confirmed: true
    }
  }
};

const result = runTask(task);

assert(result.status === "completed", "Expected authority-backed task to complete");

rmSync(sandboxRoot, { recursive: true, force: true });

console.log("Task authority integration diagnostic passed.");
