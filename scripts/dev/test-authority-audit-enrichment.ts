import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateCapabilityGrant } from "../../core/kernel/capabilityGrantValidator";
import { replayExecutionByTraceId } from "../../core/audit/executionReplay";

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
const today = new Date().toISOString().slice(0, 10);

const auditPath = resolve(
  process.cwd(),
  "audit",
  "events",
  `${today}.jsonl`
);

assert(existsSync(auditPath), "Expected audit events file to exist");

const events = readFileSync(auditPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .filter((event) => event.trace_id === traceId);

const grantAudit = events.find(
  (event) => event.decision_code === "ALLOW_CAPABILITY_GRANT"
);

assert(grantAudit !== undefined, "Expected capability grant audit event");
assert(
  grantAudit.permission_token_id === grant.permission_token.token_id,
  "Expected grant audit to include permission_token_id"
);
assert(
  grantAudit.legitimacy_artifact_id === grant.legitimacy_artifact.artifact_id,
  "Expected grant audit to include legitimacy_artifact_id"
);
assert(
  Array.isArray(grantAudit.authority_chain),
  "Expected grant audit to include authority_chain"
);
assert(
  grantAudit.authority_chain.includes(grant.permission_token.token_id),
  "Expected grant audit authority_chain to include token ID"
);

const replay = replayExecutionByTraceId(traceId);

assert(
  replay.reconstructed_chain.includes(`audit_permission_token:${grant.permission_token.token_id}`),
  "Expected replay chain to include audit permission token reference"
);
assert(
  replay.reconstructed_chain.includes(`audit_legitimacy_artifact:${grant.legitimacy_artifact.artifact_id}`),
  "Expected replay chain to include audit legitimacy artifact reference"
);

console.log("Authority audit enrichment diagnostic passed.");
