import {
  hasObject,
  isDeterministicArtifactRef as isSharedDeterministicArtifactRef,
  isIncompleteStatus,
  isStatusString,
  readJsonFile,
  type VerificationFailure,
  walkForSecretLikeKeys,
  printVerificationFailuresAndExit
} from "./lib/reportVerifierUtils";

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

type LineageGap = {
  kind?: unknown;
  severity?: unknown;
  message?: unknown;
  [key: string]: unknown;
};

type ReplayProvenanceReport = {
  schema_version?: string;
  report_id?: string;
  created_at?: string;
  source?: unknown;
  authority?: StatusSection;
  replay?: {
    baseline_id?: string | null;
    diff_id?: string | null;
    execution_replay_refs?: unknown[];
    status?: string;
    [key: string]: unknown;
  };
  trust?: StatusSection;
  revocation?: StatusSection & {
    checked?: boolean;
  };
  policy?: StatusSection & {
    hashes_available?: boolean;
  };
  lineage?: {
    complete?: boolean;
    explainable?: boolean;
    gaps?: LineageGap[];
    notes?: unknown[];
    [key: string]: unknown;
  };
  summary?: {
    status?: string;
    severity?: string;
    admissible?: boolean;
    recommendation?: string;
    notes?: unknown[];
    [key: string]: unknown;
  };
  artifacts?: ArtifactRef[];
  [key: string]: unknown;
};



function hasStatusSection(value: unknown): value is StatusSection {
  return hasObject(value) && isStatusString(value.status);
}

function isDeterministicArtifactRef(ref: unknown): boolean {
  return isSharedDeterministicArtifactRef(ref, {
    requireKind: true,
    allowNullId: true
  });
}

function isDeterministicLineageGap(gap: unknown): boolean {
  if (!hasObject(gap)) return false;

  return (
    typeof gap.kind === "string" &&
    gap.kind.trim().length > 0 &&
    typeof gap.severity === "string" &&
    gap.severity.trim().length > 0 &&
    typeof gap.message === "string" &&
    gap.message.trim().length > 0
  );
}

