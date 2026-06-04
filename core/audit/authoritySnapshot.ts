import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { AuthorityArtifactRecord } from "./authorityWriter";
import {
  formatAjvErrors,
  getSchemaValidator
} from "../common/schemaValidator";

export interface AuthoritySnapshotRecord {
  record_type: AuthorityArtifactRecord["record_type"];
  trace_id: string;
  timestamp: string;
  record_hash: string;
  record_hash_algorithm: "sha256";
  previous_authority_hash?: string;
}

export interface AuthoritySnapshot {
  schema_version: "authority-snapshot.v1";
  snapshot_id: string;
  created_at: string;
  source: {
    runtime: "pathwarden";
    environment: string;
  };
  authority: {
    record_count: number;
    records: AuthoritySnapshotRecord[];
  };
  trust: {
    manifest_id: string | null;
    signers: object[];
  };
  revocation: {
    checked: boolean;
    revoked_signers: string[];
  };
  governance: {
    policy_refs: string[];
    trigger_refs: string[];
  };
  replay: {
    replay_safe: boolean;
    baseline_eligible: boolean;
    notes: string[];
  };
}

function authorityDir(): string {
  return resolve(process.cwd(), "audit", "authority");
}

function readAllAuthorityRecords(): AuthorityArtifactRecord[] {
  const dir = authorityDir();

  if (!existsSync(dir)) {
    return [];
  }

  const files = readdirSync(dir)
    .filter((file) => file.endsWith(".jsonl"))
    .sort()
    .map((file) => resolve(dir, file));

  const records: AuthorityArtifactRecord[] = [];

  for (const file of files) {
    const lines = readFileSync(file, "utf8")
      .split("\n")
      .filter(Boolean);

    for (const line of lines) {
      records.push(JSON.parse(line) as AuthorityArtifactRecord);
    }
  }

  return records;
}

function toSnapshotRecord(
  record: AuthorityArtifactRecord
): AuthoritySnapshotRecord {
  const snapshotRecord: AuthoritySnapshotRecord = {
    record_type: record.record_type,
    trace_id: record.trace_id,
    timestamp: record.timestamp,
    record_hash: record.record_hash,
    record_hash_algorithm: record.record_hash_algorithm
  };

  if (record.previous_authority_hash) {
    snapshotRecord.previous_authority_hash = record.previous_authority_hash;
  }

  return snapshotRecord;
}

function compareSnapshotRecords(
  left: AuthoritySnapshotRecord,
  right: AuthoritySnapshotRecord
): number {
  return (
    left.timestamp.localeCompare(right.timestamp) ||
    left.trace_id.localeCompare(right.trace_id) ||
    left.record_type.localeCompare(right.record_type) ||
    left.record_hash.localeCompare(right.record_hash)
  );
}

function createSnapshotId(createdAt: string): string {
  const safeTimestamp = createdAt
    .replace(/[^0-9A-Za-z]/g, "")
    .slice(0, 20);

  return `authsnap_${safeTimestamp}`;
}

export function buildAuthoritySnapshot(
  createdAt = new Date().toISOString()
): AuthoritySnapshot {
  const records = readAllAuthorityRecords()
    .map(toSnapshotRecord)
    .sort(compareSnapshotRecords);

  return {
    schema_version: "authority-snapshot.v1",
    snapshot_id: createSnapshotId(createdAt),
    created_at: createdAt,
    source: {
      runtime: "pathwarden",
      environment: "local"
    },
    authority: {
      record_count: records.length,
      records
    },
    trust: {
      manifest_id: null,
      signers: []
    },
    revocation: {
      checked: true,
      revoked_signers: []
    },
    governance: {
      policy_refs: [],
      trigger_refs: []
    },
    replay: {
      replay_safe: true,
      baseline_eligible: true,
      notes: [
        "Initial authority snapshot implementation uses authority metadata only.",
        "Trust and governance references are placeholders pending later milestones."
      ]
    }
  };
}

export function validateAuthoritySnapshot(
  snapshot: AuthoritySnapshot
): void {
  const validator = getSchemaValidator(
    "schemas/audit/authority-snapshot.schema.json"
  );

  const valid = validator(snapshot);

  if (!valid) {
    throw new Error(
      "Invalid authority snapshot: " +
      formatAjvErrors(validator.errors)
    );
  }
}
