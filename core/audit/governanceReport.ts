import {
  formatAjvErrors,
  getSchemaValidator
} from "../common/schemaValidator";
import { buildAuthoritySnapshot } from "./authoritySnapshot";
import { verifyAuthoritySnapshotExport } from "./authorityExportVerifier";
import { buildPolicyManifest } from "../policy/policyManifest";
import { addPolicyHashes, verifyPolicyHashes } from "../policy/policyHasher";
import { getDiagnosticMetadataRegistry } from "../common/diagnostics/diagnosticRegistry";

export type GovernanceReportStatus =
  | "verified"
  | "verified_with_warnings"
  | "incomplete"
  | "failed"
  | "not_checked";

export type GovernanceReportSeverity =
  | "none"
  | "info"
  | "warning"
  | "critical";

export interface GovernanceReportArtifactRef {
  kind:
    | "authority_snapshot"
    | "policy_manifest"
    | "diagnostic_metadata_registry";
  id: string | null;
  path: string | null;
  required: boolean;
}

export interface GovernanceReport {
  schema_version: "governance-report.v1";
  report_id: string;
  created_at: string;
  source: {
    runtime: "pathwarden";
    environment: string;
  };
  authority: {
    snapshot_id: string | null;
    record_count: number;
    status: GovernanceReportStatus;
  };
  trust: {
    status: GovernanceReportStatus;
    warnings: string[];
    critical_failures: string[];
  };
  revocation: {
    checked: boolean;
    status: GovernanceReportStatus;
    warnings: string[];
    critical_failures: string[];
  };
  policy: {
    manifest_id: string | null;
    hashes_available: boolean;
    status: GovernanceReportStatus;
  };
  replay: {
    baseline_id: string | null;
    diff_id: string | null;
    status: GovernanceReportStatus;
  };
  diagnostics: {
    overall_status: GovernanceReportStatus;
    passed: number;
    failed: number;
    warnings: number;
  };
  summary: {
    release_safe: boolean;
    status: GovernanceReportStatus;
    severity: GovernanceReportSeverity;
    recommendation: string;
    notes: string[];
  };
  artifacts: GovernanceReportArtifactRef[];
}

function createReportId(createdAt: string): string {
  const safeTimestamp = createdAt
    .replace(/[^0-9A-Za-z]/g, "")
    .slice(0, 20);

  return `govreport_${safeTimestamp}`;
}

function compareArtifactRefs(
  left: GovernanceReportArtifactRef,
  right: GovernanceReportArtifactRef
): number {
  return (
    left.kind.localeCompare(right.kind) ||
    String(left.id ?? "").localeCompare(String(right.id ?? "")) ||
    String(left.path ?? "").localeCompare(String(right.path ?? ""))
  );
}

function buildSummary(args: {
  authorityStatus: GovernanceReportStatus;
  trustStatus: GovernanceReportStatus;
  revocationStatus: GovernanceReportStatus;
  policyStatus: GovernanceReportStatus;
  replayStatus: GovernanceReportStatus;
  diagnosticsStatus: GovernanceReportStatus;
}): GovernanceReport["summary"] {
  const statuses = [
    args.authorityStatus,
    args.trustStatus,
    args.revocationStatus,
    args.policyStatus,
    args.replayStatus,
    args.diagnosticsStatus
  ];

  if (statuses.includes("failed")) {
    return {
      release_safe: false,
      status: "failed",
      severity: "critical",
      recommendation: "Do not treat this report as release evidence until critical failures are resolved.",
      notes: [
        "One or more governance evidence sections failed verification."
      ]
    };
  }

  if (statuses.includes("incomplete")) {
    return {
      release_safe: false,
      status: "incomplete",
      severity: "warning",
      recommendation: "Treat this report as advisory until incomplete evidence sections are implemented or supplied.",
      notes: [
        "Governance report generated from available local evidence.",
        "Some future evidence artifacts are not yet implemented or not supplied."
      ]
    };
  }

  if (statuses.includes("verified_with_warnings")) {
    return {
      release_safe: false,
      status: "verified_with_warnings",
      severity: "warning",
      recommendation: "Review warnings before treating this report as release evidence.",
      notes: [
        "Governance evidence exists but warnings remain."
      ]
    };
  }

  return {
    release_safe: true,
    status: "verified",
    severity: "none",
    recommendation: "Governance evidence passed available local checks.",
    notes: [
      "Governance report generated from available local evidence."
    ]
  };
}

export function buildGovernanceReport(
  createdAt = new Date().toISOString()
): GovernanceReport {
  const authoritySnapshot = buildAuthoritySnapshot(createdAt);
  const authorityVerification = verifyAuthoritySnapshotExport(
    authoritySnapshot,
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

  const authorityStatus: GovernanceReportStatus =
    authorityVerification.summary.admissible ? "verified" : "failed";

  const trustStatus: GovernanceReportStatus =
    authoritySnapshot.trust.signers.length > 0
      ? "verified"
      : "verified_with_warnings";

  const revocationStatus: GovernanceReportStatus =
    authoritySnapshot.revocation.checked ? "verified" : "failed";

  const policyStatus: GovernanceReportStatus =
    policyFailures.length === 0 ? "verified" : "failed";

  const replayStatus: GovernanceReportStatus = "incomplete";

  const diagnosticsStatus: GovernanceReportStatus =
    activeDiagnostics.length > 0 ? "verified" : "incomplete";

  const summary = buildSummary({
    authorityStatus,
    trustStatus,
    revocationStatus,
    policyStatus,
    replayStatus,
    diagnosticsStatus
  });

 const artifactRefs: GovernanceReportArtifactRef[] = [
  {
    kind: "authority_snapshot",
    id: authoritySnapshot.snapshot_id,
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

const artifacts = artifactRefs.sort(compareArtifactRefs);

  return {
    schema_version: "governance-report.v1",
    report_id: createReportId(createdAt),
    created_at: createdAt,
    source: {
      runtime: "pathwarden",
      environment: "local"
    },
    authority: {
      snapshot_id: authoritySnapshot.snapshot_id,
      record_count: authoritySnapshot.authority.record_count,
      status: authorityStatus
    },
    trust: {
      status: trustStatus,
      warnings: trustStatus === "verified_with_warnings"
        ? ["Trust signer details are placeholders pending deeper trust-report integration."]
        : [],
      critical_failures: []
    },
    revocation: {
      checked: authoritySnapshot.revocation.checked,
      status: revocationStatus,
      warnings: [],
      critical_failures: revocationStatus === "failed"
        ? ["Authority snapshot revocation context was not checked."]
        : []
    },
    policy: {
      manifest_id: policyManifest.manifest_id,
      hashes_available: policyManifest.hashing.hashes_available,
      status: policyStatus
    },
    replay: {
      baseline_id: null,
      diff_id: null,
      status: replayStatus
    },
    diagnostics: {
      overall_status: diagnosticsStatus,
      passed: activeDiagnostics.length,
      failed: 0,
      warnings: 0
    },
    summary,
    artifacts
  };
}

export function validateGovernanceReport(
  report: GovernanceReport
): void {
  const validator = getSchemaValidator(
    "schemas/audit/governance-report.schema.json"
  );

  const valid = validator(report);

  if (!valid) {
    throw new Error(
      "Invalid governance report: " +
      formatAjvErrors(validator.errors)
    );
  }
}
