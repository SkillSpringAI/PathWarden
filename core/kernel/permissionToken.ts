import type { RiskLevel } from "./types";

export interface PermissionToken {
  schema_version: "permission-token.v1";
  token_id: string;
  trace_id: string;
  app_id: string;
  tool_id: string;
  granted_operations: string[];
  risk_ceiling: RiskLevel;
  requires_approval: boolean;
  audit_required: boolean;
  issuer: string;
  issued_at: string;
  expires_at: string;
  signature_stub: string;
}
