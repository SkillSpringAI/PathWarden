import { getSchemaValidator } from "../../core/common/schemaValidator";
import { buildDecisionLegitimacyArtifact } from "../../core/kernel/legitimacyArtifactBuilder";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const validator = getSchemaValidator(
  "schemas/authority/decision-legitimacy-artifact.schema.json"
);

const artifact = buildDecisionLegitimacyArtifact({
  trace_id: "trace_dla_diag",
  mode: "core",
  decision_code: "TASK_VALIDATE_PLAN_ALLOWED",
  invariant_checks: ["INV-004"],
  trigger_hits: ["mutation_requested"],
  approval_state: "approved",
  authority_chain: [
    "task_runner",
    "validator",
    "execution_layer"
  ],
  risk_level: "medium"
});

const valid = validator(artifact);

assert(valid === true, "Expected legitimacy artifact schema validation to pass");

console.log("Legitimacy artifact diagnostic passed.");
