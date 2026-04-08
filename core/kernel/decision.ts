import type { PathwardenAction, PathwardenMode, RiskLevel, ValidationSuccess } from "./types";

export function buildDecision(
  mode: PathwardenMode,
  action: PathwardenAction,
  riskLevel: RiskLevel,
  triggerHits: string[],
  requiresConfirmation: boolean
): ValidationSuccess {
  return {
    ok: true,
    mode,
    decision_code: buildDecisionCode(action),
    risk_level: riskLevel,
    trigger_hits: triggerHits,
    requires_confirmation: requiresConfirmation,
    action
  };
}

function buildDecisionCode(action: PathwardenAction): string {
  return `ALLOW_FILESYSTEM_${action.operation.toUpperCase()}`;
}
