import fs from "node:fs";
import path from "node:path";

type VerificationFailure = {
  code: string;
  message: string;
};

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

const SECRET_KEY_PATTERN =
  /(api[_-]?key|secret|token|password|private[_-]?key|client[_-]?secret|credential)/i;

function readJson(filePath: string): GovernanceReport {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File does not exist: ${absolutePath}`);
  }

  const raw = fs.readFileSync(absolutePath, "utf8");
  return JSON.parse(raw) as GovernanceReport;
}

function walkForSecretLikeKeys(
  value: unknown,
  failures: VerificationFailure[],
  currentPath = "$",
): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      walkForSecretLikeKeys(entry, failures, `${currentPath}[${index}]`),
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

      walkForSecretLikeKeys(nestedValue, failures, nextPath);
    }
  }
}

function hasObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

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
  if (!hasObject(ref)) return false;

  const id = ref.id;
  const pathValue = ref.path;
  const required = ref.required;

  const hasStableId = typeof id === "string" && id.trim().length > 0;

  const hasStablePath =
    pathValue === null ||
    (typeof pathValue === "string" && pathValue.trim().length > 0);

  const hasRequiredFlag = typeof required === "boolean";

  return hasStableId && hasStablePath && hasRequiredFlag;
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
    const report = readJson(reportPath);
    const failures = verifyGovernanceReport(report);

    if (failures.length > 0) {
      console.error("Governance report verification failed:");
      for (const failure of failures) {
        console.error(`- ${failure.code}: ${failure.message}`);
      }
      process.exit(1);
    }

    console.log("Governance report verification passed.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Governance report verification error: ${message}`);
    process.exit(1);
  }
}

main();
