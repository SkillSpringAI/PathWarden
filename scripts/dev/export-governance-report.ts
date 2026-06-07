import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildGovernanceReport,
  validateGovernanceReport,
  type GovernanceReportReplayInput
} from "../../core/audit/governanceReport";

type ReplayBaselineLike = {
  schema_version?: unknown;
  baseline_id?: unknown;
};

type ReplayDiffLike = {
  schema_version?: unknown;
  diff_id?: unknown;
};

function readJsonFile<T>(filePath: string): T {
  const absolutePath = resolve(filePath);

  if (!existsSync(absolutePath)) {
    throw new Error(`Input file does not exist: ${absolutePath}`);
  }

  return JSON.parse(readFileSync(absolutePath, "utf8")) as T;
}

function parseReplayInput(args: string[]): GovernanceReportReplayInput | undefined {
  if (args.length === 0) {
    return undefined;
  }

  if (args.length !== 2) {
    throw new Error(
      "Governance report replay input requires both replay baseline and replay diff paths."
    );
  }

  const [baselinePath, diffPath] = args;
  const baseline = readJsonFile<ReplayBaselineLike>(baselinePath);
  const diff = readJsonFile<ReplayDiffLike>(diffPath);

  if (baseline.schema_version !== "replay-baseline.v1") {
    throw new Error("Invalid replay baseline: expected schema_version replay-baseline.v1.");
  }

  if (diff.schema_version !== "replay-diff.v1") {
    throw new Error("Invalid replay diff: expected schema_version replay-diff.v1.");
  }

  if (typeof baseline.baseline_id !== "string" || baseline.baseline_id.length === 0) {
    throw new Error("Invalid replay baseline: missing baseline_id string.");
  }

  if (typeof diff.diff_id !== "string" || diff.diff_id.length === 0) {
    throw new Error("Invalid replay diff: missing diff_id string.");
  }

  return {
    baseline_id: baseline.baseline_id,
    diff_id: diff.diff_id,
    baseline_path: resolve(baselinePath),
    diff_path: resolve(diffPath)
  };
}

const replayInput = parseReplayInput(process.argv.slice(2));

const report = buildGovernanceReport({
  replay: replayInput
});

validateGovernanceReport(report);

const exportDir = resolve(
  process.cwd(),
  "exports",
  "governance"
);

mkdirSync(exportDir, { recursive: true });

const exportPath = resolve(
  exportDir,
  `${report.report_id}.json`
);

writeFileSync(
  exportPath,
  JSON.stringify(report, null, 2),
  "utf8"
);

console.log(`Governance report written to: ${exportPath}`);
console.log(`Report id: ${report.report_id}`);
console.log(`Authority status: ${report.authority.status}`);
console.log(`Authority records: ${report.authority.record_count}`);
console.log(`Policy status: ${report.policy.status}`);
console.log(`Policy hashes available: ${report.policy.hashes_available}`);
console.log(`Replay status: ${report.replay.status}`);
console.log(`Replay baseline id: ${report.replay.baseline_id}`);
console.log(`Replay diff id: ${report.replay.diff_id}`);
console.log(`Diagnostics status: ${report.diagnostics.overall_status}`);
console.log(`Summary status: ${report.summary.status}`);
console.log(`Release safe: ${report.summary.release_safe}`);