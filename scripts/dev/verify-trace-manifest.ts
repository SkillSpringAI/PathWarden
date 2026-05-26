import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const traceId = process.argv[2];

if (!traceId) {
  console.error("Usage: tsx scripts/dev/verify-trace-manifest.ts <trace_id>");
  process.exit(1);
}

const manifestPath = resolve(
  process.cwd(),
  "exports",
  "traces",
  `${traceId}.manifest.json`
);

if (!existsSync(manifestPath)) {
  console.error(`Manifest not found: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(
  readFileSync(manifestPath, "utf8")
);

const verified =
  manifest.verification_status === "verified" &&
  manifest.authority_chain_hash_mismatch_count === 0 &&
  manifest.authority_record_hash_mismatch_count === 0 &&
  manifest.authority_chain_continuity_break_count === 0;

if (!verified) {
  console.error(JSON.stringify({
    ok: false,
    diagnostic: "trace-manifest-verification",
    trace_id: traceId,
    manifest
  }, null, 2));

  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  diagnostic: "trace-manifest-verification",
  trace_id: traceId,
  verification_status: manifest.verification_status
}, null, 2));