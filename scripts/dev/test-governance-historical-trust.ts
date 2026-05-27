import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { verifyGovernanceManifestSignature } from "../../core/trust/governanceTrust";

const traceId = "trace_capability_1779763459935";
const signerId = "pathwarden-rotation-governance-key";

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
      entry.signer_id === signerId
  );

  if (!signer) {
    console.error(JSON.stringify({
      ok: false,
      diagnostic: "governance-historical-trust",
      message: "Signer not found in trust manifest.",
      signerId
    }, null, 2));

    process.exit(1);
  }

  signer.status = "revoked";

  writeFileSync(
    trustManifestPath,
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  const currentResult =
    verifyGovernanceManifestSignature(traceId);

  const historicalResult =
    verifyGovernanceManifestSignature(
      traceId,
      { mode: "historical" }
    );

  const currentRejected =
    !currentResult.ok &&
    currentResult.reason === "signer_not_trusted";

  const historicalAccepted =
    historicalResult.ok &&
    historicalResult.signer === signerId;

  if (!currentRejected || !historicalAccepted) {
    console.error(JSON.stringify({
      ok: false,
      diagnostic: "governance-historical-trust",
      currentRejected,
      historicalAccepted,
      currentResult,
      historicalResult
    }, null, 2));

    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    diagnostic: "governance-historical-trust",
    current_mode_rejected_revoked_signer: true,
    historical_mode_accepted_previously_valid_signer: true
  }, null, 2));
}
finally {
  writeFileSync(
    trustManifestPath,
    originalTrustManifest,
    "utf8"
  );
}