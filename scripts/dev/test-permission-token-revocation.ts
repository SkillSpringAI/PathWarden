import { isPermissionTokenRevoked, loadPermissionTokenRevocations } from "../../core/kernel/permissionTokenRevocation";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const revocations = loadPermissionTokenRevocations();

assert(
  revocations.schema_version === "permission-token-revocations.v1",
  "Expected revocation schema version"
);

assert(
  Array.isArray(revocations.revoked_tokens),
  "Expected revoked_tokens array"
);

assert(
  isPermissionTokenRevoked("pt_nonexistent_test") === false,
  "Expected nonexistent token not to be revoked"
);

console.log("Permission token revocation diagnostic passed.");
