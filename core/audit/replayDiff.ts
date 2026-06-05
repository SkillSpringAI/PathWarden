import {
  formatAjvErrors,
  getSchemaValidator
} from "../common/schemaValidator";
import { buildReplayBaseline } from "./replayBaseline";
import type {
  ReplayBaseline,
  ReplayBaselineAuthorityRef,
  ReplayBaselineExecutionRef
} from "./replayBaseline";

export interface ReplayDiffSection {
  changed: boolean;
  added: string[];
  removed: string[];
  modified: string[];
}

export interface ReplayDiffDetailSection {
  changed: boolean;
  details: string[];
}

export interface ReplayDiff {
  schema_version: "replay-diff.v1";
  diff_id: string;
  created_at: string;
  baseline: {
    baseline_id: string;
    source: string | null;
  };
  candidate: {
    replay_id: string;
    source: string | null;
  };
  authority: ReplayDiffSection;
  execution: ReplayDiffSection;
  trust: ReplayDiffDetailSection;
  revocation: ReplayDiffDetailSection;
  governance: {
    changed: boolean;
    policy_ref_changes: string[];
    trigger_ref_changes: string[];
  };
  summary: {
    status:
      | "no_divergence"
      | "expected_divergence"
      | "unexpected_divergence"
      | "governance_divergence"
      | "trust_divergence"
      | "revocation_divergence"
      | "policy_divergence"
      | "invalid_diff";
    severity: "none" | "info" | "warning" | "critical";
    admissible: boolean;
    notes: string[];
  };
}

function createDiffId(
  baselineId: string,
  traceId: string,
  createdAt: string
): string {
  const safeBaselineId = baselineId
    .replace(/[^0-9A-Za-z_-]/g, "")
    .slice(0, 64);

  const safeTraceId = traceId
    .replace(/[^0-9A-Za-z_-]/g, "")
    .slice(0, 48);

  const safeTimestamp = createdAt
    .replace(/[^0-9A-Za-z]/g, "")
    .slice(0, 20);

  return `replaydiff_${safeBaselineId}_${safeTraceId}_${safeTimestamp}`;
}

function authorityKey(ref: ReplayBaselineAuthorityRef): string {
  return `${ref.record_type}:${ref.trace_id}:${ref.timestamp}:${ref.record_hash}`;
}

function executionKey(ref: ReplayBaselineExecutionRef): string {
  return `${ref.event_id}:${ref.timestamp}:${ref.decision_code}`;
}

function compareSets(
  baselineValues: string[],
  candidateValues: string[]
): ReplayDiffSection {
  const baselineSet = new Set(baselineValues);
  const candidateSet = new Set(candidateValues);

  const added = candidateValues
    .filter((value) => !baselineSet.has(value))
    .sort();

  const removed = baselineValues
    .filter((value) => !candidateSet.has(value))
    .sort();

  return {
    changed: added.length > 0 || removed.length > 0,
    added,
    removed,
    modified: []
  };
}

function compareStringArrays(
  baselineValues: string[],
  candidateValues: string[]
): ReplayDiffDetailSection {
  const diff = compareSets(baselineValues, candidateValues);

  return {
    changed: diff.changed,
    details: [
      ...diff.added.map((value) => `added:${value}`),
      ...diff.removed.map((value) => `removed:${value}`)
    ]
  };
}

function hasGovernanceChanges(
  policyRefChanges: string[],
  triggerRefChanges: string[]
): boolean {
  return policyRefChanges.length > 0 || triggerRefChanges.length > 0;
}

