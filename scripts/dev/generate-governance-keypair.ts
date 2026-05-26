import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateKeyPairSync } from "node:crypto";

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
  "dev-governance-private.pem"
);

const publicKeyPath = resolve(
  keyDir,
  "dev-governance-public.pem"
);

if (existsSync(privateKeyPath) || existsSync(publicKeyPath)) {
  console.error("Governance keypair already exists. Refusing to overwrite.");
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
  diagnostic: "governance-keypair-generation",
  private_key_path: privateKeyPath,
  public_key_path: publicKeyPath,
  algorithm: "ed25519"
}, null, 2));