import { readFileSync } from "node:fs";
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

const task: PathwardenTask = {
  trace_id: grant.permission_token.trace_id,
  task_id: "task-audit-authority-diag",
  name: "Task Audit Authority Diagnostic",
  type: "run_diagnostics",
  mode: "core",
  status: "approved",
  created_at: new Date().toISOString(),
  requires_confirmation: false,
  approved: true,
  auto_run: false,
  payload: {
    permission_token: grant.permission_token
  }
};

const result = runTask(task);

assert(
  result.status === "completed",
  "Expected task to complete"
);

const today = new Date().toISOString().slice(0, 10);

const auditPath = resolve(
  process.cwd(),
  "audit",
  "events",
  `${today}.jsonl`
);

const events = readFileSync(auditPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .filter((event) => event.trace_id === grant.permission_token.trace_id);

const taskAudit = events.find(
  (event) => event.decision_code === "TASK_RUN_DIAGNOSTICS"
);

assert(taskAudit, "Expected task audit event");

assert(
  taskAudit.permission_token_id === grant.permission_token.token_id,
  "Expected task audit to include permission token ID"
);

assert(
  Array.isArray(taskAudit.authority_chain),
  "Expected task audit to include authority chain"
);

assert(
  taskAudit.authority_chain.includes(grant.permission_token.token_id),
  "Expected authority chain to include permission token"
);

console.log("Task authority audit enrichment diagnostic passed.");
