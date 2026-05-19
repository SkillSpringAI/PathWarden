import { getSchemaValidator } from "../../core/common/schemaValidator";
import { validateCapabilityGrant } from "../../core/kernel/capabilityGrantValidator";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const validator = getSchemaValidator(
  "schemas/authority/permission-token.schema.json"
);

const result = validateCapabilityGrant({
  app_id: "skillspring-quantum",
  tool_id: "filesystem.requestMove",
  requested_risk_level: "high"
});

assert(result.ok, "Expected capability grant to succeed");

const token = result.permission_token;

assert(typeof token.token_id === "string", "Expected permission token ID");
assert(token.token_id.startsWith("pt_"), "Expected permission token prefix");

assert(token.trace_id.startsWith("trace_capability_"), "Expected capability trace prefix");

assert(
  token.granted_operations.includes("filesystem.requestMove"),
  "Expected granted operation to be present"
);

assert(
  validator(token) === true,
  "Expected minted permission token to pass schema validation"
);

console.log("Permission token issuance diagnostic passed.");
