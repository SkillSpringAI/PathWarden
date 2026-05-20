import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateCapabilityGrant } from "../../core/kernel/capabilityGrantValidator";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const result = validateCapabilityGrant({
  app_id: "skillspring-quantum",
  tool_id: "filesystem.requestMove",
  requested_risk_level: "high"
});

assert(result.ok, "Expected capability grant to succeed");

const traceId = result.permission_token.trace_id;
const today = new Date().toISOString().slice(0, 10);

const authorityPath = resolve(
  process.cwd(),
  "audit",
  "authority",
  `${today}.jsonl`
);

assert(existsSync(authorityPath), "Expected authority audit file to exist");

const records = readFileSync(authorityPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .filter((record) => record.trace_id === traceId);

assert(records.length >= 2, "Expected persisted authority records for trace_id");
assert(records.some((record) => record.record_type === "permission_token"), "Expected persisted permission token");
assert(records.some((record) => record.record_type === "legitimacy_artifact"), "Expected persisted legitimacy artifact");

console.log("Capability authority persistence diagnostic passed.");