function verifyReplayProvenanceReport(
  report: ReplayProvenanceReport,
): VerificationFailure[] {
  const failures: VerificationFailure[] = [];

  if (report.schema_version !== "replay-provenance-report.v1") {
    failures.push({
      code: "INVALID_SCHEMA_VERSION",
      message: "Expected schema_version to equal replay-provenance-report.v1.",
    });
  }

  if (!isStatusString(report.report_id)) {
    failures.push({
      code: "MISSING_REPORT_ID",
      message: "Report must include report_id string.",
    });
  }

  if (!isStatusString(report.created_at)) {
    failures.push({
      code: "MISSING_CREATED_AT",
      message: "Report must include created_at string.",
    });
  }

  if (!hasObject(report.source)) {
    failures.push({
      code: "MISSING_SOURCE",
      message: "Report must include source metadata.",
    });
  }

  const requiredStatusSections = [
    "authority",
    "replay",
    "trust",
    "revocation",
    "policy",
  ] as const;

  for (const sectionName of requiredStatusSections) {
    if (!hasStatusSection(report[sectionName])) {
      failures.push({
        code: "MISSING_OR_INVALID_STATUS_SECTION",
        message: `Section ${sectionName} must exist and include status string.`,
      });
    }
  }

  if (!hasObject(report.lineage)) {
    failures.push({
      code: "MISSING_LINEAGE",
      message: "Report must include lineage object.",
    });
  } else {
    if (typeof report.lineage.complete !== "boolean") {
      failures.push({
        code: "MISSING_LINEAGE_COMPLETE",
        message: "lineage.complete must be boolean.",
      });
    }

    if (typeof report.lineage.explainable !== "boolean") {
      failures.push({
        code: "MISSING_LINEAGE_EXPLAINABLE",
        message: "lineage.explainable must be boolean.",
      });
    }

    if (!Array.isArray(report.lineage.gaps)) {
      failures.push({
        code: "MISSING_LINEAGE_GAPS",
        message: "lineage.gaps must be an array.",
      });
    } else {
      report.lineage.gaps.forEach((gap, index) => {
        if (!isDeterministicLineageGap(gap)) {
          failures.push({
            code: "NON_DETERMINISTIC_LINEAGE_GAP",
            message:
              `Lineage gap at index ${index} must include stable kind, severity, and message strings.`,
          });
        }
      });
    }
  }

  if (!hasObject(report.summary)) {
    failures.push({
      code: "MISSING_SUMMARY",
      message: "Report must include summary object.",
    });
  } else {
    if (!isStatusString(report.summary.status)) {
      failures.push({
        code: "MISSING_SUMMARY_STATUS",
        message: "summary.status must be string.",
      });
    }

    if (!isStatusString(report.summary.severity)) {
      failures.push({
        code: "MISSING_SUMMARY_SEVERITY",
        message: "summary.severity must be string.",
      });
    }

    if (typeof report.summary.admissible !== "boolean") {
      failures.push({
        code: "MISSING_SUMMARY_ADMISSIBLE",
        message: "summary.admissible must be boolean.",
      });
    }
  }

  const baselineMissing = report.replay?.baseline_id === null;
  const diffMissing = report.replay?.diff_id === null;
  const requiredReplayArtifactMissing = baselineMissing || diffMissing;

  const lineageGaps = Array.isArray(report.lineage?.gaps)
    ? report.lineage.gaps
    : [];

  const gapKinds = lineageGaps
    .map((gap) => gap.kind)
    .filter((kind): kind is string => typeof kind === "string");

  if (baselineMissing && !gapKinds.includes("missing_replay_baseline")) {
    failures.push({
      code: "MISSING_BASELINE_GAP_NOT_DECLARED",
      message:
        "baseline_id is null, so lineage.gaps must include missing_replay_baseline.",
    });
  }

  if (diffMissing && !gapKinds.includes("missing_replay_diff")) {
    failures.push({
      code: "MISSING_DIFF_GAP_NOT_DECLARED",
      message:
        "diff_id is null, so lineage.gaps must include missing_replay_diff.",
    });
  }

  if (requiredReplayArtifactMissing && report.lineage?.complete === true) {
    failures.push({
      code: "LINEAGE_COMPLETE_OVERSTATED",
      message:
        "lineage.complete must be false when baseline_id or diff_id is missing.",
    });
  }

  if (requiredReplayArtifactMissing && report.lineage?.explainable === true) {
    failures.push({
      code: "LINEAGE_EXPLAINABLE_OVERSTATED",
      message:
        "lineage.explainable must be false when baseline_id or diff_id is missing.",
    });
  }

  if (report.lineage?.complete === false && report.summary?.admissible === true) {
    failures.push({
      code: "ADMISSIBLE_OVERSTATED",
      message: "summary.admissible must be false when lineage.complete is false.",
    });
  }

  if (isIncompleteStatus(report.replay?.status) && report.summary?.admissible === true) {
    failures.push({
      code: "ADMISSIBLE_OVERSTATED",
      message: "summary.admissible must be false when replay status is incomplete.",
    });
  }

  const sectionStatuses = requiredStatusSections
    .map((sectionName) => report[sectionName]?.status)
    .filter(Boolean);

  const hasIncompleteSection = sectionStatuses.some(isIncompleteStatus);

  if (hasIncompleteSection && report.summary?.status === "complete") {
    failures.push({
      code: "SUMMARY_STATUS_OVERSTATED",
      message:
        "summary.status cannot be complete when a required evidence section is incomplete.",
    });
  }

  if (hasIncompleteSection && report.summary?.status === "verified") {
    failures.push({
      code: "SUMMARY_STATUS_OVERSTATED",
      message:
        "summary.status cannot be verified when a required evidence section is incomplete.",
    });
  }

  if (!Array.isArray(report.artifacts)) {
    failures.push({
      code: "MISSING_ARTIFACTS",
      message: "artifacts must be an array.",
    });
  } else {
    report.artifacts.forEach((artifact, index) => {
      if (!isDeterministicArtifactRef(artifact)) {
        failures.push({
          code: "NON_DETERMINISTIC_ARTIFACT_REF",
          message:
            `Artifact at index ${index} must include stable kind, id/null id, path/null path, and required boolean.`,
        });
      }
    });

    const artifactKinds = report.artifacts
      .map((artifact) => artifact.kind)
      .filter((kind): kind is string => typeof kind === "string");

    for (const requiredKind of [
      "authority_snapshot",
      "policy_manifest",
      "replay_baseline",
      "replay_diff",
    ]) {
      if (!artifactKinds.includes(requiredKind)) {
        failures.push({
          code: "MISSING_REQUIRED_ARTIFACT_KIND",
          message: `artifacts must include ${requiredKind}.`,
        });
      }
    }
  }

  walkForSecretLikeKeys(report, failures);

  return failures;
}

function main(): void {
  const [, , reportPath] = process.argv;

  if (!reportPath) {
    console.error(
      "Usage: npm run verify:replay-provenance-report -- <replay_provenance_report_json>",
    );
    process.exit(1);
  }

  try {
    const report = readJsonFile<ReplayProvenanceReport>(reportPath);
    const failures = verifyReplayProvenanceReport(report);

    if (failures.length > 0) {
      printVerificationFailuresAndExit(
        "Replay provenance report verification failed:",
        failures
      );
    }

    console.log("Replay provenance report verification passed.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Replay provenance report verification error: ${message}`);
    process.exit(1);
  }
}

main();