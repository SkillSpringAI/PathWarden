import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateCapabilityGrant } from "../../core/kernel/capabilityGrantValidator";
import { replayExecutionByTraceId } from "../../core/audit/executionReplay";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const grant = validateCapabilityGrant({
  app_id: "skillspring-quantum",
  tool_id: "filesystem.requestMove",
  requested_risk_level: "high"
});

assert(grant.ok, "Expected capability grant to succeed");

const traceId = grant.permission_token.trace_id;
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

if (existsSync(exportPath)) {
  rmSync(exportPath, { force: true });
}

writeFileSync(
  exportPath,
  JSON.stringify(replay, null, 2),
  "utf8"
);

assert(
  existsSync(exportPath),
  "Expected exported trace file to exist"
);

const exported = JSON.parse(
  readFileSync(exportPath, "utf8")
);

assert(
  exported.trace_id === traceId,
  "Expected exported trace_id to match"
);

assert(
  Array.isArray(exported.reconstructed_chain),
  "Expected exported replay chain"
);

console.log("Trace export diagnostic passed.");
