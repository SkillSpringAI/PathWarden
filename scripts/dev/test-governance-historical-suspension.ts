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
      diagnostic: "governance-historical-suspension",
      message: "Signer not found in trust manifest.",
      signerId
    }, null, 2));

    process.exit(1);
  }

  signer.status = "suspended";

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

  const historicalRejected =
    !historicalResult.ok &&
    historicalResult.reason === "signer_not_trusted";

  if (!currentRejected || !historicalRejected) {
    console.error(JSON.stringify({
      ok: false,
      diagnostic: "governance-historical-suspension",
      currentRejected,
      historicalRejected,
      currentResult,
      historicalResult
    }, null, 2));

    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    diagnostic: "governance-historical-suspension",
    current_mode_rejected_suspended_signer: true,
    historical_mode_rejected_suspended_signer: true
  }, null, 2));
}
finally {
  writeFileSync(
    trustManifestPath,
    originalTrustManifest,
    "utf8"
  );
}