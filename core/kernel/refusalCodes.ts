// Refusal codes provide stable machine-readable governance outcomes.
// Codes should remain durable across diagnostics, replay, and federation layers.

export const REFUSAL_CODES = {
  SCHEMA_INVALID: "PW-SCHEMA-001",
  MODE_RESTRICTION: "PW-MODE-001",
  CONFIRMATION_REQUIRED: "PW-CONFIRM-001",
  PROTECTED_PATH: "PW-PATH-001",
  PLAN_ERROR: "PW-PLAN-001",
  POLICY_DENIED: "PW-POL-001",
  AUDIT_FAILURE: "PW-AUDIT-001",
  CAPABILITY_DENIED: "PW-GRANT-001"
} as const;
// Derived refusal-code unions prevent invalid governance code emission at compile time.

export type RefusalCode =
  typeof REFUSAL_CODES[keyof typeof REFUSAL_CODES];
