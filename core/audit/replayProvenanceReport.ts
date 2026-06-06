import {
  formatAjvErrors,
  getSchemaValidator
} from "../common/schemaValidator";
import { buildAuthoritySnapshot } from "./authoritySnapshot";
import { buildPolicyManifest } from "../policy/policyManifest";
import { addPolicyHashes, verifyPolicyHashes } from "../policy/policyHasher";
import type { ReplayBaseline } from "./replayBaseline";
import type { ReplayDiff } from "./replayDiff";

export type ReplayProvenanceStatus =
  | "verified"
  | "verified_with_warnings"
  | "incomplete"
  | "failed"
  | "not_checked";

export type ReplayProvenanceSeverity =
  | "none"
  | "info"
  | "warning"
  | "critical";

export interface ReplayProvenanceLineageGap {
  kind: string;
  severity: ReplayProvenanceSeverity;
  message: string;
}

export interface ReplayProvenanceArtifactRef {
  kind:
    | "authority_snapshot"
    | "replay_baseline"
    | "replay_diff"
    | "policy_manifest";
  id: string | null;
  path: string | null;
  required: boolean;
}

export interface ReplayProvenanceReport {
  schema_version: "replay-provenance-report.v1";
  report_id: string;
  created_at: string;
  source: {
    runtime: "pathwarden";
    environment: string;
  };
  authority: {
    snapshot_id: string | null;
    status: ReplayProvenanceStatus;
  };
  replay: {
    baseline_id: string | null;
    diff_id: string | null;
    execution_replay_refs: string[];
    status: ReplayProvenanceStatus;
  };
  trust: {
    manifest_id: string | null;
    status: ReplayProvenanceStatus;
    warnings: string[];
    critical_failures: string[];
  };
  revocation: {
    checked: boolean;
    status: ReplayProvenanceStatus;
    warnings: string[];
    critical_failures: string[];
  };
  policy: {
    manifest_id: string | null;
    hashes_available: boolean;
    status: ReplayProvenanceStatus;
  };
  lineage: {
    complete: boolean;
    explainable: boolean;
    gaps: ReplayProvenanceLineageGap[];
    notes: string[];
  };
  summary: {
    status: ReplayProvenanceStatus;
    severity: ReplayProvenanceSeverity;
    admissible: boolean;
    recommendation: string;
    notes: string[];
  };
  artifacts: ReplayProvenanceArtifactRef[];
}

function createReportId(createdAt: string): string {
  const safeTimestamp = createdAt
    .replace(/[^0-9A-Za-z]/g, "")
    .slice(0, 20);

  return `replayprov_${safeTimestamp}`;
}

function compareArtifactRefs(
  left: ReplayProvenanceArtifactRef,
  right: ReplayProvenanceArtifactRef
): number {
  return (
    left.kind.localeCompare(right.kind) ||
    String(left.id ?? "").localeCompare(String(right.id ?? "")) ||
    String(left.path ?? "").localeCompare(String(right.path ?? ""))
  );
}

function compareLineageGaps(
  left: ReplayProvenanceLineageGap,
  right: ReplayProvenanceLineageGap
): number {
  return (
    left.severity.localeCompare(right.severity) ||
    left.kind.localeCompare(right.kind) ||
    left.message.localeCompare(right.message)
  );
}

function executionReplayRefsFromBaseline(
  baseline: ReplayBaseline | null
): string[] {
  if (!baseline) {
    return [];
  }

  return baseline.execution.record_refs
    .map((ref) => `${baseline.execution.trace_id}:${ref.event_id}:${ref.timestamp}:${ref.decision_code}`)
    .sort();
}

function buildSummary(args: {
  lineageComplete: boolean;
  lineageExplainable: boolean;
  hasCriticalGaps: boolean;
  hasWarningGaps: boolean;
}): ReplayProvenanceReport["summary"] {
  if (args.hasCriticalGaps) {
    return {
      status: "failed",
      severity: "critical",
      admissible: false,
      recommendation: "Do not treat replay provenance as admissible until critical lineage gaps are resolved.",
      notes: [
        "Replay provenance contains critical lineage gaps."
      ]
    };
  }

  if (!args.lineageComplete) {
    return {
      status: "incomplete",
      severity: "warning",
      admissible: false,
      recommendation: "Treat replay provenance as advisory until required replay lineage artifacts are supplied.",
      notes: [
        "Replay provenance was generated from available local evidence.",
        "Some required replay lineage artifacts are missing or incomplete."
      ]
    };
  }

  if (args.hasWarningGaps || !args.lineageExplainable) {
    return {
      status: "verified_with_warnings",
      severity: "warning",
      admissible: false,
      recommendation: "Review replay provenance warnings before treating it as admissible evidence.",
      notes: [
        "Replay provenance is present but warnings remain."
      ]
    };
  }

  return {
    status: "verified",
    severity: "none",
    admissible: true,
    recommendation: "Replay provenance evidence is complete and explainable.",
    notes: [
      "Replay provenance generated from supplied replay baseline and replay diff evidence."
    ]
  };
}

