import {
  hasObject,
  isDeterministicArtifactRef as isSharedDeterministicArtifactRef,
  isIncompleteStatus,
  readJsonFile,
  type VerificationFailure,
  walkForSecretLikeKeys,
  printVerificationFailuresAndExit
} from "./lib/reportVerifierUtils";

type StatusLike = {
  status?: string;
  [key: string]: unknown;
};

type GovernanceReport = {
  schema_version?: string;
  report_id?: string;
  created_at?: string;
  source?: unknown;
  authority?: StatusLike;
  trust?: StatusLike;
  revocation?: StatusLike;
  policy?: StatusLike;
  replay?: StatusLike;
  diagnostics?: StatusLike;
  summary?: {
    release_safe?: boolean;
    status?: string;
    severity?: string;
    recommendation?: string;
    notes?: unknown[];
    [key: string]: unknown;
  };
  artifacts?: unknown;
  [key: string]: unknown;
};



function getSectionStatus(sectionName: string, value: unknown): string | undefined {
  if (!hasObject(value)) return undefined;

  if (typeof value.status === "string") {
    return value.status;
  }

  if (
    sectionName === "diagnostics" &&
    typeof value.overall_status === "string"
  ) {
    return value.overall_status;
  }

  return undefined;
}

function collectArtifactRefs(artifacts: unknown): unknown[] {
  if (!artifacts) return [];

  if (Array.isArray(artifacts)) return artifacts;

  if (hasObject(artifacts)) {
    const possibleKeys = ["refs", "artifact_refs", "items", "files"];

    for (const key of possibleKeys) {
      const value = artifacts[key];
      if (Array.isArray(value)) return value;
    }

    return Object.values(artifacts);
  }

  return [];
}

function isDeterministicArtifactRef(ref: unknown): boolean {
  return isSharedDeterministicArtifactRef(ref, {
    requireKind: false,
    allowNullId: false
  });
}

function verifyGovernanceReport(report: GovernanceReport): VerificationFailure[] {
  const failures: VerificationFailure[] = [];

  if (!report.schema_version || typeof report.schema_version !== "string") {
    failures.push({
      code: "MISSING_SCHEMA_VERSION",
      message: "Report must include schema_version string.",
    });
  }

  if (!report.report_id || typeof report.report_id !== "string") {
    failures.push({
      code: "MISSING_REPORT_ID",
      message: "Report must include report_id string.",
    });
  }

  if (!report.created_at || typeof report.created_at !== "string") {
    failures.push({
      code: "MISSING_CREATED_AT",
      message: "Report must include created_at string.",
    });
  }

  if (!report.source) {
    failures.push({
      code: "MISSING_SOURCE",
      message: "Report must include source evidence metadata.",
    });
  }

  if (!hasObject(report.summary)) {
    failures.push({
      code: "MISSING_SUMMARY",
      message: "Report must include summary object.",
    });
  } else {
    if (typeof report.summary.release_safe !== "boolean") {
      failures.push({
        code: "MISSING_RELEASE_SAFE",
        message: "summary.release_safe must be boolean.",
      });
    }

    if (typeof report.summary.status !== "string") {
      failures.push({
        code: "MISSING_SUMMARY_STATUS",
        message: "summary.status must be string.",
      });
    }

    if (typeof report.summary.severity !== "string") {
      failures.push({
        code: "MISSING_SUMMARY_SEVERITY",
        message: "summary.severity must be string.",
      });
    }
  }

  const requiredEvidenceSections = [
    "authority",
    "trust",
    "revocation",
    "policy",
    "replay",
    "diagnostics",
  ] as const;

  const sectionStatuses: string[] = [];

  for (const sectionName of requiredEvidenceSections) {
    const section = report[sectionName];
    const status = getSectionStatus(sectionName, section);

    if (!status) {
      failures.push({
        code: "MISSING_OR_INVALID_EVIDENCE_SECTION",
        message:
          sectionName === "diagnostics"
            ? "Section diagnostics must exist and include overall_status string."
            : `Section ${sectionName} must exist and include status string.`,
      });

      continue;
    }

    sectionStatuses.push(status);
  }

  const hasIncompleteSection = sectionStatuses.some(isIncompleteStatus);

  if (hasIncompleteSection && report.summary?.status === "verified") {
    failures.push({
      code: "SUMMARY_STATUS_OVERSTATED",
      message:
        "summary.status cannot be verified when one or more evidence sections are incomplete, missing, failed, invalid, or not_ready.",
    });
  }

  if (hasIncompleteSection && report.summary?.status === "complete") {
    failures.push({
      code: "SUMMARY_STATUS_OVERSTATED",
      message:
        "summary.status cannot be complete when one or more evidence sections are incomplete, missing, failed, invalid, or not_ready.",
    });
  }

  if (isIncompleteStatus(report.replay?.status) && report.summary?.release_safe === true) {
    failures.push({
      code: "RELEASE_SAFE_OVERSTATED",
      message:
        "summary.release_safe must be false when replay evidence is incomplete, missing, failed, invalid, or not_ready.",
    });
  }

  if (hasIncompleteSection && report.summary?.release_safe === true) {
    failures.push({
      code: "RELEASE_SAFE_OVERSTATED",
      message:
        "summary.release_safe must be false when any required evidence section is incomplete, missing, failed, invalid, or not_ready.",
    });
  }

  if (!report.artifacts) {
    failures.push({
      code: "MISSING_ARTIFACTS",
      message: "Report must include artifacts.",
    });
  } else {
    const artifactRefs = collectArtifactRefs(report.artifacts);

    if (artifactRefs.length === 0) {
      failures.push({
        code: "MISSING_ARTIFACT_REFS",
        message: "Governance report artifacts must include deterministic artifact refs.",
      });
    }

    artifactRefs.forEach((ref, index) => {
      if (!isDeterministicArtifactRef(ref)) {
        failures.push({
          code: "NON_DETERMINISTIC_ARTIFACT_REF",
          message:
            `Artifact ref at index ${index} must include stable id, path/null path, and required boolean.`,
        });
      }
    });
  }

  walkForSecretLikeKeys(report, failures);

  return failures;
}

function main(): void {
  const [, , reportPath] = process.argv;

  if (!reportPath) {
    console.error(
      "Usage: npm run verify:governance-report -- <governance_report_json>",
    );
    process.exit(1);
  }

  try {
    const report = readJsonFile<GovernanceReport>(reportPath);
    const failures = verifyGovernanceReport(report);

    if (failures.length > 0) {
      printVerificationFailuresAndExit(
        "Governance report verification failed:",
        failures
      );
    }

    console.log("Governance report verification passed.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Governance report verification error: ${message}`);
    process.exit(1);
  }
}

main();
