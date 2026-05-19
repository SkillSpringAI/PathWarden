import { getSchemaValidator } from "../../core/common/schemaValidator";
import { mintPermissionToken } from "../../core/kernel/permissionTokenBuilder";
import { buildDecisionLegitimacyArtifact } from "../../core/kernel/legitimacyArtifactBuilder";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const traceId = `trace_authority_chain_${Date.now()}`;

const tokenValidator = getSchemaValidator(
  "schemas/authority/permission-token.schema.json"
);

const artifactValidator = getSchemaValidator(
  "schemas/authority/decision-legitimacy-artifact.schema.json"
);

const token = mintPermissionToken({
  trace_id: traceId,
  app_id: "skillspring-quantum",
  tool_id: "filesystem.requestMove",
  granted_operations: ["move"],
  risk_ceiling: "high",
  requires_approval: true,
  issuer: "pathwarden-kernel",
  expires_at: "2030-01-01T00:00:00.000Z"
});

const artifact = buildDecisionLegitimacyArtifact({
  trace_id: traceId,
  mode: "core",
  decision_code: "ALLOW_CAPABILITY_GRANT",
  invariant_checks: ["INV-006", "INV-009"],
  trigger_hits: ["capability_grant_checked", "approval_required"],
  approval_state: "required_pending",
  authority_chain: [
    "pathwarden-kernel",
    token.token_id,
    "capability-grant-validator",
    "task-runner"
  ],
  capability_source: token.token_id,
  risk_level: token.risk_ceiling,
  audit_required: token.audit_required
});

assert(tokenValidator(token) === true, "Expected permission token to be schema-valid");
assert(artifactValidator(artifact) === true, "Expected legitimacy artifact to be schema-valid");

assert(token.trace_id === artifact.trace_id, "Expected token and artifact trace_id to match");
assert(artifact.capability_source === token.token_id, "Expected artifact capability_source to reference token");
assert(artifact.authority_chain.includes(token.token_id), "Expected authority_chain to include token_id");
assert(artifact.audit_required === token.audit_required, "Expected audit_required to propagate from token");
assert(artifact.risk_level === token.risk_ceiling, "Expected artifact risk_level to match token risk ceiling");

console.log("Authority chain diagnostic passed.");