export function buildReplayProvenanceReport(
  baseline: ReplayBaseline | null = null,
  diff: ReplayDiff | null = null,
  createdAt = new Date().toISOString()
): ReplayProvenanceReport {
  const authoritySnapshot = buildAuthoritySnapshot(createdAt);
  const policyManifest = addPolicyHashes(
    buildPolicyManifest(createdAt)
  );
  const policyHashResults = verifyPolicyHashes(policyManifest);
  const policyFailures = policyHashResults.filter((result) =>
    result.status !== "match"
  );

  const gaps: ReplayProvenanceLineageGap[] = [];

  if (!authoritySnapshot.snapshot_id) {
    gaps.push({
      kind: "missing_authority_snapshot",
      severity: "warning",
      message: "Replay provenance does not reference an authority snapshot."
    });
  }

  if (!baseline) {
    gaps.push({
      kind: "missing_replay_baseline",
      severity: "warning",
      message: "Replay provenance does not reference a replay baseline."
    });
  }

  if (!diff) {
    gaps.push({
      kind: "missing_replay_diff",
      severity: "warning",
      message: "Replay provenance does not reference a replay diff."
    });
  }

  if (policyFailures.length > 0) {
    gaps.push({
      kind: "policy_hash_verification_failure",
      severity: "critical",
      message: "Policy hash verification failed for one or more policy manifest references."
    });
  }

  if (baseline && !baseline.replay.baseline_safe) {
    gaps.push({
      kind: "unsafe_replay_baseline",
      severity: "critical",
      message: "Replay baseline is not replay-safe."
    });
  }

  if (diff && !diff.summary.admissible) {
    gaps.push({
      kind: "inadmissible_replay_diff",
      severity: "critical",
      message: "Replay diff is not admissible."
    });
  }

  const sortedGaps = gaps.sort(compareLineageGaps);
  const hasCriticalGaps = sortedGaps.some((gap) => gap.severity === "critical");
  const hasWarningGaps = sortedGaps.some((gap) => gap.severity === "warning");

  const lineageComplete =
    Boolean(authoritySnapshot.snapshot_id) &&
    Boolean(baseline) &&
    Boolean(diff) &&
    !hasCriticalGaps;

  const lineageExplainable =
    Boolean(baseline) &&
    Boolean(diff) &&
    policyFailures.length === 0;

  const summary = buildSummary({
    lineageComplete,
    lineageExplainable,
    hasCriticalGaps,
    hasWarningGaps
  });

  const artifactRefs: ReplayProvenanceArtifactRef[] = [
    {
      kind: "authority_snapshot",
      id: authoritySnapshot.snapshot_id,
      path: null,
      required: true
    },
    {
      kind: "replay_baseline",
      id: baseline?.baseline_id ?? null,
      path: null,
      required: true
    },
    {
      kind: "replay_diff",
      id: diff?.diff_id ?? null,
      path: null,
      required: true
    },
    {
      kind: "policy_manifest",
      id: policyManifest.manifest_id,
      path: null,
      required: true
    }
  ];

  const artifacts = artifactRefs.sort(compareArtifactRefs);

  return {
    schema_version: "replay-provenance-report.v1",
    report_id: createReportId(createdAt),
    created_at: createdAt,
    source: {
      runtime: "pathwarden",
      environment: "local"
    },
    authority: {
      snapshot_id: authoritySnapshot.snapshot_id,
      status: authoritySnapshot.snapshot_id ? "verified" : "incomplete"
    },
    replay: {
      baseline_id: baseline?.baseline_id ?? null,
      diff_id: diff?.diff_id ?? null,
      execution_replay_refs: executionReplayRefsFromBaseline(baseline),
      status: baseline && diff ? "verified" : "incomplete"
    },
    trust: {
      manifest_id: baseline?.trust.manifest_id ?? null,
      status: baseline?.trust.manifest_id ? "verified" : "verified_with_warnings",
      warnings: baseline?.trust.manifest_id
        ? []
        : ["Trust manifest reference is not yet supplied in replay baseline evidence."],
      critical_failures: []
    },
    revocation: {
      checked: baseline?.revocation.checked ?? false,
      status: baseline?.revocation.checked ? "verified" : "incomplete",
      warnings: baseline?.revocation.checked
        ? []
        : ["Revocation context is not checked because replay baseline evidence is missing or incomplete."],
      critical_failures: []
    },
    policy: {
      manifest_id: policyManifest.manifest_id,
      hashes_available: policyManifest.hashing.hashes_available,
      status: policyFailures.length === 0 ? "verified" : "failed"
    },
    lineage: {
      complete: lineageComplete,
      explainable: lineageExplainable,
      gaps: sortedGaps,
      notes: [
        "Replay provenance report generated from available local evidence.",
        "Missing baseline or diff artifacts are declared as lineage gaps rather than hidden."
      ]
    },
    summary,
    artifacts
  };
}

export function validateReplayProvenanceReport(
  report: ReplayProvenanceReport
): void {
  const validator = getSchemaValidator(
    "schemas/audit/replay-provenance-report.schema.json"
  );

  const valid = validator(report);

  if (!valid) {
    throw new Error(
      "Invalid replay provenance report: " +
      formatAjvErrors(validator.errors)
    );
  }
}
