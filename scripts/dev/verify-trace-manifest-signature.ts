import { verifyGovernanceManifestSignature } from "../../core/trust/governanceTrust";

const traceId = process.argv[2];

if (!traceId) {
  console.error("Usage: tsx scripts/dev/verify-trace-manifest-signature.ts <trace_id>");
  process.exit(1);
}

const result = verifyGovernanceManifestSignature(traceId);

if (!result.ok) {
  console.error(JSON.stringify({
    diagnostic: "trace-manifest-signature-verification",
    verified: false,
    ...result
  }, null, 2));

  process.exit(1);
}

console.log(JSON.stringify({
  diagnostic: "trace-manifest-signature-verification",
  verified: true,
  ...result
}, null, 2));