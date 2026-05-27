import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateKeyPairSync } from "node:crypto";

const signerId = process.argv[2];

if (!signerId) {
  console.error("Usage: tsx scripts/dev/generate-governance-keypair-for-signer.ts <signer_id>");
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(signerId)) {
  console.error("Signer ID must contain only lowercase letters, numbers, and hyphens.");
  process.exit(1);
}

const keyDir = resolve(
  process.cwd(),
  "config",
  "keys"
);

if (!existsSync(keyDir)) {
  mkdirSync(keyDir, { recursive: true });
}

const privateKeyPath = resolve(
  keyDir,
  `${signerId}-private.pem`
);

const publicKeyPath = resolve(
  keyDir,
  `${signerId}-public.pem`
);

if (existsSync(privateKeyPath) || existsSync(publicKeyPath)) {
  console.error("Signer keypair already exists. Refusing to overwrite.");
  process.exit(1);
}

const { privateKey, publicKey } = generateKeyPairSync("ed25519", {
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem"
  },
  publicKeyEncoding: {
    type: "spki",
    format: "pem"
  }
});

writeFileSync(privateKeyPath, privateKey, "utf8");
writeFileSync(publicKeyPath, publicKey, "utf8");

console.log(JSON.stringify({
  ok: true,
  diagnostic: "governance-keypair-generation-for-signer",
  signer_id: signerId,
  private_key_path: privateKeyPath,
  public_key_path: publicKeyPath,
  algorithm: "ed25519"
}, null, 2));