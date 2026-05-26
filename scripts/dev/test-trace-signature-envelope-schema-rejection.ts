import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { verifyGovernanceManifestSignature } from "../../core/trust/governanceTrust";

const traceId = "trace_capability_1779763459935";

const signaturePath = resolve(
  process.cwd(),
  "exports",
  "traces",
  `${traceId}.manifest.sig.json`
);

const originalSignatureEnvelope = readFileSync(
  signaturePath,
  "utf8"
);

try {
  const envelope = JSON.parse(originalSignatureEnvelope);

  delete envelope.signature_base64;

  writeFileSync(
    signaturePath,
    JSON.stringify(envelope, null, 2),
    "utf8"
  );

  const result = verifyGovernanceManifestSignature(traceId);

  if (
    result.ok ||
    result.reason !== "invalid_signature_envelope_schema"
  ) {
    console.error(JSON.stringify({
      ok: false,
      diagnostic: "trace-signature-envelope-schema-rejection",
      message: "Malformed signature envelope was NOT rejected.",
      result
    }, null, 2));

    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    diagnostic: "trace-signature-envelope-schema-rejection",
    malformed_signature_envelope_rejected: true,
    reason: result.reason
  }, null, 2));
}
finally {
  writeFileSync(
    signaturePath,
    originalSignatureEnvelope,
    "utf8"
  );
}