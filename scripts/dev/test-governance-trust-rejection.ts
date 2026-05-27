import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const traceId = "trace_capability_1779763459935";

const trustManifestPath = resolve(
  process.cwd(),
  "policy",
  "trust",
  "governance-trust-manifest.json"
);

const originalTrustManifest = readFileSync(
  trustManifestPath,
  "utf8"
);

try {
  const manifest = JSON.parse(originalTrustManifest);

  const signer = manifest.trusted_signers.find(
    (entry: { signer_id?: string }) =>
      entry.signer_id === "pathwarden-rotation-governance-key"
  );

  if (!signer) {
    throw new Error("Rotation signer not found in trust manifest.");
  }

  signer.status = "revoked";

  writeFileSync(
    trustManifestPath,
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  const result = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      `npm run verify:trace-manifest-signature -- ${traceId}`
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8"
    }
  );

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";

  const rejected =
    result.status !== 0 &&
    (
      stdout.includes("signer_not_trusted") ||
      stderr.includes("signer_not_trusted")
    );

  if (!rejected) {
    console.error(JSON.stringify({
      ok: false,
      diagnostic: "governance-trust-rejection",
      message: "Revoked signer was NOT rejected.",
      status: result.status,
      stdout,
      stderr
    }, null, 2));

    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    diagnostic: "governance-trust-rejection",
    revoked_signer_rejected: true
  }, null, 2));
}
finally {
  writeFileSync(
    trustManifestPath,
    originalTrustManifest,
    "utf8"
  );
}