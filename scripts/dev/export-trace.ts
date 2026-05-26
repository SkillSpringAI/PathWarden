import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { replayExecutionByTraceId } from "../../core/audit/executionReplay";
import { sha256 } from "../../core/common/hash";

const traceId = process.argv[2];

if (!traceId) {
  console.error("Usage: npm run export:trace -- <trace_id>");
  process.exit(1);
}

const replay = replayExecutionByTraceId(traceId);

const exportMetadata = {
  schema_version: "trace-export-bundle.v1",
  trace_id: traceId,
  exported_at: new Date().toISOString(),
  exporter: "pathwarden-export-trace-cli",
  bundle_hash_algorithm: "sha256"
};

const unsignedBundle = {
  export_metadata: exportMetadata,
  replay
};

const bundleHash = sha256(
  JSON.stringify(unsignedBundle)
);

const signedBundle = {
  ...unsignedBundle,
  bundle_hash: bundleHash
};

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
  JSON.stringify(signedBundle, null, 2),
  "utf8"
);

console.log(`Trace export written to: ${exportPath}`);
console.log(`Bundle hash: ${bundleHash}`);