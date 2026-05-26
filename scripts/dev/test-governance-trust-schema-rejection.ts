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

  delete manifest.trusted_signers[0].public_key_fingerprint;

  writeFileSync(
    trustManifestPath,
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  const result = verifyGovernanceManifestSignature(traceId);

  if (
    result.ok ||
    result.reason !== "invalid_trust_manifest_schema"
  ) {
    console.error(JSON.stringify({
      ok: false,
      diagnostic: "governance-trust-schema-rejection",
      message: "Malformed trust manifest was NOT rejected.",
      result
    }, null, 2));

    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    diagnostic: "governance-trust-schema-rejection",
    malformed_trust_manifest_rejected: true,
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