import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { sign } from "node:crypto";
import { sha256 } from "../../core/common/hash";
import { verifyGovernanceManifestSignature } from "../../core/trust/governanceTrust";

const traceId = "trace_capability_1779763459935";

function signerKeyBase(signerId: string): string {
  if (signerId === "pathwarden-dev-governance-key") {
    return "dev-governance";
  }

  return signerId;
}

function signManifestWithSigner(signerId: string): void {
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
    `${signerKeyBase(signerId)}-private.pem`
  );

  const publicKeyPath = resolve(
    process.cwd(),
    "config",
    "keys",
    `${signerKeyBase(signerId)}-public.pem`
  );

  if (!existsSync(privateKeyPath)) {
    throw new Error(`Private key not found: ${privateKeyPath}`);
  }

  if (!existsSync(publicKeyPath)) {
    throw new Error(`Public key not found: ${publicKeyPath}`);
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
}

function signAndVerify(signerId: string): boolean {
  signManifestWithSigner(signerId);

  const result = verifyGovernanceManifestSignature(traceId);

  return (
    result.ok &&
    result.signer === signerId
  );
}

const devSignerVerified = signAndVerify(
  "pathwarden-dev-governance-key"
);

const rotationSignerVerified = signAndVerify(
  "pathwarden-rotation-governance-key"
);

if (!devSignerVerified || !rotationSignerVerified) {
  console.error(JSON.stringify({
    ok: false,
    diagnostic: "governance-multi-signer",
    devSignerVerified,
    rotationSignerVerified
  }, null, 2));

  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  diagnostic: "governance-multi-signer",
  dev_signer_verified: true,
  rotation_signer_verified: true
}, null, 2));