export type DiagnosticMetadataCategory =
  | "governance"
  | "authority"
  | "trust"
  | "replay"
  | "policy"
  | "diagnostics"
  | "tasks"
  | "exports"
  | "federation";

export type DiagnosticMetadataSubsystem =
  | "kernel"
  | "audit"
  | "trust"
  | "replay"
  | "policy"
  | "diagnostics"
  | "executor"
  | "tasks"
  | "federation";

export type DiagnosticMetadataSeverity =
  | "info"
  | "warning"
  | "critical";

export type DiagnosticMetadataStatus =
  | "active"
  | "planned"
  | "deprecated"
  | "disabled";

export interface DiagnosticMetadataRequirements {
  filesystem: boolean;
  authority_records: boolean;
  trust_manifest: boolean;
  replay_artifacts: boolean;
  policy_manifest: boolean;
  policy_hashes: boolean;
  execution_records: boolean;
  network: boolean;
  manual_approval: boolean;
}

export interface DiagnosticMetadata {
  id: string;
  name: string;
  description: string;
  category: DiagnosticMetadataCategory;
  subsystem: DiagnosticMetadataSubsystem;
  severity: DiagnosticMetadataSeverity;
  blocking: boolean;
  ci_compatible: boolean;
  requires: DiagnosticMetadataRequirements;
  dependencies: string[];
  tags: string[];
  status: DiagnosticMetadataStatus;
}

export const NO_DIAGNOSTIC_REQUIREMENTS: DiagnosticMetadataRequirements = {
  filesystem: false,
  authority_records: false,
  trust_manifest: false,
  replay_artifacts: false,
  policy_manifest: false,
  policy_hashes: false,
  execution_records: false,
  network: false,
  manual_approval: false
};

export function validateDiagnosticMetadataShape(
  metadata: DiagnosticMetadata
): void {
  if (!metadata.id.startsWith("diag.")) {
    throw new Error(`Invalid diagnostic metadata id: ${metadata.id}`);
  }

  if (metadata.dependencies.includes(metadata.id)) {
    throw new Error(
      `Diagnostic metadata cannot depend on itself: ${metadata.id}`
    );
  }
}
