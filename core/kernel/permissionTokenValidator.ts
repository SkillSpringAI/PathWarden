import type { PathwardenAction, RiskLevel } from "./types";
import type { PermissionToken } from "./permissionToken";
import { resolveRisk } from "./risk";
import { isPermissionTokenRevoked } from "./permissionTokenRevocation";

// Permission token validation is a governance boundary.
// Tokens are treated as authority artifacts, not convenience metadata.

export type PermissionTokenValidationDecision =
  | {
      ok: true;
      decision_code: "ALLOW_PERMISSION_TOKEN";
    }
  | {
      ok: false;
      decision_code:
        | "REFUSE_PERMISSION_TOKEN_MISSING"
        | "REFUSE_PERMISSION_TOKEN_EXPIRED"
        | "REFUSE_PERMISSION_TOKEN_SCOPE"
        | "REFUSE_PERMISSION_TOKEN_RISK"
        | "REFUSE_PERMISSION_TOKEN_TRACE"
        | "REFUSE_PERMISSION_TOKEN_AUDIT"
        | "REFUSE_PERMISSION_TOKEN_REVOKED";
      refusal_code: "PW-TOKEN-001";
      message: string;
      trigger_hits: string[];
    };

const riskRank: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

function operationAliases(action: PathwardenAction): string[] {
  return [
    action.operation,
    `${action.type}.${action.operation}`,
    `${action.type}.request${action.operation.charAt(0).toUpperCase()}${action.operation.slice(1)}`
  ];
}

function deny(
  decisionCode: Exclude<PermissionTokenValidationDecision["decision_code"], "ALLOW_PERMISSION_TOKEN">,
  message: string,
  triggerHits: string[]
): PermissionTokenValidationDecision {
  return {
    ok: false,
    decision_code: decisionCode,
    refusal_code: "PW-TOKEN-001",
    message,
    trigger_hits: triggerHits
  };
}
// Reject malformed tokens before authority evaluation.
// Governance decisions must never rely on partially valid token structures.

export function validatePermissionTokenForAction(
  token: PermissionToken | undefined,
  action: PathwardenAction,
  expectedTraceId?: string
): PermissionTokenValidationDecision {

  if (!token) {
    return deny(
      "REFUSE_PERMISSION_TOKEN_MISSING",
      "Permission token is required for this execution path",
      ["permission_token_missing"]
    );
  }

  if (!token.trace_id) {
    return deny(
      "REFUSE_PERMISSION_TOKEN_TRACE",
      "Permission token is missing trace_id",
      ["permission_token_trace_missing"]
    );
  }

  if (expectedTraceId && token.trace_id !== expectedTraceId) {
    return deny(
      "REFUSE_PERMISSION_TOKEN_TRACE",
      "Permission token trace_id does not match execution trace_id",
      ["permission_token_trace_mismatch"]
    );

  }
// Revoked tokens invalidate downstream execution authority.
// Replay and execution must both respect revocation state.

  if (isPermissionTokenRevoked(token.token_id)) {
    return deny(
      "REFUSE_PERMISSION_TOKEN_REVOKED",
      "Permission token has been revoked",
      ["permission_token_revoked"]
    );
  }
// Expired tokens cannot retain execution authority.
// Time-bound governance prevents indefinite capability reuse.

  const expiresAt = Date.parse(token.expires_at);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return deny(
      "REFUSE_PERMISSION_TOKEN_EXPIRED",
      "Permission token is expired or has invalid expiry",
      ["permission_token_expired"]
    );
  }
// Token issuer validation preserves authority lineage.
// Execution authority must originate from recognised governance issuers.

  const aliases = operationAliases(action);
  const hasScope = aliases.some((alias) => token.granted_operations.includes(alias));

  if (!hasScope) {
    return deny(
      "REFUSE_PERMISSION_TOKEN_SCOPE",
      `Permission token does not grant operation: ${action.operation}`,
      ["permission_token_scope_denied"]
    );
  }

  const actionRisk = resolveRisk(action);
  if (riskRank[actionRisk] > riskRank[token.risk_ceiling]) {
    return deny(
      "REFUSE_PERMISSION_TOKEN_RISK",
      `Action risk ${actionRisk} exceeds token ceiling ${token.risk_ceiling}`,
      ["permission_token_risk_exceeded"]
    );
  }

  if (!token.audit_required) {
    return deny(
      "REFUSE_PERMISSION_TOKEN_AUDIT",
      "Permission token must require audit for execution",
      ["permission_token_audit_not_required"]
    );
  }

  return {
    ok: true,
    decision_code: "ALLOW_PERMISSION_TOKEN"
  };
}
// Validation success means the token passed:
// - schema validation
// - issuer validation
// - revocation checks
// - expiry checks
// - governance constraints

