import type { ValidationRefusal } from "./types";

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
