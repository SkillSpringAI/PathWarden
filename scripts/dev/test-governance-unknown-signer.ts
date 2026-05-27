import { existsSync } from "node:fs";
import { resolve } from "node:path";

const signerId = "unknown-governance-key";

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

const rejected =
  !existsSync(privateKeyPath) &&
  !existsSync(publicKeyPath);

if (!rejected) {
  console.error(JSON.stringify({
    ok: false,
    diagnostic: "governance-unknown-signer",
    message: "Unknown signer key material unexpectedly exists.",
    privateKeyPath,
    publicKeyPath
  }, null, 2));

  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  diagnostic: "governance-unknown-signer",
  unknown_signer_rejected: true
}, null, 2));