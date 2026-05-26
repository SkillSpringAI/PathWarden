import { copyFileSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { sha256 } from "../../core/common/hash";

const traceId = "trace_capability_1779758646071";

const sourcePath = resolve(
  process.cwd(),
  "exports",
  "traces",
  `${traceId}.json`
);

const tamperedPath = resolve(
  process.cwd(),
  "exports",
  "traces",
  `${traceId}.tampered.json`
);

copyFileSync(sourcePath, tamperedPath);

const bundle = JSON.parse(
  readFileSync(tamperedPath, "utf8")
);

bundle.replay.reconstructed_chain.push(
  "tampered_entry:forensic_test"
);

writeFileSync(
  tamperedPath,
  JSON.stringify(bundle, null, 2),
  "utf8"
);

const tamperedBundle = JSON.parse(
  readFileSync(tamperedPath, "utf8")
);

const storedHash = tamperedBundle.bundle_hash;

const unsignedBundle = {
  export_metadata: tamperedBundle.export_metadata,
  replay: tamperedBundle.replay
};

const recomputedHash = sha256(
  JSON.stringify(unsignedBundle)
);

const mismatchDetected =
  recomputedHash !== storedHash;

unlinkSync(tamperedPath);

if (!mismatchDetected) {
  console.error(JSON.stringify({
    ok: false,
    diagnostic: "trace-export-tamper-detection",
    message: "Tampering was NOT detected."
  }, null, 2));

  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  diagnostic: "trace-export-tamper-detection",
  tampering_detected: true
}, null, 2));