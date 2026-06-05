import {
  formatAjvErrors,
  getSchemaValidator
} from "../common/schemaValidator";
import { sha256 } from "../common/hash";
import { replayExecutionByTraceId } from "./executionReplay";
import type { ExecutionReplayResult } from "./executionReplay";
import type { AuthorityArtifactRecord } from "./authorityWriter";

export interface ReplayBaselineAuthorityRef {
  record_type: AuthorityArtifactRecord["record_type"];
  trace_id: string;
  timestamp: string;
  record_hash: string;
  record_hash_algorithm: "sha256";
}

export interface ReplayBaselineExecutionRef {
  event_id: string;
  timestamp: string;
  decision_code: string;
}

export interface ReplayBaseline {
  schema_version: "replay-baseline.v1";
  baseline_id: string;
  created_at: string;
  source: {
    runtime: "pathwarden";
    environment: string;
  };
  authority: {
    snapshot_id: string | null;
    record_count: number;
    record_refs: ReplayBaselineAuthorityRef[];
  };
  execution: {
    trace_id: string;
    record_count: number;
    record_refs: ReplayBaselineExecutionRef[];
    reconstructed_chain_hash: string;
    reconstructed_chain_hash_algorithm: "sha256";
  };
  trust: {
    manifest_id: string | null;
    signer_refs: string[];
  };
  revocation: {
    checked: boolean;
    summary: string[];
  };
  governance: {
    policy_refs: string[];
    trigger_refs: string[];
  };
  replay: {
    baseline_safe: boolean;
    diff_eligible: boolean;
    authority_chain_hash_mismatches: string[];
    authority_record_hash_mismatches: string[];
    authority_chain_continuity_breaks: string[];
    notes: string[];
  };
}

function legacyAuthorityRecordHash(record: AuthorityArtifactRecord): string {
  return sha256(JSON.stringify({
    record_type: record.record_type,
    trace_id: record.trace_id,
    timestamp: record.timestamp
  }));
}

function toAuthorityRef(
  record: AuthorityArtifactRecord
): ReplayBaselineAuthorityRef {
  const recordHash = typeof record.record_hash === "string"
    ? record.record_hash
    : legacyAuthorityRecordHash(record);

  const recordHashAlgorithm = record.record_hash_algorithm === "sha256"
    ? record.record_hash_algorithm
    : "sha256";

  return {
    record_type: record.record_type,
    trace_id: record.trace_id,
    timestamp: record.timestamp,
    record_hash: recordHash,
    record_hash_algorithm: recordHashAlgorithm
  };
}

function compareAuthorityRefs(
  left: ReplayBaselineAuthorityRef,
  right: ReplayBaselineAuthorityRef
): number {
  return (
    left.timestamp.localeCompare(right.timestamp) ||
    left.trace_id.localeCompare(right.trace_id) ||
    left.record_type.localeCompare(right.record_type) ||
    left.record_hash.localeCompare(right.record_hash)
  );
}

function toExecutionRef(
  event: ExecutionReplayResult["audit_events"][number]
): ReplayBaselineExecutionRef {
  return {
    event_id: event.event_id,
    timestamp: event.timestamp,
    decision_code: event.decision_code
  };
}

function compareExecutionRefs(
  left: ReplayBaselineExecutionRef,
  right: ReplayBaselineExecutionRef
): number {
  return (
    left.timestamp.localeCompare(right.timestamp) ||
    left.event_id.localeCompare(right.event_id) ||
    left.decision_code.localeCompare(right.decision_code)
  );
}

function createBaselineId(traceId: string, createdAt: string): string {
  const safeTraceId = traceId.replace(/[^0-9A-Za-z_-]/g, "").slice(0, 48);
  const safeTimestamp = createdAt
    .replace(/[^0-9A-Za-z]/g, "")
    .slice(0, 20);

  return `replaybase_${safeTraceId}_${safeTimestamp}`;
}

function isBaselineSafe(replay: ExecutionReplayResult): boolean {
  return (
    replay.authority_chain_hash_mismatches.length === 0 &&
    replay.authority_record_hash_mismatches.length === 0 &&
    replay.authority_chain_continuity_breaks.length === 0
  );
}

export function buildReplayBaseline(
  traceId: string,
  createdAt = new Date().toISOString()
): ReplayBaseline {
  const replay = replayExecutionByTraceId(traceId);

  const authorityRefs = replay.authority.records
    .map(toAuthorityRef)
    .sort(compareAuthorityRefs);

  const executionRefs = replay.audit_events
    .map(toExecutionRef)
    .sort(compareExecutionRefs);

  const baselineSafe = isBaselineSafe(replay);

  return {
    schema_version: "replay-baseline.v1",
    baseline_id: createBaselineId(traceId, createdAt),
    created_at: createdAt,
    source: {
      runtime: "pathwarden",
      environment: "local"
    },
    authority: {
      snapshot_id: null,
      record_count: authorityRefs.length,
      record_refs: authorityRefs
    },
    execution: {
      trace_id: replay.trace_id,
      record_count: executionRefs.length,
      record_refs: executionRefs,
      reconstructed_chain_hash: sha256(JSON.stringify(replay.reconstructed_chain)),
      reconstructed_chain_hash_algorithm: "sha256"
    },
    trust: {
      manifest_id: null,
      signer_refs: []
    },
    revocation: {
      checked: true,
      summary: replay.revoked_token_ids
    },
    governance: {
      policy_refs: [],
      trigger_refs: []
    },
    replay: {
      baseline_safe: baselineSafe,
      diff_eligible: baselineSafe,
      authority_chain_hash_mismatches: replay.authority_chain_hash_mismatches,
      authority_record_hash_mismatches: replay.authority_record_hash_mismatches,
      authority_chain_continuity_breaks: replay.authority_chain_continuity_breaks,
      notes: [
        "Initial replay baseline implementation stores metadata references only.",
        "Authority snapshot, trust, and governance references are placeholders pending later milestones.",
        "Replay baselines are not executable."
      ]
    }
  };
}

export function validateReplayBaseline(
  baseline: ReplayBaseline
): void {
  const validator = getSchemaValidator(
    "schemas/audit/replay-baseline.schema.json"
  );

  const valid = validator(baseline);

  if (!valid) {
    throw new Error(
      "Invalid replay baseline: " +
      formatAjvErrors(validator.errors)
    );
  }
}
