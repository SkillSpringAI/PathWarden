import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { replayExecutionByTraceId } from "../../core/audit/executionReplay";

const traceId = process.argv[2];

if (!traceId) {
  console.error("Usage: npm run export:trace -- <trace_id>");
  process.exit(1);
}

const replay = replayExecutionByTraceId(traceId);

const exportDir = resolve(
  process.cwd(),
  "exports",
  "traces"
);

mkdirSync(exportDir, { recursive: true });

const exportPath = resolve(
  exportDir,
  `${traceId}.json`
);

writeFileSync(
  exportPath,
  JSON.stringify(replay, null, 2),
  "utf8"
);

console.log(`Trace export written to: ${exportPath}`);
