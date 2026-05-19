import { getSchemaValidator } from "../../core/common/schemaValidator";
import { mintPermissionToken } from "../../core/kernel/permissionTokenBuilder";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const validator = getSchemaValidator(
  "schemas/authority/permission-token.schema.json"
);

const token = mintPermissionToken({
  trace_id: "trace_pt_diag",
  app_id: "skillspring-quantum",
  tool_id: "filesystem.move",
  granted_operations: ["move"],
  risk_ceiling: "high",
  requires_approval: true,
  issuer: "pathwarden-kernel",
  expires_at: "2030-01-01T00:00:00.000Z"
});

const valid = validator(token);

assert(valid === true, "Expected permission token schema validation to pass");

console.log("Permission token diagnostic passed.");
