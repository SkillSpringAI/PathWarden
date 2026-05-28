import type { ValidationRefusal } from "./types";
// Refusals are structured governance outcomes, not generic errors.
// The envelope keeps failure decisions replayable, auditable, and machine-readable.

export function buildRefusal(
  decisionCode: string,
  refusalCode: string,
  message: string,
  invariantId: string,
  triggerHits: string[] = [],
  auditRequired = true
): ValidationRefusal {
  return {
    ok: false,
    decision_code: decisionCode,
    refusal_code: refusalCode,
    message,
    invariant_id: invariantId,
    trigger_hits: triggerHits,
    audit_required: auditRequired
  };
}
