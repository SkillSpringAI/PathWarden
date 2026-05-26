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

function runVerifier(): {
  status: number | null;
  stdout: string;
  stderr: string;
} {
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

  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
}

function setSignerStatus(status: string): void {
  const manifest = JSON.parse(originalTrustManifest);
  manifest.trusted_signers[0].status = status;

  writeFileSync(
    trustManifestPath,
    JSON.stringify(manifest, null, 2),
    "utf8"
  );
}

try {
  setSignerStatus("trusted");

  const trustedResult = runVerifier();

  const trustedAccepted =
    trustedResult.status === 0 &&
    trustedResult.stdout.includes('"verified": true');

  setSignerStatus("revoked");

  const revokedResult = runVerifier();

  const revokedRejected =
    revokedResult.status !== 0 &&
    (
      revokedResult.stdout.includes("signer_not_trusted") ||
      revokedResult.stderr.includes("signer_not_trusted")
    );

  setSignerStatus("suspended");

  const suspendedResult = runVerifier();

  const suspendedRejected =
    suspendedResult.status !== 0 &&
    (
      suspendedResult.stdout.includes("signer_not_trusted") ||
      suspendedResult.stderr.includes("signer_not_trusted")
    );

  if (!trustedAccepted || !revokedRejected || !suspendedRejected) {
    console.error(JSON.stringify({
      ok: false,
      diagnostic: "governance-trust-statuses",
      trustedAccepted,
      revokedRejected,
      suspendedRejected,
      trustedResult,
      revokedResult,
      suspendedResult
    }, null, 2));

    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    diagnostic: "governance-trust-statuses",
    trusted_accepted: true,
    revoked_rejected: true,
    suspended_rejected: true
  }, null, 2));
}
finally {
  writeFileSync(
    trustManifestPath,
    originalTrustManifest,
    "utf8"
  );
}