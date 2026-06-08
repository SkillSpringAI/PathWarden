import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type ReportStatus =
  | "verified"
  | "verified_with_warnings"
  | "incomplete"
  | "failed"
  | "not_checked";

interface LatestReportRef {
  path: string | null;
  id: string | null;
  created_at: string | null;
  status: ReportStatus | null;
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
    governance: LatestReportRef & {
      release_safe: boolean | null;
    };
    replay_provenance: LatestReportRef & {
      admissible: boolean | null;
      lineage_complete: boolean | null;
    };
    federation_readiness: LatestReportRef & {
      ready_for_federation: boolean | null;
    };
  };
}

const indexPathArg =
  process.argv[2] ?? "exports/report-index/latest-report-index.json";

const indexPath = resolve(process.cwd(), indexPathArg);

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStatus(value: unknown): value is ReportStatus {
  return (
    value === "verified" ||
    value === "verified_with_warnings" ||
    value === "incomplete" ||
    value === "failed" ||
    value === "not_checked"
  );
}

function hasNullableString(
  value: Record<string, unknown>,
  key: string
): boolean {
  return value[key] === null || typeof value[key] === "string";
}

function hasNullableBoolean(
  value: Record<string, unknown>,
  key: string
): boolean {
  return value[key] === null || typeof value[key] === "boolean";
}

function hasNullableStatus(
  value: Record<string, unknown>,
  key: string
): boolean {
  return value[key] === null || isStatus(value[key]);
}

function verifyReportRef(
  label: string,
  value: unknown,
  extraBooleanKeys: string[],
  failures: string[]
): void {
  if (!isObject(value)) {
    failures.push(`${label} report ref must be an object.`);
    return;
  }

  for (const key of ["path", "id", "created_at"]) {
    if (!hasNullableString(value, key)) {
      failures.push(`${label}.${key} must be string or null.`);
    }
  }

  if (!hasNullableStatus(value, "status")) {
    failures.push(`${label}.status must be a valid status or null.`);
  }

  for (const key of extraBooleanKeys) {
    if (!hasNullableBoolean(value, key)) {
      failures.push(`${label}.${key} must be boolean or null.`);
    }
  }

  if (typeof value.path === "string") {
    const artifactPath = resolve(process.cwd(), value.path);

    if (!existsSync(artifactPath)) {
      failures.push(`${label}.path does not exist: ${value.path}`);
    }
  }

  const hasPath = typeof value.path === "string";
  const hasId = typeof value.id === "string";
  const hasCreatedAt = typeof value.created_at === "string";
  const hasStatus = typeof value.status === "string";

  if (hasPath && (!hasId || !hasCreatedAt || !hasStatus)) {
    failures.push(
      `${label} has a path but is missing id, created_at, or status.`
    );
  }

  if (!hasPath && (hasId || hasCreatedAt || hasStatus)) {
    failures.push(
      `${label} has report metadata but no path.`
    );
  }
}

if (!existsSync(indexPath)) {
  console.error(`Latest report index not found: ${indexPath}`);
  process.exit(1);
}

const raw = readJson(indexPath);
const failures: string[] = [];

if (!isObject(raw)) {
  failures.push("Index must be an object.");
} else {
  if (raw.schema_version !== "latest-report-index.v1") {
    failures.push("schema_version must be latest-report-index.v1.");
  }

  if (typeof raw.index_id !== "string" || raw.index_id.length < 10) {
    failures.push("index_id must be a non-empty string.");
  }

  if (typeof raw.created_at !== "string" || raw.created_at.length < 10) {
    failures.push("created_at must be a timestamp string.");
  }

  if (!isObject(raw.source)) {
    failures.push("source must be an object.");
  } else {
    if (raw.source.runtime !== "pathwarden") {
      failures.push("source.runtime must be pathwarden.");
    }

    if (typeof raw.source.environment !== "string") {
      failures.push("source.environment must be a string.");
    }
  }

  if (!isObject(raw.reports)) {
    failures.push("reports must be an object.");
  } else {
    verifyReportRef(
      "governance",
      raw.reports.governance,
      ["release_safe"],
      failures
    );

    verifyReportRef(
      "replay_provenance",
      raw.reports.replay_provenance,
      ["admissible", "lineage_complete"],
      failures
    );

    verifyReportRef(
      "federation_readiness",
      raw.reports.federation_readiness,
      ["ready_for_federation"],
      failures
    );
  }
}

if (failures.length > 0) {
  console.error("Latest report index verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const index = raw as LatestReportIndex;

console.log(JSON.stringify({
  ok: true,
  verification: "latest-report-index",
  index_id: index.index_id,
  governance: index.reports.governance.path,
  replay_provenance: index.reports.replay_provenance.path,
  federation_readiness: index.reports.federation_readiness.path
}, null, 2));
