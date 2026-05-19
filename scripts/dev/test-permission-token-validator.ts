import { mintPermissionToken } from "../../core/kernel/permissionTokenBuilder";
import { validatePermissionTokenForAction } from "../../core/kernel/permissionTokenValidator";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const traceId = `trace_token_validator_${Date.now()}`;

const moveAction = {
  type: "filesystem" as const,
  operation: "move" as const,
  selector: {
    path: "C:\\Users\\Laptop\\Documents\\source.txt"
  },
  destination: {
    path: "C:\\Users\\Laptop\\Documents\\dest.txt"
  }
};

const validToken = mintPermissionToken({
  trace_id: traceId,
  app_id: "skillspring-quantum",
  tool_id: "filesystem.requestMove",
  granted_operations: ["filesystem.requestMove"],
  risk_ceiling: "high",
  requires_approval: true,
  issuer: "pathwarden-kernel",
  expires_at: "2030-01-01T00:00:00.000Z"
});

const allowed = validatePermissionTokenForAction(validToken, moveAction, traceId);

assert(allowed.ok, "Expected valid token to allow move action");

const missing = validatePermissionTokenForAction(undefined, moveAction, traceId);

assert(!missing.ok, "Expected missing token to be refused");
assert(missing.decision_code === "REFUSE_PERMISSION_TOKEN_MISSING", "Expected missing token refusal");

const wrongScopeToken = {
  ...validToken,
  granted_operations: ["filesystem.requestCopy"]
};

const wrongScope = validatePermissionTokenForAction(wrongScopeToken, moveAction, traceId);

assert(!wrongScope.ok, "Expected wrong scope token to be refused");
assert(wrongScope.decision_code === "REFUSE_PERMISSION_TOKEN_SCOPE", "Expected scope refusal");

const wrongTraceToken = {
  ...validToken,
  trace_id: "trace_wrong"
};

const wrongTrace = validatePermissionTokenForAction(wrongTraceToken, moveAction, traceId);

assert(!wrongTrace.ok, "Expected wrong trace token to be refused");
assert(wrongTrace.decision_code === "REFUSE_PERMISSION_TOKEN_TRACE", "Expected trace refusal");

console.log("Permission token validator diagnostic passed.");
