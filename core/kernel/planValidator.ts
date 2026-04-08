import { buildRefusal } from "./refusal";
import { validateAction } from "./validator";
import type { PathwardenMode, PathwardenPlan, ValidationRefusal } from "./types";
import { getSchemaValidator, formatAjvErrors } from "../common/schemaValidator";

const planSchemaValidator = getSchemaValidator("schemas/plan/plan.schema.json");

export function validatePlan(
  mode: PathwardenMode,
  input: unknown
): { ok: true; plan: PathwardenPlan } | { ok: false; refusal: ValidationRefusal } {
  const schemaOk = planSchemaValidator(input);
  if (!schemaOk) {
    return {
      ok: false,
      refusal: buildRefusal(
        "REFUSE_SCHEMA_INVALID",
        "PW-SCHEMA-001",
        formatAjvErrors(planSchemaValidator.errors),
        "INV-004",
        ["schema_invalid"]
      )
    };
  }

  const typedPlan = input as PathwardenPlan;

  for (const action of typedPlan.actions) {
    const result = validateAction(mode, action, false);
    if (!result.ok) {
      return { ok: false, refusal: result };
    }
  }

  return {
    ok: true,
    plan: typedPlan
  };
}
