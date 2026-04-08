import { buildRefusal } from "./refusal";
import type { PathwardenCommit, ValidationRefusal } from "./types";
import { getSchemaValidator, formatAjvErrors } from "../common/schemaValidator";

const commitSchemaValidator = getSchemaValidator("schemas/commit/commit.schema.json");

export function validateCommit(
  input: unknown
): { ok: true; commit: PathwardenCommit } | { ok: false; refusal: ValidationRefusal } {
  const schemaOk = commitSchemaValidator(input);
  if (!schemaOk) {
    return {
      ok: false,
      refusal: buildRefusal(
        "REFUSE_SCHEMA_INVALID",
        "PW-SCHEMA-001",
        formatAjvErrors(commitSchemaValidator.errors),
        "INV-004",
        ["schema_invalid"]
      )
    };
  }

  return {
    ok: true,
    commit: input as PathwardenCommit
  };
}
