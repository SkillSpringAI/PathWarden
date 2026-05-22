import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

const revocationPath = resolve(
  process.cwd(),
  "policy",
  "authority",
  "permission-token-revocations.json"
);

const originalRevocations = readFileSync(revocationPath, "utf8");

const sandboxRoot = resolve(
  process.env.USERPROFILE ?? process.cwd(),
  "Documents",
  "PathWardenTaskRevokedTokenDiag"
);

try {
  const grant = validateCapabilityGrant({
    app_id: "skillspring-quantum",
    tool_id: "filesystem.requestMove",
    requested_risk_level: "high"
  });

  assert(grant.ok, "Expected capability grant to succeed");

  const traceId = grant.permission_token.trace_id;

  writeFileSync(
    revocationPath,
    JSON.stringify({
      schema_version: "permission-token-revocations.v1",
      revoked_tokens: [
        {
          token_id: grant.permission_token.token_id,
          revoked_at: new Date().toISOString(),
          reason: "Task revoked-token diagnostic"
        }
      ]
    }, null, 2),
    "utf8"
  );

  if (existsSync(sandboxRoot)) {
    rmSync(sandboxRoot, { recursive: true, force: true });
  }

  mkdirSync(sandboxRoot, { recursive: true });

  const sourcePath = resolve(sandboxRoot, "source.txt");
  const destinationPath = resolve(sandboxRoot, "destination.txt");

  writeFileSync(sourcePath, "task revoked token diagnostic", "utf8");

  const task: PathwardenTask = {
    trace_id: traceId,
    task_id: "task-revoked-token-diag",
    name: "Revoked Token Task Diagnostic",
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
        plan_id: "plan-revoked-token-diag",
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
        commit_id: "commit-revoked-token-diag",
        plan_id: "plan-revoked-token-diag",
        confirmed: true
      }
    }
  };

  const result = runTask(task);

  assert(
    result.status === "failed",
    "Expected task with revoked token to fail"
  );

  assert(
    existsSync(sourcePath),
    "Expected source file to remain after revoked-token refusal"
  );

  assert(
    !existsSync(destinationPath),
    "Expected destination file not to exist after revoked-token refusal"
  );

  const replay = replayExecutionByTraceId(traceId);

  assert(
    replay.audit_events.some((event) => event.decision_code === "REFUSE_PERMISSION_TOKEN_REVOKED"),
    "Expected replay to include revoked token refusal"
  );

  assert(
    replay.audit_events.some((event) => event.refusal_code === "PW-TOKEN-001"),
    "Expected replay to include token refusal code"
  );

  assert(
    replay.reconstructed_chain.includes("audit_event:REFUSE_PERMISSION_TOKEN_REVOKED"),
    "Expected replay chain to include revoked token refusal event"
  );

  console.log("Task revoked token diagnostic passed.");
}
finally {
  writeFileSync(revocationPath, originalRevocations, "utf8");

  if (existsSync(sandboxRoot)) {
    rmSync(sandboxRoot, { recursive: true, force: true });
  }
}
