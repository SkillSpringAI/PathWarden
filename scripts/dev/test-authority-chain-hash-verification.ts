import { replayExecutionByTraceId } from "../../core/audit/executionReplay";
import { readAuthorityRecordsByTraceId } from "../../core/audit/authorityReader";

function findUsableTraceId(): string | undefined {
  const candidates = [
    "trace_capability_1779758646071",
    "trace_capability_1779758646096"
  ];

  for (const traceId of candidates) {
    const authority = readAuthorityRecordsByTraceId(traceId);

    if (authority.legitimacy_artifact_records.length > 0) {
      return traceId;
    }
  }

  return undefined;
}

const traceId = process.argv[2] ?? findUsableTraceId();

if (!traceId) {
  console.error("No trace ID provided and no usable trace found.");
  process.exit(1);
}

const authority = readAuthorityRecordsByTraceId(traceId);

if (authority.legitimacy_artifact_records.length === 0) {
  console.error("No legitimacy artifacts found for trace.");
  process.exit(1);
}

const replay = replayExecutionByTraceId(traceId);

if (replay.authority_chain_hash_mismatches.length > 0) {
  console.error(JSON.stringify({
    ok: false,
    trace_id: traceId,
    authority_chain_hash_mismatches: replay.authority_chain_hash_mismatches
  }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  diagnostic: "authority-chain-hash-verification",
  trace_id: traceId,
  legitimacy_artifact_count: authority.legitimacy_artifact_records.length,
  authority_chain_hash_mismatches: replay.authority_chain_hash_mismatches
}, null, 2));