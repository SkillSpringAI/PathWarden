import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { PermissionToken } from "../kernel/permissionToken";
import type { DecisionLegitimacyArtifact } from "../kernel/legitimacyArtifact";
import { sha256 } from "../common/hash";
// Authority records persist governance evidence to disk.
// They are later replayed to reconstruct permission and legitimacy lineage.

export type BaseAuthorityArtifactRecord =
  | {
      record_type: "permission_token";
      trace_id: string;
      timestamp: string;
      token: PermissionToken;
    }
  | {
      record_type: "legitimacy_artifact";
      trace_id: string;
      timestamp: string;
      artifact: DecisionLegitimacyArtifact;
    };

export type AuthorityArtifactRecord = BaseAuthorityArtifactRecord & {
  previous_authority_hash?: string;
  record_hash: string;
  record_hash_algorithm: "sha256";
};

function authorityDir(): string {
  return resolve(process.cwd(), "audit", "authority");
}

function authorityFilePath(timestamp: string): string {
  const date = timestamp.slice(0, 10);
  return resolve(authorityDir(), `${date}.jsonl`);
}
// Record hashes bind persisted authority data to its replay identity.
// Any mutation after write should be detectable during replay.

function hashAuthorityRecord(
  record: BaseAuthorityArtifactRecord & {
    previous_authority_hash?: string;
  }
): string {
  return sha256(JSON.stringify(record));
}

function readExistingAuthorityRecords(): AuthorityArtifactRecord[] {
  const dir = authorityDir();

  if (!existsSync(dir)) {
    return [];
  }

  const files = readdirSync(dir)
    .filter((file) => file.endsWith(".jsonl"))
    .map((file) => resolve(dir, file));

  const records: AuthorityArtifactRecord[] = [];

  for (const file of files) {
    const lines = readFileSync(file, "utf8")
      .split("\n")
      .filter(Boolean);

    for (const line of lines) {
      const record = JSON.parse(line) as AuthorityArtifactRecord;
      records.push(record);
    }
  }

  return records;
}
// Previous authority hashes create per-trace continuity.
// Chaining is trace-local so exports and replay remain portable.

function findPreviousAuthorityHash(traceId: string): string | undefined {
  const matchingRecords = readExistingAuthorityRecords()
    .filter((record) => record.trace_id === traceId)
    .filter((record) => typeof record.record_hash === "string");

  if (matchingRecords.length === 0) {
    return undefined;
  }

  return matchingRecords[matchingRecords.length - 1].record_hash;
}
// Writing authority artifacts is part of the governance evidence boundary.
// Each write appends a hash-linked record rather than mutable state.

export function writeAuthorityArtifact(
  record: BaseAuthorityArtifactRecord
): void {
  const dir = authorityDir();

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const previousAuthorityHash = findPreviousAuthorityHash(
    record.trace_id
  );

  const chainRecord = {
    ...record,
    previous_authority_hash: previousAuthorityHash
  };

  const fullRecord: AuthorityArtifactRecord = {
    ...chainRecord,
    record_hash: hashAuthorityRecord(chainRecord),
    record_hash_algorithm: "sha256"
  };

  appendFileSync(
    authorityFilePath(record.timestamp),
    JSON.stringify(fullRecord) + "\n",
    "utf8"
  );
}
