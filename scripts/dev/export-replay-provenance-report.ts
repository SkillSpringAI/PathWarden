import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ReplayBaseline } from "../../core/audit/replayBaseline";
import type { ReplayDiff } from "../../core/audit/replayDiff";
import {
  buildReplayProvenanceReport,
  validateReplayProvenanceReport
} from "../../core/audit/replayProvenanceReport";

const baselinePathArg = process.argv[2] ?? null;
const diffPathArg = process.argv[3] ?? null;

function readJsonFile<T>(pathArg: string): T {
  const absolutePath = resolve(process.cwd(), pathArg);

  if (!existsSync(absolutePath)) {
    console.error(`Input artifact not found: ${absolutePath}`);
    process.exit(1);
  }

  return JSON.parse(readFileSync(absolutePath, "utf8")) as T;
}

if ((baselinePathArg && !diffPathArg) || (!baselinePathArg && diffPathArg)) {
  console.error(
    "Usage: npm run export:replay-provenance-report -- [baseline_json_path diff_json_path]"
  );
  process.exit(1);
}

const baseline = baselinePathArg
  ? readJsonFile<ReplayBaseline>(baselinePathArg)
  : null;

const diff = diffPathArg
  ? readJsonFile<ReplayDiff>(diffPathArg)
  : null;

const report = buildReplayProvenanceReport(
  baseline,
  diff
);

validateReplayProvenanceReport(report);

const exportDir = resolve(
  process.cwd(),
  "exports",
  "replay"
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

console.log(`Replay provenance report written to: ${exportPath}`);
console.log(`Report id: ${report.report_id}`);
console.log(`Authority status: ${report.authority.status}`);
console.log(`Replay status: ${report.replay.status}`);
console.log(`Baseline id: ${report.replay.baseline_id}`);
console.log(`Diff id: ${report.replay.diff_id}`);
console.log(`Policy status: ${report.policy.status}`);
console.log(`Lineage complete: ${report.lineage.complete}`);
console.log(`Lineage explainable: ${report.lineage.explainable}`);
console.log(`Lineage gaps: ${report.lineage.gaps.length}`);
console.log(`Summary status: ${report.summary.status}`);
console.log(`Admissible: ${report.summary.admissible}`);
