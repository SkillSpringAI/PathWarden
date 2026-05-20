import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { AuthorityArtifactRecord } from "./authorityWriter";

export interface AuthorityReplayResult {
  trace_id: string;
  records: AuthorityArtifactRecord[];
  permission_token_records: Extract<AuthorityArtifactRecord, { record_type: "permission_token" }>[];
  legitimacy_artifact_records: Extract<AuthorityArtifactRecord, { record_type: "legitimacy_artifact" }>[];
}

function authorityDir(): string {
  return resolve(process.cwd(), "audit", "authority");
}

export function readAuthorityRecordsByTraceId(traceId: string): AuthorityReplayResult {
  const dir = authorityDir();

  if (!existsSync(dir)) {
    return {
      trace_id: traceId,
      records: [],
      permission_token_records: [],
      legitimacy_artifact_records: []
    };
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

      if (record.trace_id === traceId) {
        records.push(record);
      }
    }
  }

  return {
    trace_id: traceId,
    records,
    permission_token_records: records.filter(
      (record): record is Extract<AuthorityArtifactRecord, { record_type: "permission_token" }> =>
        record.record_type === "permission_token"
    ),
    legitimacy_artifact_records: records.filter(
      (record): record is Extract<AuthorityArtifactRecord, { record_type: "legitimacy_artifact" }> =>
        record.record_type === "legitimacy_artifact"
    )
  };
}
