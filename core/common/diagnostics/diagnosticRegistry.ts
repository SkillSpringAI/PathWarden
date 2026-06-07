import type { DiagnosticMetadata } from "./diagnosticMetadata";
import {
  NO_DIAGNOSTIC_REQUIREMENTS,
  validateDiagnosticMetadataShape
} from "./diagnosticMetadata";

function withFilesystemRequirements(
  overrides: Partial<DiagnosticMetadata["requires"]> = {}
): DiagnosticMetadata["requires"] {
  return {
    ...NO_DIAGNOSTIC_REQUIREMENTS,
    filesystem: true,
    ...overrides
  };
}

export const DIAGNOSTIC_METADATA_REGISTRY: DiagnosticMetadata[] = [
  {
    id: "diag.kernel.hardening",
    name: "Kernel Hardening Diagnostic",
    description: "Validates core kernel refusal and safety behavior.",
    category: "governance",
    subsystem: "kernel",
    severity: "critical",
    blocking: true,
    ci_compatible: true,
    requires: withFilesystemRequirements(),
    dependencies: [],
    tags: ["kernel", "governance", "safety"],
    status: "active"
  },
  {
    id: "diag.authority.persistence",
    name: "Authority Persistence Diagnostic",
    description: "Validates authority evidence persistence behavior.",
    category: "authority",
    subsystem: "audit",
    severity: "critical",
    blocking: true,
    ci_compatible: true,
    requires: withFilesystemRequirements({
      authority_records: true
    }),
    dependencies: [],
    tags: ["authority", "audit", "persistence"],
    status: "active"
  },
  {
    id: "diag.authority.replay",
    name: "Authority Replay Diagnostic",
    description: "Validates authority replay reconstruction behavior.",
    category: "authority",
    subsystem: "replay",
    severity: "critical",
    blocking: true,
    ci_compatible: true,
    requires: withFilesystemRequirements({
      authority_records: true,
      replay_artifacts: true
    }),
    dependencies: ["diag.authority.persistence"],
    tags: ["authority", "replay", "governance"],
    status: "active"
  },
  {
    id: "diag.replay.execution",
    name: "Execution Replay Diagnostic",
    description: "Validates execution replay reconstruction and replay evidence behavior.",
    category: "replay",
    subsystem: "replay",
    severity: "critical",
    blocking: true,
    ci_compatible: true,
    requires: withFilesystemRequirements({
      authority_records: true,
      execution_records: true,
      replay_artifacts: true
    }),
    dependencies: ["diag.authority.replay"],
    tags: ["execution", "replay", "audit"],
    status: "active"
  },
  {
    id: "diag.trust.governance",
    name: "Governance Trust Diagnostic",
    description: "Validates governance trust manifest and signer lifecycle behavior.",
    category: "trust",
    subsystem: "trust",
    severity: "critical",
    blocking: true,
    ci_compatible: true,
    requires: withFilesystemRequirements({
      trust_manifest: true
    }),
    dependencies: [],
    tags: ["trust", "signer", "governance"],
    status: "active"
  },
  {
    id: "diag.exports.authority",
    name: "Authority Export Verification Diagnostic",
    description: "Validates authority snapshot export verification behavior.",
    category: "exports",
    subsystem: "audit",
    severity: "critical",
    blocking: true,
    ci_compatible: true,
    requires: withFilesystemRequirements({
      authority_records: true
    }),
    dependencies: ["diag.authority.replay"],
    tags: ["authority", "export", "verification"],
    status: "active"
  },
  {
    id: "diag.policy.hashes",
    name: "Policy Hash Verification Diagnostic",
    description: "Validates policy hash verification behavior for policy manifests.",
    category: "policy",
    subsystem: "policy",
    severity: "critical",
    blocking: true,
    ci_compatible: true,
    requires: withFilesystemRequirements({
      policy_manifest: true,
      policy_hashes: true
    }),
    dependencies: [],
    tags: ["policy", "hashing", "verification"],
    status: "active"
  },
  {
    id: "diag.governance.report_verification",
    name: "Governance Report Verification Diagnostic",
    description: "Registers governance report verification metadata without wiring it into diagnostic execution.",
    category: "exports",
    subsystem: "audit",
    severity: "warning",
    blocking: false,
    ci_compatible: true,
    requires: withFilesystemRequirements(),
    dependencies: ["diag.exports.authority", "diag.policy.hashes"],
    tags: ["governance", "reporting", "verification"],
    status: "planned"
  },
  {
    id: "diag.replay.provenance_verification",
    name: "Replay Provenance Verification Diagnostic",
    description: "Registers replay provenance report verification metadata without wiring it into diagnostic execution.",
    category: "replay",
    subsystem: "replay",
    severity: "warning",
    blocking: false,
    ci_compatible: true,
    requires: withFilesystemRequirements({
      replay_artifacts: true
    }),
    dependencies: ["diag.replay.execution", "diag.policy.hashes"],
    tags: ["replay", "provenance", "verification"],
    status: "planned"
  },
  {
    id: "diag.federation.readiness_verification",
    name: "Federation Readiness Verification Diagnostic",
    description: "Registers federation readiness audit verification metadata without introducing federation runtime behavior.",
    category: "federation",
    subsystem: "federation",
    severity: "warning",
    blocking: false,
    ci_compatible: true,
    requires: withFilesystemRequirements(),
    dependencies: [
      "diag.governance.report_verification",
      "diag.replay.provenance_verification",
      "diag.policy.hashes"
    ],
    tags: ["federation", "readiness", "verification"],
    status: "planned"
  },
  {
    id: "diag.governance.report_verifier_fixtures",
    name: "Governance Report Verifier Fixture Diagnostic",
    description: "Registers governance report verifier fixture coverage without wiring it into diagnostic execution.",
    category: "diagnostics",
    subsystem: "diagnostics",
    severity: "info",
    blocking: false,
    ci_compatible: true,
    requires: withFilesystemRequirements(),
    dependencies: ["diag.governance.report_verification"],
    tags: ["governance", "reporting", "fixtures", "verification"],
    status: "planned"
  },
  {
    id: "diag.replay.provenance_verifier_fixtures",
    name: "Replay Provenance Verifier Fixture Diagnostic",
    description: "Registers replay provenance verifier fixture coverage without wiring it into diagnostic execution.",
    category: "diagnostics",
    subsystem: "diagnostics",
    severity: "info",
    blocking: false,
    ci_compatible: true,
    requires: withFilesystemRequirements({
      replay_artifacts: true
    }),
    dependencies: ["diag.replay.provenance_verification"],
    tags: ["replay", "provenance", "fixtures", "verification"],
    status: "planned"
  },
  {
    id: "diag.federation.readiness_verifier_fixtures",
    name: "Federation Readiness Verifier Fixture Diagnostic",
    description: "Registers federation readiness verifier fixture coverage without wiring it into diagnostic execution.",
    category: "diagnostics",
    subsystem: "diagnostics",
    severity: "info",
    blocking: false,
    ci_compatible: true,
    requires: withFilesystemRequirements(),
    dependencies: ["diag.federation.readiness_verification"],
    tags: ["federation", "readiness", "fixtures", "verification"],
    status: "planned"
  },
  {
    id: "diag.reporting.input_fixture_verification",
    name: "Report Input Fixture Verification Diagnostic",
    description: "Registers report input support fixture coverage without wiring it into diagnostic execution.",
    category: "diagnostics",
    subsystem: "diagnostics",
    severity: "info",
    blocking: false,
    ci_compatible: true,
    requires: withFilesystemRequirements({
      replay_artifacts: true
    }),
    dependencies: [
      "diag.governance.report_verifier_fixtures",
      "diag.federation.readiness_verifier_fixtures"
    ],
    tags: ["reporting", "inputs", "fixtures", "verification"],
    status: "planned"
  },
];

export function getDiagnosticMetadataRegistry(): DiagnosticMetadata[] {
  return [...DIAGNOSTIC_METADATA_REGISTRY];
}

export function validateDiagnosticMetadataRegistry(): void {
  const seen = new Set<string>();

  for (const metadata of DIAGNOSTIC_METADATA_REGISTRY) {
    validateDiagnosticMetadataShape(metadata);

    if (seen.has(metadata.id)) {
      throw new Error(`Duplicate diagnostic metadata id: ${metadata.id}`);
    }

    seen.add(metadata.id);
  }

  for (const metadata of DIAGNOSTIC_METADATA_REGISTRY) {
    for (const dependency of metadata.dependencies) {
      if (!seen.has(dependency)) {
        throw new Error(
          `Diagnostic metadata dependency not found: ${metadata.id} -> ${dependency}`
        );
      }
    }
  }
}
