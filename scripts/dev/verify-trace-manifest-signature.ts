import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { verify } from "node:crypto";

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

if (!existsSync(manifestPath)) {
  console.error(`Manifest not found: ${manifestPath}`);
  process.exit(1);
}

if (!existsSync(signaturePath)) {
  console.error(`Signature envelope not found: ${signaturePath}`);
  process.exit(1);
}

if (!existsSync(publicKeyPath)) {
  console.error(`Public key not found: ${publicKeyPath}`);
  process.exit(1);
}

const manifestContent = readFileSync(manifestPath, "utf8");
const signatureEnvelope = JSON.parse(
  readFileSync(signaturePath, "utf8")
);
const publicKey = readFileSync(publicKeyPath, "utf8");

if (signatureEnvelope.signature_algorithm !== "ed25519") {
  console.error("Unsupported signature algorithm.");
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
    verified: false
  }, null, 2));

  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  diagnostic: "trace-manifest-signature-verification",
  trace_id: traceId,
  verified: true,
  signature_algorithm: "ed25519"
}, null, 2));