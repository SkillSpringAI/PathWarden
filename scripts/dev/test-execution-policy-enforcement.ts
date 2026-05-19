import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync, writeFileSync as writeFile } from "node:fs";
import { resolve } from "node:path";
import { executeCommittedPlan } from "../../core/executor/commitExecutor";
import { mintPermissionToken } from "../../core/kernel/permissionTokenBuilder";
import type { PathwardenPlan, PathwardenCommit } from "../../core/kernel/types";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const policyPath = resolve(process.cwd(), "policy", "runtime", "execution-policy.json");
const originalPolicy = readFileSync(policyPath, "utf8");

const sandboxRoot = resolve(process.env.USERPROFILE ?? process.cwd(), "Documents", "PathWardenPolicyDiag");

function writePolicy(mandatory: boolean, allowLegacy: boolean): void {
  writeFile(
    policyPath,
    JSON.stringify({
      schema_version: "execution-policy.v1",
      mandatory_permission_tokens: mandatory,
      mandatory_audit: true,
      allow_legacy_execution: allowLegacy
    }, null, 2),
    "utf8"
  );
}

function resetSandbox(content: string): { sourcePath: string; destinationPath: string } {
  if (existsSync(sandboxRoot)) {
    rmSync(sandboxRoot, { recursive: true, force: true });
  }

  mkdirSync(sandboxRoot, { recursive: true });

  const sourcePath = resolve(sandboxRoot, "source.txt");
  const destinationPath = resolve(sandboxRoot, "destination.txt");

  writeFileSync(sourcePath, content, "utf8");

  return { sourcePath, destinationPath };
}

try {
  const traceId = `trace_execution_policy_${Date.now()}`;

  const first = resetSandbox("legacy allowed diagnostic");

  const plan: PathwardenPlan = {
    plan_id: "plan-execution-policy-diag",
    risk_level: "high",
    requires_confirmation: true,
    actions: [
      {
        type: "filesystem",
        operation: "move",
        selector: {
          path: first.sourcePath
        },
        destination: {
          path: first.destinationPath
        }
      }
    ]
  };

  const commit: PathwardenCommit = {
    commit_id: "commit-execution-policy-diag",
    plan_id: plan.plan_id,
    confirmed: true
  };

  writePolicy(false, true);

  const legacyAllowed = executeCommittedPlan(
    "core",
    plan,
    commit,
    traceId
  );

  assert(legacyAllowed.ok, "Expected legacy execution to be allowed when policy permits it");

  const second = resetSandbox("mandatory token refusal diagnostic");

  const mandatoryPlan: PathwardenPlan = {
    ...plan,
    actions: [
      {
        type: "filesystem",
        operation: "move",
        selector: {
          path: second.sourcePath
        },
        destination: {
          path: second.destinationPath
        }
      }
    ]
  };

  writePolicy(true, false);

  const mandatoryRefusal = executeCommittedPlan(
    "core",
    mandatoryPlan,
    commit,
    traceId
  );

  assert(!mandatoryRefusal.ok, "Expected missing token to be refused in mandatory mode");
  assert(
    mandatoryRefusal.decision_code === "REFUSE_PERMISSION_TOKEN_MISSING",
    "Expected mandatory mode missing-token refusal"
  );
  assert(existsSync(second.sourcePath), "Expected source to remain after mandatory refusal");
  assert(!existsSync(second.destinationPath), "Expected destination not to exist after mandatory refusal");

  const third = resetSandbox("mandatory token allow diagnostic");

  const tokenPlan: PathwardenPlan = {
    ...plan,
    actions: [
      {
        type: "filesystem",
        operation: "move",
        selector: {
          path: third.sourcePath
        },
        destination: {
          path: third.destinationPath
        }
      }
    ]
  };

  const token = mintPermissionToken({
    trace_id: traceId,
    app_id: "skillspring-quantum",
    tool_id: "filesystem.requestMove",
    granted_operations: ["filesystem.requestMove"],
    risk_ceiling: "high",
    requires_approval: true,
    issuer: "pathwarden-kernel",
    expires_at: "2030-01-01T00:00:00.000Z"
  });

  const mandatoryAllowed = executeCommittedPlan(
    "core",
    tokenPlan,
    commit,
    traceId,
    token
  );

  assert(mandatoryAllowed.ok, "Expected valid token to allow execution in mandatory mode");
  assert(!existsSync(third.sourcePath), "Expected source moved in mandatory token mode");
  assert(existsSync(third.destinationPath), "Expected destination exists in mandatory token mode");

  console.log("Execution policy enforcement diagnostic passed.");
}
finally {
  writeFile(policyPath, originalPolicy, "utf8");

  if (existsSync(sandboxRoot)) {
    rmSync(sandboxRoot, { recursive: true, force: true });
  }
}
