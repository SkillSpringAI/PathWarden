import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const traceId = process.argv[2];

if (!traceId) {
  console.error("Usage: tsx scripts/dev/export-trace-manifest.ts <trace_id>");
  process.exit(1);
}

const exportDir = resolve(
  process.cwd(),
  "exports",
  "traces"
);

if (!existsSync(exportDir)) {
  mkdirSync(exportDir, { recursive: true });
}

const traceExportPath = resolve(
  exportDir,
  `${traceId}.json`
);

if (!existsSync(traceExportPath)) {
  console.error(`Trace export not found: ${traceExportPath}`);
  process.exit(1);
}

const bundle = JSON.parse(
  readFileSync(traceExportPath, "utf8")
);

const replay = bundle.replay;

const manifest = {
  schema_version: "trace-verification-manifest.v1",
  trace_id: traceId,
  generated_at: new Date().toISOString(),

  bundle_hash: bundle.bundle_hash,
  bundle_hash_algorithm:
    bundle.export_metadata?.bundle_hash_algorithm ?? "sha256",

  authority_record_count:
    replay.authority?.records?.length ?? 0,

  audit_event_count:
    replay.audit_events?.length ?? 0,

  revoked_token_count:
    replay.revoked_token_ids?.length ?? 0,

  authority_chain_hash_mismatch_count:
    replay.authority_chain_hash_mismatches?.length ?? 0,

  authority_record_hash_mismatch_count:
    replay.authority_record_hash_mismatches?.length ?? 0,

  authority_chain_continuity_break_count:
    replay.authority_chain_continuity_breaks?.length ?? 0,

  verification_status:
    (
      (replay.authority_chain_hash_mismatches?.length ?? 0) === 0 &&
      (replay.authority_record_hash_mismatches?.length ?? 0) === 0 &&
      (replay.authority_chain_continuity_breaks?.length ?? 0) === 0
    )
      ? "verified"
      : "integrity_failure"
};

const manifestPath = resolve(
  exportDir,
  `${traceId}.manifest.json`
);

writeFileSync(
  manifestPath,
  JSON.stringify(manifest, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  ok: true,
  diagnostic: "trace-manifest-export",
  manifest_path: manifestPath,
  verification_status: manifest.verification_status
}, null, 2));