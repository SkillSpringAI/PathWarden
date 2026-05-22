import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateCapabilityGrant } from "../../core/kernel/capabilityGrantValidator";
import { replayExecutionByTraceId } from "../../core/audit/executionReplay";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const revocationPath = resolve(
  process.cwd(),
  "policy",
  "authority",
  "permission-token-revocations.json"
);

const originalRevocations = readFileSync(revocationPath, "utf8");

try {
  const grant = validateCapabilityGrant({
    app_id: "skillspring-quantum",
    tool_id: "filesystem.requestMove",
    requested_risk_level: "high"
  });

  assert(grant.ok, "Expected capability grant to succeed");

  writeFileSync(
    revocationPath,
    JSON.stringify({
      schema_version: "permission-token-revocations.v1",
      revoked_tokens: [
        {
          token_id: grant.permission_token.token_id,
          revoked_at: new Date().toISOString(),
          reason: "Replay enrichment diagnostic"
        }
      ]
    }, null, 2),
    "utf8"
  );

  const replay = replayExecutionByTraceId(grant.permission_token.trace_id);

  assert(
    replay.revoked_token_ids.includes(grant.permission_token.token_id),
    "Expected replay to include revoked token ID"
  );

  assert(
    replay.reconstructed_chain.includes(`revoked_permission_token:${grant.permission_token.token_id}`),
    "Expected reconstructed chain to include revoked permission token"
  );

  console.log("Revocation replay enrichment diagnostic passed.");
}
finally {
  writeFileSync(revocationPath, originalRevocations, "utf8");
}
