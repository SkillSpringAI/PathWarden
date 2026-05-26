import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { verifyGovernanceManifestSignature } from "../../core/trust/governanceTrust";

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

  manifest.trusted_signers[0].valid_from =
    "2999-01-01T00:00:00.000Z";

  writeFileSync(
    trustManifestPath,
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  const result = verifyGovernanceManifestSignature(traceId);

  if (
    result.ok ||
    result.reason !== "signer_not_yet_valid"
  ) {
    console.error(JSON.stringify({
      ok: false,
      diagnostic: "governance-signer-not-yet-valid",
      message: "Not-yet-valid signer was NOT rejected.",
      result
    }, null, 2));

    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    diagnostic: "governance-signer-not-yet-valid",
    not_yet_valid_signer_rejected: true,
    reason: result.reason
  }, null, 2));
}
finally {
  writeFileSync(
    trustManifestPath,
    originalTrustManifest,
    "utf8"
  );
}