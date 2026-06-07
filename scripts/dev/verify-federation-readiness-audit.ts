import fs from "node:fs";
import path from "node:path";

type VerificationFailure = {
  code: string;
  message: string;
};

type StatusSection = {
  status?: string;
  [key: string]: unknown;
};

type ArtifactRef = {
  kind?: unknown;
  id?: unknown;
  path?: unknown;
  required?: unknown;
  [key: string]: unknown;
};

type FederationReadinessAudit = {
  schema_version?: string;
  audit_id?: string;
  created_at?: string;
  source?: unknown;
  governance?: StatusSection & {
    report_id?: string;
    release_safe?: boolean;
  };
  replay_provenance?: StatusSection & {
    report_id?: string;
    admissible?: boolean;
    lineage_complete?: boolean;
  };
  policy?: StatusSection & {
    manifest_id?: string;
    hashes_available?: boolean;
  };
  diagnostics?: StatusSection & {
    registered?: number;
    blocking?: number;
    ci_compatible?: number;
  };
  federation?: {
    ready?: boolean;
    status?: string;
    warnings?: unknown[];
    critical_failures?: unknown[];
    missing_requirements?: unknown[];
    [key: string]: unknown;
  };
  summary?: {
    status?: string;
    severity?: string;
    ready_for_federation?: boolean;
    recommendation?: string;
    notes?: unknown[];
    [key: string]: unknown;
  };
  artifacts?: ArtifactRef[];
  [key: string]: unknown;
};

const SECRET_KEY_PATTERN =
  /(api[_-]?key|secret|token|password|private[_-]?key|client[_-]?secret|credential)/i;

const FORBIDDEN_RUNTIME_FIELD_PATTERN =
  /(network|endpoint|url|webhook|socket|remote|runtime_delegate|delegated_authority|signing_key|private_key|cross_runtime_session|trust_negotiation)/i;

