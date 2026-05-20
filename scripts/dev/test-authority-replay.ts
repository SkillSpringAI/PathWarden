import { validateCapabilityGrant } from "../../core/kernel/capabilityGrantValidator";
import { readAuthorityRecordsByTraceId } from "../../core/audit/authorityReader";

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
const replay = readAuthorityRecordsByTraceId(traceId);

assert(replay.trace_id === traceId, "Expected replay trace_id to match");
assert(replay.records.length >= 2, "Expected replay to include authority records");
assert(replay.permission_token_records.length >= 1, "Expected replay to include permission token record");
assert(replay.legitimacy_artifact_records.length >= 1, "Expected replay to include legitimacy artifact record");

const tokenRecord = replay.permission_token_records[0];
const artifactRecord = replay.legitimacy_artifact_records[0];

assert(tokenRecord.token.trace_id === traceId, "Expected token record trace_id to match");
assert(artifactRecord.artifact.trace_id === traceId, "Expected artifact record trace_id to match");
assert(
  artifactRecord.artifact.capability_source === tokenRecord.token.token_id,
  "Expected artifact capability_source to reference token_id"
);

console.log("Authority replay diagnostic passed.");
