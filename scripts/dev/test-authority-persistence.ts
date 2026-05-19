import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { nowIso } from "../../core/common/time";
import { mintPermissionToken } from "../../core/kernel/permissionTokenBuilder";
import { buildDecisionLegitimacyArtifact } from "../../core/kernel/legitimacyArtifactBuilder";
import { writeAuthorityArtifact } from "../../core/audit/authorityWriter";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const traceId = `trace_authority_persistence_${Date.now()}`;
const timestamp = nowIso();

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

const artifact = buildDecisionLegitimacyArtifact({
  trace_id: traceId,
  mode: "core",
  decision_code: "ALLOW_CAPABILITY_GRANT",
  invariant_checks: ["INV-006"],
  trigger_hits: ["capability_grant_checked"],
  approval_state: "required_pending",
  authority_chain: [
    "pathwarden-kernel",
    token.token_id,
    "authority-writer"
  ],
  capability_source: token.token_id,
  risk_level: "high",
  audit_required: true
});

writeAuthorityArtifact({
  record_type: "permission_token",
  trace_id: traceId,
  timestamp,
  token
});

writeAuthorityArtifact({
  record_type: "legitimacy_artifact",
  trace_id: traceId,
  timestamp,
  artifact
});

const filePath = resolve(
  process.cwd(),
  "audit",
  "authority",
  `${timestamp.slice(0, 10)}.jsonl`
);

assert(existsSync(filePath), "Expected authority audit file to exist");

const records = readFileSync(filePath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .filter((record) => record.trace_id === traceId);

assert(records.length >= 2, "Expected authority records for trace_id");
assert(records.some((record) => record.record_type === "permission_token"), "Expected permission token record");
assert(records.some((record) => record.record_type === "legitimacy_artifact"), "Expected legitimacy artifact record");

console.log("Authority persistence diagnostic passed.");
