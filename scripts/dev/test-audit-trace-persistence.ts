import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runTask } from "../../core/tasks/taskRunner";
import type { PathwardenTask } from "../../core/tasks/taskTypes";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const traceId = `trace_audit_diag_${Date.now()}`;

const task: PathwardenTask = {
  trace_id: traceId,
  task_id: `task-audit-trace-${Date.now()}`,
  name: "Audit trace diagnostic task",
  type: "run_diagnostics",
  mode: "core",
  status: "pending",
  created_at: new Date().toISOString(),
  requires_confirmation: false,
  approved: true,
  auto_run: false
};

const result = runTask(task);

assert(result.trace_id === traceId, "Expected task result to preserve supplied trace_id");

const today = new Date().toISOString().slice(0, 10);
const auditPath = resolve(process.cwd(), "audit", "events", `${today}.jsonl`);

assert(existsSync(auditPath), `Expected audit file to exist: ${auditPath}`);

const lines = readFileSync(auditPath, "utf8")
  .split("\n")
  .filter(Boolean);

const matchingEvents = lines
  .map((line) => JSON.parse(line))
  .filter((event) => event.trace_id === traceId);

assert(matchingEvents.length >= 1, "Expected at least one audit event with matching trace_id");
assert(
  matchingEvents.some((event) => event.decision_code === "TASK_RUN_DIAGNOSTICS"),
  "Expected TASK_RUN_DIAGNOSTICS audit event with matching trace_id"
);

console.log("Audit trace persistence diagnostic passed.");
