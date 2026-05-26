import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { verify } from "node:crypto";

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

const originalManifest = readFileSync(manifestPath, "utf8");

try {
  const manifest = JSON.parse(originalManifest);

  manifest.verification_status = "tampered";

  writeFileSync(
    manifestPath,
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  const tamperedManifest = readFileSync(manifestPath, "utf8");
  const signatureEnvelope = JSON.parse(
    readFileSync(signaturePath, "utf8")
  );
  const publicKey = readFileSync(publicKeyPath, "utf8");

  const verified = verify(
    null,
    Buffer.from(tamperedManifest, "utf8"),
    publicKey,
    Buffer.from(signatureEnvelope.signature_base64, "base64")
  );

  if (verified) {
    console.error(JSON.stringify({
      ok: false,
      diagnostic: "trace-manifest-signature-tamper",
      message: "Tampered manifest signature still verified."
    }, null, 2));

    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    diagnostic: "trace-manifest-signature-tamper",
    tampering_detected: true
  }, null, 2));
}
finally {
  writeFileSync(
    manifestPath,
    originalManifest,
    "utf8"
  );
}