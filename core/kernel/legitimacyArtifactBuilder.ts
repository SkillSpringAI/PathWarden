import { makeId } from "../common/ids";
import { nowIso } from "../common/time";
import { hashAuthorityChain } from "../common/hash";
import type { DecisionLegitimacyArtifact, ApprovalState } from "./legitimacyArtifact";
import type { PathwardenMode, RiskLevel } from "./types";

export interface BuildLegitimacyArtifactInput {
  trace_id: string;
  mode: PathwardenMode;
  decision_code: string;
  invariant_checks: string[];
  trigger_hits: string[];
  approval_state: ApprovalState;
  authority_chain: string[];
  risk_level?: RiskLevel;
  capability_source?: string;
  audit_required?: boolean;
}

export function buildDecisionLegitimacyArtifact(
  input: BuildLegitimacyArtifactInput
): DecisionLegitimacyArtifact {

  return {
    schema_version: "decision-legitimacy-artifact.v1",
    artifact_id: makeId("dla"),
    trace_id: input.trace_id,
    mode: input.mode,
    decision_code: input.decision_code,
    risk_level: input.risk_level,
    invariant_checks: input.invariant_checks,
    trigger_hits: input.trigger_hits,
    approval_state: input.approval_state,
    capability_source: input.capability_source,
    audit_required: input.audit_required ?? true,
    timestamp: nowIso(),
    authority_chain: input.authority_chain,
    authority_chain_hash: hashAuthorityChain(input.authority_chain),
    authority_chain_hash_algorithm: "sha256"
  };
}

