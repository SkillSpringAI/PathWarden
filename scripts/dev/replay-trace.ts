import { replayExecutionByTraceId } from "../../core/audit/executionReplay";

const traceId = process.argv[2];

if (!traceId) {
  console.error("Usage: npm run replay:trace -- <trace_id>");
  process.exit(1);
}

const replay = replayExecutionByTraceId(traceId);

const summary = {
  trace_id: replay.trace_id,
  authority_record_count: replay.authority.records.length,
  permission_token_ids: replay.authority.permission_token_records.map(
    (record) => record.token.token_id
  ),
  legitimacy_artifact_ids: replay.authority.legitimacy_artifact_records.map(
    (record) => record.artifact.artifact_id
  ),
  revoked_token_ids: replay.revoked_token_ids,
  authority_chain_hash_mismatches:
    replay.authority_chain_hash_mismatches,
  authority_record_hash_mismatches:
    replay.authority_record_hash_mismatches,
  authority_chain_continuity_breaks:
    replay.authority_chain_continuity_breaks,
  audit_event_count: replay.audit_events.length,
  audit_decision_codes: replay.audit_events.map(
    (event) => event.decision_code
  ),
  reconstructed_chain: replay.reconstructed_chain
};

console.log(JSON.stringify(summary, null, 2));
