import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, resolve, relative } from "node:path";

type ReportStatus =
  | "verified"
  | "verified_with_warnings"
  | "incomplete"
  | "failed"
  | "not_checked";

interface LatestGovernanceReportRef {
  path: string | null;
  id: string | null;
  created_at: string | null;
  status: ReportStatus | null;
  release_safe: boolean | null;
}

interface LatestReplayProvenanceReportRef {
  path: string | null;
  id: string | null;
  created_at: string | null;
  status: ReportStatus | null;
  admissible: boolean | null;
  lineage_complete: boolean | null;
}

interface LatestFederationReadinessAuditRef {
  path: string | null;
  id: string | null;
  created_at: string | null;
  status: ReportStatus | null;
  ready_for_federation: boolean | null;
}

interface LatestReportIndex {
  schema_version: "latest-report-index.v1";
  index_id: string;
  created_at: string;
  source: {
    runtime: "pathwarden";
    environment: string;
  };
  reports: {
    governance: LatestGovernanceReportRef;
    replay_provenance: LatestReplayProvenanceReportRef;
    federation_readiness: LatestFederationReadinessAuditRef;
  };
}

function createIndexId(createdAt: string): string {
  const safeTimestamp = createdAt
    .replace(/[^0-9A-Za-z]/g, "")
    .slice(0, 20);

  return `reportindex_${safeTimestamp}`;
}

function toRepoRelativePath(path: string): string {
  return relative(process.cwd(), path).replace(/\\/g, "/");
}

function latestJsonFile(directory: string): string | null {
  const absoluteDir = resolve(process.cwd(), directory);

  if (!existsSync(absoluteDir)) {
    return null;
  }

  const files = readdirSync(absoluteDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => resolve(absoluteDir, file))
    .sort((left, right) => {
      const leftStat = statSync(left);
      const rightStat = statSync(right);

      return (
        rightStat.mtimeMs - leftStat.mtimeMs ||
        basename(right).localeCompare(basename(left))
      );
    });

  return files[0] ?? null;
}

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function readNestedObject(
  value: Record<string, unknown>,
  key: string
): Record<string, unknown> {
  const nested = value[key];

  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }

  return {};
}

function readString(
  value: Record<string, unknown>,
  key: string
): string | null {
  return typeof value[key] === "string" ? value[key] : null;
}

function readBoolean(
  value: Record<string, unknown>,
  key: string
): boolean | null {
  return typeof value[key] === "boolean" ? value[key] : null;
}

function readGovernanceReport(): LatestGovernanceReportRef {
  const latest = latestJsonFile("exports/governance");

  if (!latest) {
    return {
      path: null,
      id: null,
      created_at: null,
      status: null,
      release_safe: null
    };
  }

  const report = readJson(latest);
  const summary = readNestedObject(report, "summary");

  return {
    path: toRepoRelativePath(latest),
    id: readString(report, "report_id"),
    created_at: readString(report, "created_at"),
    status: readString(summary, "status") as ReportStatus | null,
    release_safe: readBoolean(summary, "release_safe")
  };
}

function readReplayProvenanceReport(): LatestReplayProvenanceReportRef {
  const latest = latestJsonFile("exports/replay");

  if (!latest) {
    return {
      path: null,
      id: null,
      created_at: null,
      status: null,
      admissible: null,
      lineage_complete: null
    };
  }

  const report = readJson(latest);
  const summary = readNestedObject(report, "summary");
  const lineage = readNestedObject(report, "lineage");

  return {
    path: toRepoRelativePath(latest),
    id: readString(report, "report_id"),
    created_at: readString(report, "created_at"),
    status: readString(summary, "status") as ReportStatus | null,
    admissible: readBoolean(summary, "admissible"),
    lineage_complete: readBoolean(lineage, "complete")
  };
}

function readFederationReadinessAudit(): LatestFederationReadinessAuditRef {
  const latest = latestJsonFile("exports/federation");

  if (!latest) {
    return {
      path: null,
      id: null,
      created_at: null,
      status: null,
      ready_for_federation: null
    };
  }

  const audit = readJson(latest);
  const summary = readNestedObject(audit, "summary");

  return {
    path: toRepoRelativePath(latest),
    id: readString(audit, "audit_id"),
    created_at: readString(audit, "created_at"),
    status: readString(summary, "status") as ReportStatus | null,
    ready_for_federation: readBoolean(summary, "ready_for_federation")
  };
}

const createdAt = new Date().toISOString();

const index: LatestReportIndex = {
  schema_version: "latest-report-index.v1",
  index_id: createIndexId(createdAt),
  created_at: createdAt,
  source: {
    runtime: "pathwarden",
    environment: "local"
  },
  reports: {
    governance: readGovernanceReport(),
    replay_provenance: readReplayProvenanceReport(),
    federation_readiness: readFederationReadinessAudit()
  }
};

const exportDir = resolve(
  process.cwd(),
  "exports",
  "report-index"
);

mkdirSync(exportDir, { recursive: true });

const exportPath = resolve(
  exportDir,
  "latest-report-index.json"
);

writeFileSync(
  exportPath,
  JSON.stringify(index, null, 2),
  "utf8"
);

console.log(`Latest report index written to: ${exportPath}`);
console.log(`Index id: ${index.index_id}`);
console.log(`Governance report: ${index.reports.governance.path ?? "missing"}`);
console.log(`Replay provenance report: ${index.reports.replay_provenance.path ?? "missing"}`);
console.log(`Federation readiness audit: ${index.reports.federation_readiness.path ?? "missing"}`);
