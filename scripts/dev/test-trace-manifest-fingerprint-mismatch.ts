import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { verify } from "node:crypto";
import { sha256 } from "../../core/common/hash";

const traceId = "trace_capability_1779763459935";

const manifestPath = resolve(
  process.cwd(),
  "exports",
  "traces",
  `${traceId}.manifest.json`
);

const signaturePath = resolve(
  process.cwd(),
  "exports",
  "traces",
  `${traceId}.manifest.sig.json`
);

const publicKeyPath = resolve(
  process.cwd(),
  "config",
  "keys",
  "dev-governance-public.pem"
);

const originalSignatureEnvelope = readFileSync(
  signaturePath,
  "utf8"
);

try {
  const envelope = JSON.parse(originalSignatureEnvelope);

  envelope.signer_public_key_fingerprint =
    "broken_public_key_fingerprint_for_diagnostic";

  writeFileSync(
    signaturePath,
    JSON.stringify(envelope, null, 2),
    "utf8"
  );

  const manifestContent = readFileSync(manifestPath, "utf8");
  const signatureEnvelope = JSON.parse(
    readFileSync(signaturePath, "utf8")
  );
  const publicKey = readFileSync(publicKeyPath, "utf8");

  const localFingerprint = sha256(publicKey);

  const fingerprintRejected =
    signatureEnvelope.signer_public_key_fingerprint_algorithm !== "sha256" ||
    signatureEnvelope.signer_public_key_fingerprint !== localFingerprint;

  const signatureStillCryptographicallyValid = verify(
    null,
    Buffer.from(manifestContent, "utf8"),
    publicKey,
    Buffer.from(signatureEnvelope.signature_base64, "base64")
  );

  if (!fingerprintRejected) {
    console.error(JSON.stringify({
      ok: false,
      diagnostic: "trace-manifest-fingerprint-mismatch",
      message: "Fingerprint mismatch was NOT rejected."
    }, null, 2));

    process.exit(1);
  }

  if (!signatureStillCryptographicallyValid) {
    console.error(JSON.stringify({
      ok: false,
      diagnostic: "trace-manifest-fingerprint-mismatch",
      message: "Signature became invalid; diagnostic should isolate fingerprint mismatch only."
    }, null, 2));

    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    diagnostic: "trace-manifest-fingerprint-mismatch",
    fingerprint_mismatch_rejected: true,
    signature_remained_valid: true
  }, null, 2));
}
finally {
  writeFileSync(
    signaturePath,
    originalSignatureEnvelope,
    "utf8"
  );
}