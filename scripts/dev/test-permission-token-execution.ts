import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { executeCommittedPlan } from "../../core/executor/commitExecutor";
import { mintPermissionToken } from "../../core/kernel/permissionTokenBuilder";
import type { PathwardenPlan, PathwardenCommit } from "../../core/kernel/types";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const sandboxRoot = resolve(process.env.USERPROFILE ?? process.cwd(), "Documents", "PathWardenTokenExecDiag");

if (existsSync(sandboxRoot)) {
  rmSync(sandboxRoot, { recursive: true, force: true });
}

mkdirSync(sandboxRoot, { recursive: true });

const sourcePath = resolve(sandboxRoot, "source.txt");
const destinationPath = resolve(sandboxRoot, "destination.txt");

writeFileSync(sourcePath, "token execution diagnostic", "utf8");

const plan: PathwardenPlan = {
  plan_id: "plan-token-exec-diag",
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
  commit_id: "commit-token-exec-diag",
  plan_id: plan.plan_id,
  confirmed: true
};

const traceId = `trace_token_exec_${Date.now()}`;

const validToken = mintPermissionToken({
  trace_id: traceId,
  app_id: "skillspring-quantum",
  tool_id: "filesystem.requestMove",
  granted_operations: ["filesystem.requestMove"],
  risk_ceiling: "high",
  requires_approval: true,
  issuer: "pathwarden-kernel",
  expires_at: "2030-01-01T00:00:00.000Z"
});

const validResult = executeCommittedPlan(
  "core",
  plan,
  commit,
  traceId,
  validToken
);

assert(validResult.ok, "Expected valid token execution to succeed");
assert(validResult.trace_id === traceId, "Expected execution trace_id to match supplied trace");
assert(!existsSync(sourcePath), "Expected source path to be moved");
assert(existsSync(destinationPath), "Expected destination path to exist");

rmSync(sandboxRoot, { recursive: true, force: true });
mkdirSync(sandboxRoot, { recursive: true });
writeFileSync(sourcePath, "token wrong scope diagnostic", "utf8");

const wrongScopeToken = mintPermissionToken({
  trace_id: traceId,
  app_id: "skillspring-quantum",
  tool_id: "filesystem.requestCopy",
  granted_operations: ["filesystem.requestCopy"],
  risk_ceiling: "high",
  requires_approval: true,
  issuer: "pathwarden-kernel",
  expires_at: "2030-01-01T00:00:00.000Z"
});

const wrongScopeResult = executeCommittedPlan(
  "core",
  plan,
  commit,
  traceId,
  wrongScopeToken
);

assert(!wrongScopeResult.ok, "Expected wrong-scope token execution to be refused");
assert(
  wrongScopeResult.decision_code === "REFUSE_PERMISSION_TOKEN_SCOPE",
  "Expected permission token scope refusal"
);
assert(existsSync(sourcePath), "Expected source path to remain after refusal");
assert(!existsSync(destinationPath), "Expected destination path not to exist after refusal");

rmSync(sandboxRoot, { recursive: true, force: true });
mkdirSync(sandboxRoot, { recursive: true });
writeFileSync(sourcePath, "legacy no token diagnostic", "utf8");

const legacyResult = executeCommittedPlan(
  "core",
  plan,
  commit,
  traceId
);

assert(legacyResult.ok, "Expected no-token legacy path to remain allowed in v1");
assert(!existsSync(sourcePath), "Expected source path to be moved in legacy path");
assert(existsSync(destinationPath), "Expected destination path to exist in legacy path");

rmSync(sandboxRoot, { recursive: true, force: true });

console.log("Permission token execution enforcement diagnostic passed.");
