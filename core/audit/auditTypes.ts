export type AuditOutcome = "allowed" | "refused" | "executed" | "failed";
export type AuditMode = "core" | "connect" | "assistant" | "locked_down";
export type AuditRisk = "low" | "medium" | "high" | "critical";

export interface AuditEvent {
  trace_id?: string;
  event_id: string;
  timestamp: string;
  mode: AuditMode;
  decision_code: string;
  refusal_code?: string;
  outcome: AuditOutcome;
  trigger_hits: string[];
  risk_level?: AuditRisk;
  message?: string;
  plan_id?: string;
  commit_id?: string;
  permission_token_id?: string;
  legitimacy_artifact_id?: string;
  authority_chain?: string[];
}


