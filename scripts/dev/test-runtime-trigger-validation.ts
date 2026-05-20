import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateAction } from "../../core/kernel/validator";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const result = validateAction("core", {
  type: "filesystem",
  operation: "move",
  selector: {
    path: "C:\\Users\\Laptop\\Documents\\source.txt"
  },
  destination: {
    path: "C:\\Users\\Laptop\\Documents\\dest.txt"
  }
}, true);

assert(result.ok, "Expected valid action to pass validation");

const traceId = result.trace_id;
assert(typeof traceId === "string", "Expected validation result to include trace_id");

const today = new Date().toISOString().slice(0, 10);
const auditPath = resolve(process.cwd(), "audit", "events", `${today}.jsonl`);

assert(existsSync(auditPath), "Expected audit event file to exist");

const events = readFileSync(auditPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .filter((event) => event.trace_id === traceId);

assert(events.length >= 1, "Expected audit events for validation trace");

const driftWarnings = events.filter(
  (event) => event.decision_code === "WARN_TRIGGER_REGISTRY_DRIFT"
);

assert(
  driftWarnings.length === 0,
  "Expected no trigger drift warnings for registered triggers"
);

console.log("Runtime trigger validation diagnostic passed.");
