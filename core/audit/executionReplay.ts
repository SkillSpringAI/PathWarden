import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { AuditEvent } from "./auditTypes";
import { readAuthorityRecordsByTraceId } from "./authorityReader";
import type { AuthorityReplayResult } from "./authorityReader";
import { loadPermissionTokenRevocations } from "../kernel/permissionTokenRevocation";
import { hashAuthorityChain, sha256 } from "../common/hash";

export interface ExecutionReplayResult {
  trace_id: string;
  authority: AuthorityReplayResult;
  audit_events: AuditEvent[];
  reconstructed_chain: string[];
  revoked_token_ids: string[];
  authority_chain_hash_mismatches: string[];
  authority_record_hash_mismatches: string[];
  authority_chain_continuity_breaks: string[];
}

function auditEventsDir(): string {
  return resolve(process.cwd(), "audit", "events");
}

function readAuditEventsByTraceId(traceId: string): AuditEvent[] {
  const dir = auditEventsDir();

  if (!existsSync(dir)) {
    return [];
  }

  const files = readdirSync(dir)
    .filter((file) => file.endsWith(".jsonl"))
    .map((file) => resolve(dir, file));

  const events: AuditEvent[] = [];

  for (const file of files) {
    const lines = readFileSync(file, "utf8")
      .split("\n")
      .filter(Boolean);

    for (const line of lines) {
      const event = JSON.parse(line) as AuditEvent;

      if (event.trace_id === traceId) {
        events.push(event);
      }
    }
  }

  return events;
}

function findRevokedTokenIds(authority: AuthorityReplayResult): string[] {
  const revocations = loadPermissionTokenRevocations();
  const revokedIds = new Set(
    revocations.revoked_tokens.map((entry) => entry.token_id)
  );

  return authority.permission_token_records
    .map((record) => record.token.token_id)
    .filter((tokenId) => revokedIds.has(tokenId));
}

function findAuthorityChainHashMismatches(
  authority: AuthorityReplayResult
): string[] {
  const mismatches: string[] = [];

  for (const artifactRecord of authority.legitimacy_artifact_records) {
    const artifact = artifactRecord.artifact;

    const recomputedHash = hashAuthorityChain(
      artifact.authority_chain
    );

    if (recomputedHash !== artifact.authority_chain_hash) {
      mismatches.push(artifact.artifact_id);
    }
  }

  return mismatches;
}

function recordIdentity(record: { record_type: string; timestamp: string }): string {
  return `${record.record_type}:${record.timestamp}`;
}

function recomputeAuthorityRecordHash(record: Record<string, unknown>): string {
  const {
    record_hash,
    record_hash_algorithm,
    ...hashInput
  } = record;

  void record_hash;
  void record_hash_algorithm;

  return sha256(JSON.stringify(hashInput));
}

function findAuthorityRecordHashMismatches(
  authority: AuthorityReplayResult
): string[] {
  const mismatches: string[] = [];

  for (const record of authority.records) {
    const recordWithHash = record as unknown as Record<string, unknown>;
    const storedHash = recordWithHash.record_hash;

    if (typeof storedHash !== "string") {
      continue;
    }

    const recomputedHash = recomputeAuthorityRecordHash(recordWithHash);

    if (recomputedHash !== storedHash) {
      mismatches.push(recordIdentity(record));
    }
  }

  return mismatches;
}

function findAuthorityChainContinuityBreaks(
  authority: AuthorityReplayResult
): string[] {
  const breaks: string[] = [];
  let previousHash: string | undefined;

  for (const record of authority.records) {
    const recordWithHash = record as unknown as Record<string, unknown>;
    const storedHash = recordWithHash.record_hash;
    const declaredPreviousHash = recordWithHash.previous_authority_hash;

    if (typeof storedHash !== "string") {
      previousHash = undefined;
      continue;
    }

    if (
      previousHash &&
      declaredPreviousHash !== previousHash
    ) {
      breaks.push(recordIdentity(record));
    }

    previousHash = storedHash;
  }

  return breaks;
}

function buildReconstructedChain(
  authority: AuthorityReplayResult,
  auditEvents: AuditEvent[],
  revokedTokenIds: string[],
  authorityChainHashMismatches: string[],
  authorityRecordHashMismatches: string[],
  authorityChainContinuityBreaks: string[]
): string[] {
  const chain: string[] = [];

  for (const artifactId of authorityChainHashMismatches) {
    chain.push(`authority_chain_hash_mismatch:${artifactId}`);
  }

  for (const recordId of authorityRecordHashMismatches) {
    chain.push(`authority_record_hash_mismatch:${recordId}`);
  }

  for (const recordId of authorityChainContinuityBreaks) {
    chain.push(`authority_chain_continuity_break:${recordId}`);
  }

  for (const tokenId of revokedTokenIds) {
    chain.push(`revoked_permission_token:${tokenId}`);
  }

  for (const tokenRecord of authority.permission_token_records) {
    chain.push(`permission_token:${tokenRecord.token.token_id}`);
  }

  for (const artifactRecord of authority.legitimacy_artifact_records) {
    chain.push(`legitimacy_artifact:${artifactRecord.artifact.artifact_id}`);

    for (const authorityStep of artifactRecord.artifact.authority_chain) {
      chain.push(`authority_step:${authorityStep}`);
    }
  }

  for (const event of auditEvents) {
    chain.push(`audit_event:${event.decision_code}`);

    if (event.permission_token_id) {
      chain.push(`audit_permission_token:${event.permission_token_id}`);
    }

    if (event.legitimacy_artifact_id) {
      chain.push(`audit_legitimacy_artifact:${event.legitimacy_artifact_id}`);
    }

    if (event.authority_chain) {
      for (const authorityStep of event.authority_chain) {
        chain.push(`audit_authority_step:${authorityStep}`);
      }
    }
  }

  return chain;
}

export function replayExecutionByTraceId(traceId: string): ExecutionReplayResult {
  const authority = readAuthorityRecordsByTraceId(traceId);
  const auditEvents = readAuditEventsByTraceId(traceId);
  const revokedTokenIds = findRevokedTokenIds(authority);
  const authorityChainHashMismatches =
    findAuthorityChainHashMismatches(authority);
  const authorityRecordHashMismatches =
    findAuthorityRecordHashMismatches(authority);
  const authorityChainContinuityBreaks =
    findAuthorityChainContinuityBreaks(authority);

  return {
    trace_id: traceId,
    authority,
    audit_events: auditEvents,
    reconstructed_chain: buildReconstructedChain(
      authority,
      auditEvents,
      revokedTokenIds,
      authorityChainHashMismatches,
      authorityRecordHashMismatches,
      authorityChainContinuityBreaks
    ),
    revoked_token_ids: revokedTokenIds,
    authority_chain_hash_mismatches: authorityChainHashMismatches,
    authority_record_hash_mismatches: authorityRecordHashMismatches,
    authority_chain_continuity_breaks: authorityChainContinuityBreaks
  };
}