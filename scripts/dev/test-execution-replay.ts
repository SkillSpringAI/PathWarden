import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateCapabilityGrant } from "../../core/kernel/capabilityGrantValidator";
import { executeCommittedPlan } from "../../core/executor/commitExecutor";
import { replayExecutionByTraceId } from "../../core/audit/executionReplay";
import type { PathwardenCommit, PathwardenPlan } from "../../core/kernel/types";

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
  "PathWardenExecutionReplayDiag"
);

if (existsSync(sandboxRoot)) {
  rmSync(sandboxRoot, { recursive: true, force: true });
}

mkdirSync(sandboxRoot, { recursive: true });

const sourcePath = resolve(sandboxRoot, "source.txt");
const destinationPath = resolve(sandboxRoot, "destination.txt");

writeFileSync(sourcePath, "execution replay diagnostic", "utf8");

const plan: PathwardenPlan = {
  plan_id: "plan-execution-replay-diag",
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
};

const commit: PathwardenCommit = {
  commit_id: "commit-execution-replay-diag",
  plan_id: plan.plan_id,
  confirmed: true
};

const execution = executeCommittedPlan(
  "core",
  plan,
  commit,
  traceId,
  grant.permission_token
);

assert(execution.ok, "Expected execution to succeed");

const replay = replayExecutionByTraceId(traceId);

assert(replay.trace_id === traceId, "Expected replay trace_id to match");
assert(replay.authority.permission_token_records.length >= 1, "Expected replay authority token records");
assert(replay.authority.legitimacy_artifact_records.length >= 1, "Expected replay legitimacy records");
assert(replay.audit_events.length >= 1, "Expected replay audit events");
assert(
  replay.reconstructed_chain.some((item) => item.startsWith("permission_token:")),
  "Expected reconstructed chain to include permission token"
);
assert(
  replay.reconstructed_chain.some((item) => item.startsWith("legitimacy_artifact:")),
  "Expected reconstructed chain to include legitimacy artifact"
);
assert(
  replay.reconstructed_chain.some((item) => item === "audit_event:EXECUTE_FILESYSTEM_MOVE"),
  "Expected reconstructed chain to include filesystem move audit event"
);

rmSync(sandboxRoot, { recursive: true, force: true });

console.log("Execution replay diagnostic passed.");
