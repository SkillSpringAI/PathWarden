import { loadExecutionPolicy } from "../../core/kernel/executionPolicy";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const policy = loadExecutionPolicy();

assert(policy.schema_version === "execution-policy.v1", "Expected execution policy schema version");
assert(typeof policy.mandatory_permission_tokens === "boolean", "Expected mandatory_permission_tokens boolean");
assert(typeof policy.mandatory_audit === "boolean", "Expected mandatory_audit boolean");
assert(typeof policy.allow_legacy_execution === "boolean", "Expected allow_legacy_execution boolean");

console.log("Execution policy diagnostic passed.");
