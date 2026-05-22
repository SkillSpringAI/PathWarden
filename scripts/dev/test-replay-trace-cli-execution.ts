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

const replay = replayExecutionByTraceId(grant.permission_token.trace_id);

assert(
  replay.trace_id === grant.permission_token.trace_id,
  "Expected replay trace_id to match"
);

assert(
  replay.authority.permission_token_records.some(
    (record) => record.token.token_id === grant.permission_token.token_id
  ),
  "Expected replay output to include permission token ID"
);

assert(
  replay.authority.legitimacy_artifact_records.some(
    (record) => record.artifact.artifact_id === grant.legitimacy_artifact.artifact_id
  ),
  "Expected replay output to include legitimacy artifact ID"
);

console.log("Replay trace CLI execution diagnostic passed.");
