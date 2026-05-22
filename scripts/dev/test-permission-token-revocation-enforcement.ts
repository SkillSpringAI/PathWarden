import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { mintPermissionToken } from "../../core/kernel/permissionTokenBuilder";
import { validatePermissionTokenForAction } from "../../core/kernel/permissionTokenValidator";

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
  const traceId = `trace_revocation_enforcement_${Date.now()}`;

  const token = mintPermissionToken({
    trace_id: traceId,
    app_id: "skillspring-quantum",
    tool_id: "filesystem.requestMove",
    granted_operations: ["filesystem.requestMove"],
    risk_ceiling: "high",
    requires_approval: true,
    issuer: "pathwarden-kernel",
    expires_at: "2030-01-01T00:00:00.000Z"
  });

  writeFileSync(
    revocationPath,
    JSON.stringify({
      schema_version: "permission-token-revocations.v1",
      revoked_tokens: [
        {
          token_id: token.token_id,
          revoked_at: new Date().toISOString(),
          reason: "Diagnostic revocation"
        }
      ]
    }, null, 2),
    "utf8"
  );

  const result = validatePermissionTokenForAction(
    token,
    {
      type: "filesystem",
      operation: "move",
      selector: {
        path: "C:\\Users\\Laptop\\Documents\\source.txt"
      },
      destination: {
        path: "C:\\Users\\Laptop\\Documents\\dest.txt"
      }
    },
    traceId
  );

  assert(!result.ok, "Expected revoked token to be refused");
  assert(
    result.decision_code === "REFUSE_PERMISSION_TOKEN_REVOKED",
    "Expected revoked token refusal decision"
  );
  assert(
    result.trigger_hits.includes("permission_token_revoked"),
    "Expected revoked token trigger hit"
  );

  console.log("Permission token revocation enforcement diagnostic passed.");
}
finally {
  writeFileSync(revocationPath, originalRevocations, "utf8");
}
