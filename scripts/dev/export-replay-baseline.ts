import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildReplayBaseline,
  validateReplayBaseline
} from "../../core/audit/replayBaseline";

const traceId = process.argv[2];

if (!traceId) {
  console.error("Usage: npm run export:replay-baseline -- <trace_id>");
  process.exit(1);
}

const baseline = buildReplayBaseline(traceId);

validateReplayBaseline(baseline);

const exportDir = resolve(
  process.cwd(),
  "exports",
  "replay"
);

mkdirSync(exportDir, { recursive: true });

const exportPath = resolve(
  exportDir,
  `${baseline.baseline_id}.json`
);

writeFileSync(
  exportPath,
  JSON.stringify(baseline, null, 2),
  "utf8"
);

console.log(`Replay baseline written to: ${exportPath}`);
console.log(`Trace id: ${baseline.execution.trace_id}`);
console.log(`Authority records: ${baseline.authority.record_count}`);
console.log(`Execution records: ${baseline.execution.record_count}`);
console.log(`Baseline safe: ${baseline.replay.baseline_safe}`);
console.log(`Baseline id: ${baseline.baseline_id}`);
