import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { AuditEvent } from "./auditTypes";
import { readAuthorityRecordsByTraceId } from "./authorityReader";
import type { AuthorityReplayResult } from "./authorityReader";

export interface ExecutionReplayResult {
  trace_id: string;
  authority: AuthorityReplayResult;
  audit_events: AuditEvent[];
  reconstructed_chain: string[];
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

function buildReconstructedChain(
  authority: AuthorityReplayResult,
  auditEvents: AuditEvent[]
): string[] {
  const chain: string[] = [];

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

  return {
    trace_id: traceId,
    authority,
    audit_events: auditEvents,
    reconstructed_chain: buildReconstructedChain(authority, auditEvents)
  };
}

