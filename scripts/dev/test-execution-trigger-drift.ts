import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateCapabilityGrant } from "../../core/kernel/capabilityGrantValidator";
import { executeCommittedPlan } from "../../core/executor/commitExecutor";
import type { PathwardenPlan, PathwardenCommit } from "../../core/kernel/types";

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
  "PathWardenExecutionTriggerDriftDiag"
);

if (existsSync(sandboxRoot)) {
  rmSync(sandboxRoot, { recursive: true, force: true });
}

mkdirSync(sandboxRoot, { recursive: true });

const sourcePath = resolve(sandboxRoot, "source.txt");
const destinationPath = resolve(sandboxRoot, "destination.txt");

writeFileSync(sourcePath, "execution trigger drift diagnostic", "utf8");

const plan: PathwardenPlan = {
  plan_id: "plan-execution-trigger-drift-diag",
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
  commit_id: "commit-execution-trigger-drift-diag",
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

const today = new Date().toISOString().slice(0, 10);

const auditPath = resolve(
  process.cwd(),
  "audit",
  "events",
  `${today}.jsonl`
);

assert(existsSync(auditPath), "Expected audit file to exist");

const events = readFileSync(auditPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .filter((event) => event.trace_id === traceId);

assert(events.length >= 1, "Expected execution audit events");

const driftWarnings = events.filter(
  (event) => event.decision_code === "WARN_TRIGGER_REGISTRY_DRIFT"
);

assert(
  driftWarnings.length === 0,
  "Expected no trigger drift warnings for registered execution triggers"
);

rmSync(sandboxRoot, { recursive: true, force: true });

console.log("Execution trigger drift diagnostic passed.");
