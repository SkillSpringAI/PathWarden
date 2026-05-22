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
  "PathWardenTaskAuthorityReplayDiag"
);

if (existsSync(sandboxRoot)) {
  rmSync(sandboxRoot, { recursive: true, force: true });
}

mkdirSync(sandboxRoot, { recursive: true });

const sourcePath = resolve(sandboxRoot, "source.txt");
const destinationPath = resolve(sandboxRoot, "destination.txt");

writeFileSync(sourcePath, "task authority replay diagnostic", "utf8");

const task: PathwardenTask = {
  trace_id: traceId,
  task_id: "task-authority-replay-diag",
  name: "Authority Task Replay Diagnostic",
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
      plan_id: "plan-authority-replay-diag",
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
      commit_id: "commit-authority-replay-diag",
      plan_id: "plan-authority-replay-diag",
      confirmed: true
    }
  }
};

const result = runTask(task);

assert(result.status === "completed", "Expected authority-backed task to complete");

const replay = replayExecutionByTraceId(traceId);

assert(replay.authority.permission_token_records.length >= 1, "Expected replay to include permission token record");
assert(replay.authority.legitimacy_artifact_records.length >= 1, "Expected replay to include legitimacy artifact record");

assert(
  replay.audit_events.some((event) => event.decision_code === "TASK_RUN_FAILED") === false,
  "Expected no task failure audit event"
);

assert(
  replay.audit_events.some((event) => event.decision_code === "EXECUTE_FILESYSTEM_MOVE"),
  "Expected replay to include filesystem move execution audit"
);

assert(
  replay.audit_events.some((event) => event.decision_code === "TASK_RUN_DIAGNOSTICS") === false,
  "Expected replay not to confuse execute_plan with run_diagnostics"
);

assert(
  replay.audit_events.some((event) => event.decision_code === "EXECUTE_PLAN_SUCCESS" || event.decision_code === "TASK_EXECUTE_PLAN_ALLOWED" || event.decision_code === "EXECUTE_FILESYSTEM_MOVE"),
  "Expected replay to include task/execution success evidence"
);

assert(
  replay.reconstructed_chain.includes(`permission_token:${grant.permission_token.token_id}`),
  "Expected reconstructed chain to include permission token"
);

assert(
  replay.reconstructed_chain.includes(`legitimacy_artifact:${grant.legitimacy_artifact.artifact_id}`),
  "Expected reconstructed chain to include legitimacy artifact"
);

assert(
  replay.reconstructed_chain.includes("audit_event:EXECUTE_FILESYSTEM_MOVE"),
  "Expected reconstructed chain to include execution audit event"
);

rmSync(sandboxRoot, { recursive: true, force: true });

console.log("Task authority replay diagnostic passed.");
