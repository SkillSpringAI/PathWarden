import type { PathwardenMode, RiskLevel } from "./types";

export type ApprovalState =
  | "not_required"
  | "required_pending"
  | "approved"
  | "refused"
  | "unknown";

export interface DecisionLegitimacyArtifact {
  schema_version: "decision-legitimacy-artifact.v1";
  artifact_id: string;
  trace_id: string;
  mode: PathwardenMode;
  decision_code: string;
  risk_level?: RiskLevel;
  invariant_checks: string[];
  trigger_hits: string[];
  approval_state: ApprovalState;
  capability_source?: string;
  audit_required: boolean;
  timestamp: string;
  authority_chain: string[];
  authority_chain_hash: string;
  authority_chain_hash_algorithm: "sha256";
}

