import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { sha256 } from "../../core/common/hash";

const publicKeyPath = resolve(
  process.cwd(),
  "config",
  "keys",
  "dev-governance-public.pem"
);

const trustDir = resolve(
  process.cwd(),
  "policy",
  "trust"
);

const trustManifestPath = resolve(
  trustDir,
  "governance-trust-manifest.json"
);

if (!existsSync(publicKeyPath)) {
  console.error(`Public key not found: ${publicKeyPath}`);
  process.exit(1);
}

if (!existsSync(trustDir)) {
  mkdirSync(trustDir, { recursive: true });
}

const publicKey = readFileSync(publicKeyPath, "utf8");
const fingerprint = sha256(publicKey);

const generatedAt = new Date().toISOString();

const manifest = {
  schema_version: "governance-trust-manifest.v1",
  generated_at: generatedAt,
  trusted_signers: [
    {
      signer_id: "pathwarden-dev-governance-key",
      public_key_fingerprint: fingerprint,
      fingerprint_algorithm: "sha256",
      signature_algorithm: "ed25519",
      status: "trusted",
      created_at: generatedAt,
      valid_from: generatedAt,
      purpose: "governance_manifest_signing"
    }
  ]
};

writeFileSync(
  trustManifestPath,
  JSON.stringify(manifest, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  ok: true,
  diagnostic: "governance-trust-manifest-created",
  trust_manifest_path: trustManifestPath,
  signer_id: "pathwarden-dev-governance-key",
  public_key_fingerprint: fingerprint
}, null, 2));