import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";

import { resolve } from "node:path";

import { sha256 } from "../../core/common/hash";

interface SignerDefinition {
  signer_id: string;
  public_key_path: string;
}

const signerDefinitions: SignerDefinition[] = [
  {
    signer_id: "pathwarden-dev-governance-key",
    public_key_path: "config/keys/dev-governance-public.pem"
  },
  {
    signer_id: "pathwarden-rotation-governance-key",
    public_key_path:
      "config/keys/pathwarden-rotation-governance-key-public.pem"
  }
];

const trustDir = resolve(
  process.cwd(),
  "policy",
  "trust"
);

const trustManifestPath = resolve(
  trustDir,
  "governance-trust-manifest.json"
);

if (!existsSync(trustDir)) {
  mkdirSync(trustDir, { recursive: true });
}

const generatedAt = new Date().toISOString();

const trustedSigners = signerDefinitions.map(
  (signerDefinition) => {

    const resolvedPublicKeyPath = resolve(
      process.cwd(),
      signerDefinition.public_key_path
    );

    if (!existsSync(resolvedPublicKeyPath)) {
      console.error(
        `Public key not found: ${resolvedPublicKeyPath}`
      );

      process.exit(1);
    }

    const publicKey = readFileSync(
      resolvedPublicKeyPath,
      "utf8"
    );

    const fingerprint = sha256(publicKey);

    return {
      signer_id: signerDefinition.signer_id,
      public_key_path: signerDefinition.public_key_path,
      public_key_fingerprint: fingerprint,
      fingerprint_algorithm: "sha256",
      signature_algorithm: "ed25519",
      status: "trusted",
      created_at: generatedAt,
      valid_from: generatedAt,
      purpose: "governance_manifest_signing"
    };
  }
);

const manifest = {
  schema_version: "governance-trust-manifest.v1",
  generated_at: generatedAt,
  trusted_signers: trustedSigners
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
  signer_count: trustedSigners.length,
  signers: trustedSigners.map(
    (signer) => ({
      signer_id: signer.signer_id,
      public_key_fingerprint:
        signer.public_key_fingerprint
    })
  )
}, null, 2));