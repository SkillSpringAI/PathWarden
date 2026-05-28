import { makeId } from "../common/ids";
import { nowIso } from "../common/time";
import { hashAuthorityChain } from "../common/hash";
import type { DecisionLegitimacyArtifact, ApprovalState } from "./legitimacyArtifact";
import type { PathwardenMode, RiskLevel } from "./types";

// Legitimacy artifacts capture why a governance decision was allowed or refused.
// They are replay evidence, not just runtime metadata.

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
// The artifact binds decision context, invariant checks, triggers,
// approval state, authority chain, and timestamp into one evidence record.

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
    // Hashing the authority chain makes lineage tamper-evident during replay.

    authority_chain_hash: hashAuthorityChain(input.authority_chain),
    authority_chain_hash_algorithm: "sha256"
  };
}

