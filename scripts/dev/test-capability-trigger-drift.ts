import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateCapabilityGrant } from "../../core/kernel/capabilityGrantValidator";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const result = validateCapabilityGrant({
  app_id: "skillspring-quantum",
  tool_id: "filesystem.requestMove",
  requested_risk_level: "high"
});

assert(result.ok, "Expected capability grant to succeed");

const traceId = result.permission_token.trace_id;
const today = new Date().toISOString().slice(0, 10);

const auditPath = resolve(
  process.cwd(),
  "audit",
  "events",
  `${today}.jsonl`
);

if (existsSync(auditPath)) {
  const events = readFileSync(auditPath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((event) => event.trace_id === traceId);

  const driftWarnings = events.filter(
    (event) => event.decision_code === "WARN_TRIGGER_REGISTRY_DRIFT"
  );

  assert(
    driftWarnings.length === 0,
    "Expected no trigger drift warnings for capability grant authority issuance"
  );
}

console.log("Capability grant trigger drift diagnostic passed.");
