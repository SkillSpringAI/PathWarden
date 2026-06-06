import {
  formatAjvErrors,
  getSchemaValidator
} from "../common/schemaValidator";
import { buildGovernanceReport } from "./governanceReport";
import { buildReplayProvenanceReport } from "./replayProvenanceReport";
import { buildPolicyManifest } from "../policy/policyManifest";
import { addPolicyHashes, verifyPolicyHashes } from "../policy/policyHasher";
import { getDiagnosticMetadataRegistry } from "../common/diagnostics/diagnosticRegistry";

export type FederationReadinessStatus =
  | "verified"
  | "verified_with_warnings"
  | "incomplete"
  | "failed"
  | "not_checked";

export type FederationReadinessSeverity =
  | "none"
  | "info"
  | "warning"
  | "critical";

export interface FederationReadinessArtifactRef {
  kind:
    | "governance_report"
    | "replay_provenance_report"
    | "policy_manifest"
    | "diagnostic_metadata_registry";
  id: string | null;
  path: string | null;
  required: boolean;
}

export interface FederationReadinessAudit {
  schema_version: "federation-readiness-audit.v1";
  audit_id: string;
  created_at: string;
  source: {
    runtime: "pathwarden";
    environment: string;
  };
  governance: {
    report_id: string | null;
    status: FederationReadinessStatus;
    release_safe: boolean;
  };
  replay_provenance: {
    report_id: string | null;
    status: FederationReadinessStatus;
    admissible: boolean;
    lineage_complete: boolean;
  };
  policy: {
    manifest_id: string | null;
    hashes_available: boolean;
    status: FederationReadinessStatus;
  };
  diagnostics: {
    registered: number;
    blocking: number;
    ci_compatible: number;
    status: FederationReadinessStatus;
  };
  federation: {
    ready: boolean;
    status: FederationReadinessStatus;
    warnings: string[];
    critical_failures: string[];
    missing_requirements: string[];
  };
  summary: {
    status: FederationReadinessStatus;
    severity: FederationReadinessSeverity;
    ready_for_federation: boolean;
    recommendation: string;
    notes: string[];
  };
  artifacts: FederationReadinessArtifactRef[];
}

function createAuditId(createdAt: string): string {
  const safeTimestamp = createdAt
    .replace(/[^0-9A-Za-z]/g, "")
    .slice(0, 20);

  return `fedready_${safeTimestamp}`;
}

function compareArtifactRefs(
  left: FederationReadinessArtifactRef,
  right: FederationReadinessArtifactRef
): number {
  return (
    left.kind.localeCompare(right.kind) ||
    String(left.id ?? "").localeCompare(String(right.id ?? "")) ||
    String(left.path ?? "").localeCompare(String(right.path ?? ""))
  );
}

function buildFederationSummary(args: {
  ready: boolean;
  criticalFailures: string[];
  missingRequirements: string[];
  warnings: string[];
}): FederationReadinessAudit["summary"] {
  if (args.criticalFailures.length > 0) {
    return {
      status: "failed",
      severity: "critical",
      ready_for_federation: false,
      recommendation: "Do not implement federation runtime until critical readiness failures are resolved.",
      notes: [
        "Federation readiness audit found critical blockers.",
        "This audit does not perform federation and does not grant cross-runtime authority."
      ]
    };
  }

  if (args.missingRequirements.length > 0) {
    return {
      status: "incomplete",
      severity: "warning",
      ready_for_federation: false,
      recommendation: "Treat federation as not ready until missing readiness requirements are implemented or supplied.",
      notes: [
        "Federation readiness audit generated from available local evidence.",
        "Missing requirements are reported explicitly rather than hidden."
      ]
    };
  }

  if (args.warnings.length > 0) {
    return {
      status: "verified_with_warnings",
      severity: "warning",
      ready_for_federation: false,
      recommendation: "Review warnings before considering federation runtime work.",
      notes: [
        "Federation readiness evidence exists but warnings remain."
      ]
    };
  }

  return {
    status: "verified",
    severity: "none",
    ready_for_federation: args.ready,
    recommendation: args.ready
      ? "Local evidence is ready for cautious federation design work."
      : "Federation is not ready.",
    notes: [
      "Federation readiness audit completed from local evidence only."
    ]
  };
}

