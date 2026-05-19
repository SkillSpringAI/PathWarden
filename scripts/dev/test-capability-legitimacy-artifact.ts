import { getSchemaValidator } from "../../core/common/schemaValidator";
import { validateCapabilityGrant } from "../../core/kernel/capabilityGrantValidator";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const tokenValidator = getSchemaValidator(
  "schemas/authority/permission-token.schema.json"
);

const artifactValidator = getSchemaValidator(
  "schemas/authority/decision-legitimacy-artifact.schema.json"
);

const result = validateCapabilityGrant({
  app_id: "skillspring-quantum",
  tool_id: "filesystem.requestMove",
  requested_risk_level: "high"
});

assert(result.ok, "Expected capability grant to succeed");

const token = result.permission_token;
const artifact = result.legitimacy_artifact;

assert(tokenValidator(token) === true, "Expected permission token to be schema-valid");
assert(artifactValidator(artifact) === true, "Expected legitimacy artifact to be schema-valid");

assert(token.trace_id === artifact.trace_id, "Expected token and artifact trace_id to match");
assert(artifact.capability_source === token.token_id, "Expected artifact to reference token ID");
assert(artifact.authority_chain.includes(result.grant_id), "Expected authority chain to include grant ID");
assert(artifact.authority_chain.includes(token.token_id), "Expected authority chain to include token ID");
assert(artifact.decision_code === result.decision_code, "Expected artifact decision_code to match grant decision");
assert(artifact.audit_required === result.audit_required, "Expected artifact audit requirement to match grant result");

console.log("Capability legitimacy artifact diagnostic passed.");
