import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { verify } from "node:crypto";
import { sha256 } from "../../core/common/hash";

const traceId = process.argv[2];

if (!traceId) {
  console.error("Usage: tsx scripts/dev/verify-trace-manifest-signature.ts <trace_id>");
  process.exit(1);
}

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

const trustManifestPath = resolve(
  process.cwd(),
  "policy",
  "trust",
  "governance-trust-manifest.json"
);

for (const requiredPath of [
  manifestPath,
  signaturePath,
  publicKeyPath,
  trustManifestPath
]) {
  if (!existsSync(requiredPath)) {
    console.error(`Required file not found: ${requiredPath}`);
    process.exit(1);
  }
}

const manifestContent = readFileSync(manifestPath, "utf8");
const signatureEnvelope = JSON.parse(readFileSync(signaturePath, "utf8"));
const publicKey = readFileSync(publicKeyPath, "utf8");
const trustManifest = JSON.parse(readFileSync(trustManifestPath, "utf8"));

const publicKeyFingerprint = sha256(publicKey);

if (signatureEnvelope.signature_algorithm !== "ed25519") {
  console.error("Unsupported signature algorithm.");
  process.exit(1);
}

if (
  signatureEnvelope.signer_public_key_fingerprint_algorithm !== "sha256" ||
  signatureEnvelope.signer_public_key_fingerprint !== publicKeyFingerprint
) {
  console.error(JSON.stringify({
    ok: false,
    diagnostic: "trace-manifest-signature-verification",
    trace_id: traceId,
    verified: false,
    reason: "signer_public_key_fingerprint_mismatch"
  }, null, 2));
  process.exit(1);
}

const trustedSigner = trustManifest.trusted_signers?.find(
  (signer: {
    signer_id?: string;
    public_key_fingerprint?: string;
    fingerprint_algorithm?: string;
    signature_algorithm?: string;
    status?: string;
  }) =>
    signer.signer_id === signatureEnvelope.signer &&
    signer.public_key_fingerprint === signatureEnvelope.signer_public_key_fingerprint &&
    signer.fingerprint_algorithm === "sha256" &&
    signer.signature_algorithm === "ed25519" &&
    signer.status === "trusted"
);

if (!trustedSigner) {
  console.error(JSON.stringify({
    ok: false,
    diagnostic: "trace-manifest-signature-verification",
    trace_id: traceId,
    verified: false,
    reason: "signer_not_trusted",
    signer: signatureEnvelope.signer
  }, null, 2));
  process.exit(1);
}

const verified = verify(
  null,
  Buffer.from(manifestContent, "utf8"),
  publicKey,
  Buffer.from(signatureEnvelope.signature_base64, "base64")
);

if (!verified) {
  console.error(JSON.stringify({
    ok: false,
    diagnostic: "trace-manifest-signature-verification",
    trace_id: traceId,
    verified: false,
    reason: "signature_invalid"
  }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  diagnostic: "trace-manifest-signature-verification",
  trace_id: traceId,
  verified: true,
  signer: signatureEnvelope.signer,
  trust_status: trustedSigner.status,
  signature_algorithm: "ed25519",
  signer_public_key_fingerprint: publicKeyFingerprint
}, null, 2));