import { INVARIANTS } from "../../core/kernel/invariants";
import { REFUSAL_CODES } from "../../core/kernel/refusalCodes";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const invariantValues = Object.values(INVARIANTS);
const refusalValues = Object.values(REFUSAL_CODES);

assert(invariantValues.includes("INV-001"), "Missing INV-001 mode restriction invariant");
assert(invariantValues.includes("INV-004"), "Missing INV-004 schema validation invariant");
assert(invariantValues.includes("INV-009"), "Missing INV-009 approval required invariant");

assert(refusalValues.includes("PW-SCHEMA-001"), "Missing schema refusal code");
assert(refusalValues.includes("PW-GRANT-001"), "Missing capability grant refusal code");
assert(refusalValues.includes("PW-POL-001"), "Missing policy refusal code");

assert(new Set(invariantValues).size === invariantValues.length, "Duplicate invariant IDs found");
assert(new Set(refusalValues).size === refusalValues.length, "Duplicate refusal codes found");

console.log("Kernel hardening diagnostic passed.");
