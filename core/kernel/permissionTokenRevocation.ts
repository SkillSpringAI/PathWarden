import { getSchemaValidator, formatAjvErrors } from "../common/schemaValidator";
import { loadConfigFile } from "../common/configLoader";

export interface PermissionTokenRevocation {
  token_id: string;
  revoked_at: string;
  reason: string;
}

export interface PermissionTokenRevocationList {
  schema_version: "permission-token-revocations.v1";
  revoked_tokens: PermissionTokenRevocation[];
}

const validator = getSchemaValidator(
  "schemas/authority/permission-token-revocations.schema.json"
);

export function loadPermissionTokenRevocations(): PermissionTokenRevocationList {
  const revocations = loadConfigFile<PermissionTokenRevocationList>(
    "policy/authority/permission-token-revocations.json"
  );

  const valid = validator(revocations);

  if (!valid) {
    throw new Error(
      `Invalid permission token revocation list: ${formatAjvErrors(validator.errors)}`
    );
  }

  return revocations;
}

export function isPermissionTokenRevoked(tokenId: string): boolean {
  return loadPermissionTokenRevocations()
    .revoked_tokens
    .some((entry) => entry.token_id === tokenId);
}
