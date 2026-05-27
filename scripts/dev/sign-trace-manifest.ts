import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { sign } from "node:crypto";
import { sha256 } from "../../core/common/hash";

const traceId = process.argv[2];
const signerId = process.argv[3] ?? "pathwarden-dev-governance-key";

if (!traceId) {
  console.error("Usage: tsx scripts/dev/sign-trace-manifest.ts <trace_id> [signer_id]");
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(signerId)) {
  console.error("Signer ID must contain only lowercase letters, numbers, and hyphens.");
  process.exit(1);
}

const manifestPath = resolve(
  process.cwd(),
  "exports",
  "traces",
  `${traceId}.manifest.json`
);

const privateKeyPath = resolve(
  process.cwd(),
  "config",
  "keys",
  `${signerId}-private.pem`
);

const publicKeyPath = resolve(
  process.cwd(),
  "config",
  "keys",
  `${signerId}-public.pem`
);

if (!existsSync(manifestPath)) {
  console.error(`Manifest not found: ${manifestPath}`);
  process.exit(1);
}

if (!existsSync(privateKeyPath)) {
  console.error(`Private key not found: ${privateKeyPath}`);
  process.exit(1);
}

if (!existsSync(publicKeyPath)) {
  console.error(`Public key not found: ${publicKeyPath}`);
  process.exit(1);
}

const manifestContent = readFileSync(manifestPath, "utf8");
const privateKey = readFileSync(privateKeyPath, "utf8");
const publicKey = readFileSync(publicKeyPath, "utf8");

const publicKeyFingerprint = sha256(publicKey);

const signature = sign(
  null,
  Buffer.from(manifestContent, "utf8"),
  privateKey
).toString("base64");

const signatureEnvelope = {
  schema_version: "trace-manifest-signature.v1",
  trace_id: traceId,
  signed_at: new Date().toISOString(),
  signer: signerId,
  signer_public_key_fingerprint: publicKeyFingerprint,
  signer_public_key_fingerprint_algorithm: "sha256",
  signature_algorithm: "ed25519",
  manifest_path: manifestPath,
  signature_base64: signature
};

const signaturePath = resolve(
  process.cwd(),
  "exports",
  "traces",
  `${traceId}.manifest.sig.json`
);

writeFileSync(
  signaturePath,
  JSON.stringify(signatureEnvelope, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  ok: true,
  diagnostic: "trace-manifest-signature",
  trace_id: traceId,
  signer: signerId,
  signature_path: signaturePath,
  signature_algorithm: "ed25519",
  signer_public_key_fingerprint: publicKeyFingerprint
}, null, 2));