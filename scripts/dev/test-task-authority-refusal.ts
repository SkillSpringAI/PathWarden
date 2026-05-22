import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateCapabilityGrant } from "../../core/kernel/capabilityGrantValidator";
import { runTask } from "../../core/tasks/taskRunner";
import { replayExecutionByTraceId } from "../../core/audit/executionReplay";
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

const traceId = grant.permission_token.trace_id;

const sandboxRoot = resolve(
  process.env.USERPROFILE ?? process.cwd(),
  "Documents",
  "PathWardenTaskAuthorityRefusalDiag"
);

if (existsSync(sandboxRoot)) {
  rmSync(sandboxRoot, { recursive: true, force: true });
}

mkdirSync(sandboxRoot, { recursive: true });

const sourcePath = resolve(sandboxRoot, "source.txt");
const destinationPath = resolve(sandboxRoot, "destination.txt");

writeFileSync(sourcePath, "task authority refusal diagnostic", "utf8");

/*
  Intentionally corrupt the granted operation scope.
*/

const invalidToken = {
  ...grant.permission_token,
  granted_operations: ["filesystem.requestDelete"]
};

const task: PathwardenTask = {
  trace_id: traceId,
  task_id: "task-authority-refusal-diag",
  name: "Authority Refusal Diagnostic",
  type: "execute_plan",
  mode: "core",
  status: "approved",
  created_at: new Date().toISOString(),
  requires_confirmation: true,
  approved: true,
  auto_run: false,
  payload: {
    permission_token: invalidToken,
    plan: {
      plan_id: "plan-authority-refusal-diag",
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
      commit_id: "commit-authority-refusal-diag",
      plan_id: "plan-authority-refusal-diag",
      confirmed: true
    }
  }
};

const result = runTask(task);

assert(
  result.status === "failed",
  "Expected authority-invalid task to fail"
);

const replay = replayExecutionByTraceId(traceId);

assert(
  replay.audit_events.some(
    (event) => event.decision_code === "REFUSE_PERMISSION_TOKEN_SCOPE"
  ),
  "Expected replay to include permission scope refusal"
);

assert(
  replay.audit_events.some(
    (event) => event.refusal_code === "PW-TOKEN-001"
  ),
  "Expected replay to include permission token refusal code"
);

assert(
  replay.reconstructed_chain.includes("audit_event:REFUSE_PERMISSION_TOKEN_SCOPE"),
  "Expected reconstructed chain to include permission refusal event"
);

assert(
  replay.reconstructed_chain.includes(`permission_token:${grant.permission_token.token_id}`),
  "Expected replay chain to preserve original permission token"
);

rmSync(sandboxRoot, { recursive: true, force: true });

console.log("Task authority refusal diagnostic passed.");

