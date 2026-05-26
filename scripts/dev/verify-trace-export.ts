import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sha256 } from "../../core/common/hash";

const traceId = process.argv[2];

if (!traceId) {
  console.error("Usage: tsx scripts/dev/verify-trace-export.ts <trace_id>");
  process.exit(1);
}

const exportPath = resolve(
  process.cwd(),
  "exports",
  "traces",
  `${traceId}.json`
);

if (!existsSync(exportPath)) {
  console.error(`Trace export not found: ${exportPath}`);
  process.exit(1);
}

const bundle = JSON.parse(
  readFileSync(exportPath, "utf8")
);

const storedHash = bundle.bundle_hash;

if (!storedHash) {
  console.error("Bundle missing bundle_hash.");
  process.exit(1);
}

const unsignedBundle = {
  export_metadata: bundle.export_metadata,
  replay: bundle.replay
};

const recomputedHash = sha256(
  JSON.stringify(unsignedBundle)
);

const verified = recomputedHash === storedHash;

if (!verified) {
  console.error(JSON.stringify({
    ok: false,
    diagnostic: "trace-export-verification",
    trace_id: traceId,
    stored_hash: storedHash,
    recomputed_hash: recomputedHash
  }, null, 2));

  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  diagnostic: "trace-export-verification",
  trace_id: traceId,
  bundle_hash: storedHash
}, null, 2));