export function buildFederationReadinessAudit(
  createdAt = new Date().toISOString()
): FederationReadinessAudit {
  const governanceReport = buildGovernanceReport(createdAt);
  const replayProvenanceReport = buildReplayProvenanceReport(
    null,
    null,
    createdAt
  );

  const policyManifest = addPolicyHashes(
    buildPolicyManifest(createdAt)
  );
  const policyHashResults = verifyPolicyHashes(policyManifest);
  const policyFailures = policyHashResults.filter((result) =>
    result.status !== "match"
  );

  const diagnosticRegistry = getDiagnosticMetadataRegistry();
  const activeDiagnostics = diagnosticRegistry.filter((metadata) =>
    metadata.status === "active"
  );
  const blockingDiagnostics = activeDiagnostics.filter((metadata) =>
    metadata.blocking
  );
  const ciCompatibleDiagnostics = activeDiagnostics.filter((metadata) =>
    metadata.ci_compatible
  );

  const warnings: string[] = [];
  const criticalFailures: string[] = [];
  const missingRequirements: string[] = [];

  if (!governanceReport.summary.release_safe) {
    missingRequirements.push(
      "Governance report is not release-safe."
    );
  }

  if (!replayProvenanceReport.summary.admissible) {
    missingRequirements.push(
      "Replay provenance report is not admissible."
    );
  }

  if (!replayProvenanceReport.lineage.complete) {
    missingRequirements.push(
      "Replay provenance lineage is incomplete."
    );
  }

  if (policyFailures.length > 0) {
    criticalFailures.push(
      "Policy hash verification failed."
    );
  }

  if (activeDiagnostics.length === 0) {
    criticalFailures.push(
      "Diagnostic metadata registry has no active diagnostics."
    );
  }

  if (ciCompatibleDiagnostics.length !== activeDiagnostics.length) {
    warnings.push(
      "Not all active diagnostics are CI-compatible."
    );
  }

  warnings.push(
    "Federation runtime behavior is intentionally not implemented."
  );

  warnings.push(
    "Cross-runtime trust negotiation is intentionally not implemented."
  );

  const ready =
    criticalFailures.length === 0 &&
    missingRequirements.length === 0 &&
    warnings.length === 0;

  const federationStatus: FederationReadinessStatus = ready
    ? "verified"
    : criticalFailures.length > 0
      ? "failed"
      : "incomplete";

  const policyStatus: FederationReadinessStatus =
    policyFailures.length === 0 ? "verified" : "failed";

  const diagnosticsStatus: FederationReadinessStatus =
    activeDiagnostics.length > 0 ? "verified" : "failed";

  const artifactRefs: FederationReadinessArtifactRef[] = [
    {
      kind: "governance_report",
      id: governanceReport.report_id,
      path: null,
      required: true
    },
    {
      kind: "replay_provenance_report",
      id: replayProvenanceReport.report_id,
      path: null,
      required: true
    },
    {
      kind: "policy_manifest",
      id: policyManifest.manifest_id,
      path: null,
      required: true
    },
    {
      kind: "diagnostic_metadata_registry",
      id: "diagnostic-metadata-registry",
      path: "core/common/diagnostics/diagnosticRegistry.ts",
      required: true
    }
  ];

  const summary = buildFederationSummary({
    ready,
    criticalFailures,
    missingRequirements,
    warnings
  });

  return {
    schema_version: "federation-readiness-audit.v1",
    audit_id: createAuditId(createdAt),
    created_at: createdAt,
    source: {
      runtime: "pathwarden",
      environment: "local"
    },
    governance: {
      report_id: governanceReport.report_id,
      status: governanceReport.summary.status,
      release_safe: governanceReport.summary.release_safe
    },
    replay_provenance: {
      report_id: replayProvenanceReport.report_id,
      status: replayProvenanceReport.summary.status,
      admissible: replayProvenanceReport.summary.admissible,
      lineage_complete: replayProvenanceReport.lineage.complete
    },
    policy: {
      manifest_id: policyManifest.manifest_id,
      hashes_available: policyManifest.hashing.hashes_available,
      status: policyStatus
    },
    diagnostics: {
      registered: activeDiagnostics.length,
      blocking: blockingDiagnostics.length,
      ci_compatible: ciCompatibleDiagnostics.length,
      status: diagnosticsStatus
    },
    federation: {
      ready,
      status: federationStatus,
      warnings,
      critical_failures: criticalFailures,
      missing_requirements: missingRequirements
    },
    summary,
    artifacts: artifactRefs.sort(compareArtifactRefs)
  };
}

export function validateFederationReadinessAudit(
  audit: FederationReadinessAudit
): void {
  const validator = getSchemaValidator(
    "schemas/audit/federation-readiness-audit.schema.json"
  );

  const valid = validator(audit);

  if (!valid) {
    throw new Error(
      "Invalid federation readiness audit: " +
      formatAjvErrors(validator.errors)
    );
  }
}
