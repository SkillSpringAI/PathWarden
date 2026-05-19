import { makeId } from "../common/ids";
import { nowIso } from "../common/time";
import type { RiskLevel } from "./types";
import type { PermissionToken } from "./permissionToken";

export interface MintPermissionTokenInput {
  trace_id: string;
  app_id: string;
  tool_id: string;
  granted_operations: string[];
  risk_ceiling: RiskLevel;
  requires_approval: boolean;
  audit_required?: boolean;
  issuer: string;
  expires_at: string;
}

export function mintPermissionToken(
  input: MintPermissionTokenInput
): PermissionToken {

  return {
    schema_version: "permission-token.v1",
    token_id: makeId("pt"),
    trace_id: input.trace_id,
    app_id: input.app_id,
    tool_id: input.tool_id,
    granted_operations: input.granted_operations,
    risk_ceiling: input.risk_ceiling,
    requires_approval: input.requires_approval,
    audit_required: input.audit_required ?? true,
    issuer: input.issuer,
    issued_at: nowIso(),
    expires_at: input.expires_at,
    signature_stub: "UNSIGNED_STUB"
  };
}
