import { getSchemaValidator, formatAjvErrors } from "../common/schemaValidator";
import { loadConfigFile } from "../common/configLoader";

export interface ExecutionPolicy {
  schema_version: "execution-policy.v1";
  mandatory_permission_tokens: boolean;
  mandatory_audit: boolean;
  allow_legacy_execution: boolean;
}

const validator = getSchemaValidator(
  "schemas/policy/execution-policy.schema.json"
);

export function loadExecutionPolicy(): ExecutionPolicy {

  const policy = loadConfigFile<ExecutionPolicy>(
    "policy/runtime/execution-policy.json"
  );

  const valid = validator(policy);

  if (!valid) {
    throw new Error(
      `Invalid execution policy configuration: ${formatAjvErrors(validator.errors)}`
    );
  }

  return policy;
}