function readJson(filePath: string): FederationReadinessAudit {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File does not exist: ${absolutePath}`);
  }

  const raw = fs.readFileSync(absolutePath, "utf8");
  return JSON.parse(raw) as FederationReadinessAudit;
}

function hasObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStatusString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasStatusSection(value: unknown): value is StatusSection {
  return hasObject(value) && isStatusString(value.status);
}

function walkForForbiddenKeys(
  value: unknown,
  failures: VerificationFailure[],
  currentPath = "$",
): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      walkForForbiddenKeys(entry, failures, `${currentPath}[${index}]`),
    );
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, nestedValue] of Object.entries(value)) {
      const nextPath = `${currentPath}.${key}`;

      if (SECRET_KEY_PATTERN.test(key)) {
        failures.push({
          code: "SECRET_LIKE_KEY",
          message: `Secret-like key detected at ${nextPath}`,
        });
      }

      if (FORBIDDEN_RUNTIME_FIELD_PATTERN.test(key)) {
        failures.push({
          code: "FEDERATION_RUNTIME_FIELD_PRESENT",
          message: `Forbidden federation runtime-like field detected at ${nextPath}`,
        });
      }

      walkForForbiddenKeys(nestedValue, failures, nextPath);
    }
  }
}

function isIncompleteStatus(status: unknown): boolean {
  return [
    "incomplete",
    "missing",
    "failed",
    "not_ready",
    "not-ready",
    "invalid",
    "unverified",
  ].includes(String(status));
}

function isDeterministicArtifactRef(ref: unknown): boolean {
  if (!hasObject(ref)) return false;

  const kind = ref.kind;
  const id = ref.id;
  const pathValue = ref.path;
  const required = ref.required;

  const hasKind = typeof kind === "string" && kind.trim().length > 0;

  const hasStableId =
    id === null || (typeof id === "string" && id.trim().length > 0);

  const hasStablePath =
    pathValue === null ||
    (typeof pathValue === "string" && pathValue.trim().length > 0);

  const hasRequiredFlag = typeof required === "boolean";

  return hasKind && hasStableId && hasStablePath && hasRequiredFlag;
}

function hasMissingRequirement(
  audit: FederationReadinessAudit,
  expectedText: string,
): boolean {
  const requirements = audit.federation?.missing_requirements;

  if (!Array.isArray(requirements)) return false;

  return requirements.some(
    (entry) => typeof entry === "string" && entry === expectedText,
  );
}

function verifyFederationReadinessAudit(
  audit: FederationReadinessAudit,
): VerificationFailure[] {
  const failures: VerificationFailure[] = [];

  if (audit.schema_version !== "federation-readiness-audit.v1") {
    failures.push({
      code: "INVALID_SCHEMA_VERSION",
      message: "Expected schema_version to equal federation-readiness-audit.v1.",
    });
  }

  if (!isStatusString(audit.audit_id)) {
    failures.push({
      code: "MISSING_AUDIT_ID",
      message: "Audit must include audit_id string.",
    });
  }

  if (!isStatusString(audit.created_at)) {
    failures.push({
      code: "MISSING_CREATED_AT",
      message: "Audit must include created_at string.",
    });
  }

  if (!hasObject(audit.source)) {
    failures.push({
      code: "MISSING_SOURCE",
      message: "Audit must include source metadata.",
    });
  }

  const requiredStatusSections = [
    "governance",
    "replay_provenance",
    "policy",
    "diagnostics",
  ] as const;

  for (const sectionName of requiredStatusSections) {
    if (!hasStatusSection(audit[sectionName])) {
      failures.push({
        code: "MISSING_OR_INVALID_STATUS_SECTION",
        message: `Section ${sectionName} must exist and include status string.`,
      });
    }
  }

  if (!hasObject(audit.federation)) {
    failures.push({
      code: "MISSING_FEDERATION",
      message: "Audit must include federation object.",
    });
  } else {
    if (typeof audit.federation.ready !== "boolean") {
      failures.push({
        code: "MISSING_FEDERATION_READY",
        message: "federation.ready must be boolean.",
      });
    }

    if (!isStatusString(audit.federation.status)) {
      failures.push({
        code: "MISSING_FEDERATION_STATUS",
        message: "federation.status must be string.",
      });
    }

    if (!Array.isArray(audit.federation.warnings)) {
      failures.push({
        code: "MISSING_FEDERATION_WARNINGS",
        message: "federation.warnings must be an array.",
      });
    }

    if (!Array.isArray(audit.federation.critical_failures)) {
      failures.push({
        code: "MISSING_FEDERATION_CRITICAL_FAILURES",
        message: "federation.critical_failures must be an array.",
      });
    }

    if (!Array.isArray(audit.federation.missing_requirements)) {
      failures.push({
        code: "MISSING_FEDERATION_REQUIREMENTS",
        message: "federation.missing_requirements must be an array.",
      });
    }
  }

  if (!hasObject(audit.summary)) {
    failures.push({
      code: "MISSING_SUMMARY",
      message: "Audit must include summary object.",
    });
  } else {
    if (!isStatusString(audit.summary.status)) {
      failures.push({
        code: "MISSING_SUMMARY_STATUS",
        message: "summary.status must be string.",
      });
    }

    if (!isStatusString(audit.summary.severity)) {
      failures.push({
        code: "MISSING_SUMMARY_SEVERITY",
        message: "summary.severity must be string.",
      });
    }

    if (typeof audit.summary.ready_for_federation !== "boolean") {
      failures.push({
        code: "MISSING_READY_FOR_FEDERATION",
        message: "summary.ready_for_federation must be boolean.",
      });
    }
  }

  const governanceIncomplete =
    isIncompleteStatus(audit.governance?.status) ||
    audit.governance?.release_safe === false;

  const replayIncomplete =
    isIncompleteStatus(audit.replay_provenance?.status) ||
    audit.replay_provenance?.admissible === false ||
    audit.replay_provenance?.lineage_complete === false;

  const policyIncomplete = isIncompleteStatus(audit.policy?.status);
  const diagnosticsIncomplete = isIncompleteStatus(audit.diagnostics?.status);

  const anyRequiredEvidenceIncomplete =
    governanceIncomplete ||
    replayIncomplete ||
    policyIncomplete ||
    diagnosticsIncomplete;

  if (governanceIncomplete && audit.federation?.ready === true) {
    failures.push({
      code: "FEDERATION_READY_OVERSTATED",
      message:
        "federation.ready must be false when governance is incomplete or not release-safe.",
    });
  }

  if (replayIncomplete && audit.federation?.ready === true) {
    failures.push({
      code: "FEDERATION_READY_OVERSTATED",
      message:
        "federation.ready must be false when replay provenance is incomplete, inadmissible, or lineage incomplete.",
    });
  }

  if (anyRequiredEvidenceIncomplete && audit.summary?.ready_for_federation === true) {
    failures.push({
      code: "READY_FOR_FEDERATION_OVERSTATED",
      message:
        "summary.ready_for_federation must be false when required evidence is incomplete.",
    });
  }

  if (audit.federation?.ready === false && audit.summary?.ready_for_federation === true) {
    failures.push({
      code: "READY_FOR_FEDERATION_INCONSISTENT",
      message:
        "summary.ready_for_federation cannot be true when federation.ready is false.",
    });
  }

  if (anyRequiredEvidenceIncomplete && audit.summary?.status === "complete") {
    failures.push({
      code: "SUMMARY_STATUS_OVERSTATED",
      message:
        "summary.status cannot be complete when required evidence is incomplete.",
    });
  }

  if (anyRequiredEvidenceIncomplete && audit.summary?.status === "verified") {
    failures.push({
      code: "SUMMARY_STATUS_OVERSTATED",
      message:
        "summary.status cannot be verified when required evidence is incomplete.",
    });
  }

  if (
    audit.governance?.release_safe === false &&
    !hasMissingRequirement(audit, "Governance report is not release-safe.")
  ) {
    failures.push({
      code: "MISSING_REQUIREMENT_NOT_DECLARED",
      message:
        "Governance release_safe is false, so missing_requirements must declare it.",
    });
  }

  if (
    audit.replay_provenance?.admissible === false &&
    !hasMissingRequirement(audit, "Replay provenance report is not admissible.")
  ) {
    failures.push({
      code: "MISSING_REQUIREMENT_NOT_DECLARED",
      message:
        "Replay provenance admissible is false, so missing_requirements must declare it.",
    });
  }

  if (
    audit.replay_provenance?.lineage_complete === false &&
    !hasMissingRequirement(audit, "Replay provenance lineage is incomplete.")
  ) {
    failures.push({
      code: "MISSING_REQUIREMENT_NOT_DECLARED",
      message:
        "Replay lineage_complete is false, so missing_requirements must declare it.",
    });
  }

  if (Array.isArray(audit.federation?.warnings)) {
    const warnings = audit.federation.warnings.filter(
      (entry): entry is string => typeof entry === "string",
    );

    if (
      !warnings.includes("Federation runtime behavior is intentionally not implemented.")
    ) {
      failures.push({
        code: "MISSING_RUNTIME_NON_IMPLEMENTATION_WARNING",
        message:
          "federation.warnings must declare that federation runtime behavior is intentionally not implemented.",
      });
    }

    if (
      !warnings.includes(
        "Cross-runtime trust negotiation is intentionally not implemented.",
      )
    ) {
      failures.push({
        code: "MISSING_TRUST_NEGOTIATION_WARNING",
        message:
          "federation.warnings must declare that cross-runtime trust negotiation is intentionally not implemented.",
      });
    }
  }

  if (!Array.isArray(audit.artifacts)) {
    failures.push({
      code: "MISSING_ARTIFACTS",
      message: "artifacts must be an array.",
    });
  } else {
    audit.artifacts.forEach((artifact, index) => {
      if (!isDeterministicArtifactRef(artifact)) {
        failures.push({
          code: "NON_DETERMINISTIC_ARTIFACT_REF",
          message:
            `Artifact at index ${index} must include stable kind, id/null id, path/null path, and required boolean.`,
        });
      }
    });

    const artifactKinds = audit.artifacts
      .map((artifact) => artifact.kind)
      .filter((kind): kind is string => typeof kind === "string");

    for (const requiredKind of [
      "diagnostic_metadata_registry",
      "governance_report",
      "policy_manifest",
      "replay_provenance_report",
    ]) {
      if (!artifactKinds.includes(requiredKind)) {
        failures.push({
          code: "MISSING_REQUIRED_ARTIFACT_KIND",
          message: `artifacts must include ${requiredKind}.`,
        });
      }
    }
  }

  walkForForbiddenKeys(audit, failures);

  return failures;
}

function main(): void {
  const [, , auditPath] = process.argv;

  if (!auditPath) {
    console.error(
      "Usage: npm run verify:federation-readiness-audit -- <federation_readiness_audit_json>",
    );
    process.exit(1);
  }

  try {
    const audit = readJson(auditPath);
    const failures = verifyFederationReadinessAudit(audit);

    if (failures.length > 0) {
      console.error("Federation readiness audit verification failed:");
      for (const failure of failures) {
        console.error(`- ${failure.code}: ${failure.message}`);
      }
      process.exit(1);
    }

    console.log("Federation readiness audit verification passed.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Federation readiness audit verification error: ${message}`);
    process.exit(1);
  }
}

main();