import { validateTriggerHits } from "../../core/kernel/triggerHitValidator";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const valid = validateTriggerHits([
  "schema_invalid",
  "protected_path_access",
  "permission_token_missing"
]);

assert(valid.ok, "Expected known enabled triggers to validate");
assert(valid.unknown_triggers.length === 0, "Expected no unknown triggers");
assert(valid.disabled_triggers.length === 0, "Expected no disabled triggers");

const invalid = validateTriggerHits([
  "schema_invalid",
  "unknown_test_trigger"
]);

assert(!invalid.ok, "Expected unknown trigger to fail validation");
assert(
  invalid.unknown_triggers.includes("unknown_test_trigger"),
  "Expected unknown trigger to be reported"
);

console.log("Trigger hit validator diagnostic passed.");