function buildSummary(
  authority: ReplayDiffSection,
  execution: ReplayDiffSection,
  trust: ReplayDiffDetailSection,
  revocation: ReplayDiffDetailSection,
  governanceChanged: boolean,
  candidateBaseline: ReplayBaseline
): ReplayDiff["summary"] {
  const changed =
    authority.changed ||
    execution.changed ||
    trust.changed ||
    revocation.changed ||
    governanceChanged;

  const hasReplayFailures =
    !candidateBaseline.replay.baseline_safe ||
    candidateBaseline.replay.authority_chain_hash_mismatches.length > 0 ||
    candidateBaseline.replay.authority_record_hash_mismatches.length > 0 ||
    candidateBaseline.replay.authority_chain_continuity_breaks.length > 0;

  if (hasReplayFailures) {
    return {
      status: "invalid_diff",
      severity: "critical",
      admissible: false,
      notes: [
        "Candidate replay baseline is not replay-safe.",
        "Replay diff is not admissible until replay failures are resolved."
      ]
    };
  }

  if (!changed) {
    return {
      status: "no_divergence",
      severity: "none",
      admissible: true,
      notes: [
        "No divergence detected between baseline and candidate replay state."
      ]
    };
  }

  if (trust.changed) {
    return {
      status: "trust_divergence",
      severity: "warning",
      admissible: false,
      notes: [
        "Trust context changed between baseline and candidate replay state."
      ]
    };
  }

  if (revocation.changed) {
    return {
      status: "revocation_divergence",
      severity: "warning",
      admissible: false,
      notes: [
        "Revocation context changed between baseline and candidate replay state."
      ]
    };
  }

  if (governanceChanged) {
    return {
      status: "governance_divergence",
      severity: "warning",
      admissible: false,
      notes: [
        "Governance context changed between baseline and candidate replay state."
      ]
    };
  }

  return {
    status: "unexpected_divergence",
    severity: "warning",
    admissible: false,
    notes: [
      "Replay divergence detected between baseline and candidate replay state."
    ]
  };
}

export function buildReplayDiff(
  baseline: ReplayBaseline,
  traceId: string,
  createdAt = new Date().toISOString()
): ReplayDiff {
  const candidateBaseline = buildReplayBaseline(traceId, createdAt);

  const authority = compareSets(
    baseline.authority.record_refs.map(authorityKey),
    candidateBaseline.authority.record_refs.map(authorityKey)
  );

  const execution = compareSets(
    baseline.execution.record_refs.map(executionKey),
    candidateBaseline.execution.record_refs.map(executionKey)
  );

  const trust = compareStringArrays(
    baseline.trust.signer_refs,
    candidateBaseline.trust.signer_refs
  );

  const revocation = compareStringArrays(
    baseline.revocation.summary,
    candidateBaseline.revocation.summary
  );

  const policyRefChanges = compareStringArrays(
    baseline.governance.policy_refs,
    candidateBaseline.governance.policy_refs
  ).details;

  const triggerRefChanges = compareStringArrays(
    baseline.governance.trigger_refs,
    candidateBaseline.governance.trigger_refs
  ).details;

  const governanceChanged = hasGovernanceChanges(
    policyRefChanges,
    triggerRefChanges
  );

  return {
    schema_version: "replay-diff.v1",
    diff_id: createDiffId(
      baseline.baseline_id,
      candidateBaseline.execution.trace_id,
      createdAt
    ),
    created_at: createdAt,
    baseline: {
      baseline_id: baseline.baseline_id,
      source: null
    },
    candidate: {
      replay_id: candidateBaseline.baseline_id,
      source: null
    },
    authority,
    execution,
    trust,
    revocation,
    governance: {
      changed: governanceChanged,
      policy_ref_changes: policyRefChanges,
      trigger_ref_changes: triggerRefChanges
    },
    summary: buildSummary(
      authority,
      execution,
      trust,
      revocation,
      governanceChanged,
      candidateBaseline
    )
  };
}

export function validateReplayDiff(diff: ReplayDiff): void {
  const validator = getSchemaValidator(
    "schemas/audit/replay-diff.schema.json"
  );

  const valid = validator(diff);

  if (!valid) {
    throw new Error(
      "Invalid replay diff: " +
      formatAjvErrors(validator.errors)
    );
  }
}
