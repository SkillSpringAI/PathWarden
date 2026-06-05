import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildReplayDiff,
  validateReplayDiff
} from "../../core/audit/replayDiff";
import type { ReplayBaseline } from "../../core/audit/replayBaseline";

const baselinePathArg = process.argv[2];
const traceId = process.argv[3];

if (!baselinePathArg || !traceId) {
  console.error("Usage: npm run export:replay-diff -- <baseline_json_path> <trace_id>");
  process.exit(1);
}

const baselinePath = resolve(process.cwd(), baselinePathArg);

if (!existsSync(baselinePath)) {
  console.error(`Replay baseline not found: ${baselinePath}`);
  process.exit(1);
}

const baseline = JSON.parse(
  readFileSync(baselinePath, "utf8")
) as ReplayBaseline;

const diff = buildReplayDiff(
  baseline,
  traceId
);

validateReplayDiff(diff);

const exportDir = resolve(
  process.cwd(),
  "exports",
  "replay"
);

mkdirSync(exportDir, { recursive: true });

const exportPath = resolve(
  exportDir,
  `${diff.diff_id}.json`
);

writeFileSync(
  exportPath,
  JSON.stringify(diff, null, 2),
  "utf8"
);

console.log(`Replay diff written to: ${exportPath}`);
console.log(`Baseline id: ${diff.baseline.baseline_id}`);
console.log(`Candidate replay id: ${diff.candidate.replay_id}`);
console.log(`Authority changed: ${diff.authority.changed}`);
console.log(`Execution changed: ${diff.execution.changed}`);
console.log(`Summary status: ${diff.summary.status}`);
console.log(`Admissible: ${diff.summary.admissible}`);
