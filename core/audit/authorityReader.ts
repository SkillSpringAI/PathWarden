import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { AuthorityArtifactRecord } from "./authorityWriter";
import {
  getSchemaValidator,
  formatAjvErrors
} from "../common/schemaValidator";

export interface AuthorityReplayResult {
  trace_id: string;
  records: AuthorityArtifactRecord[];
  permission_token_records: Extract<AuthorityArtifactRecord, { record_type: "permission_token" }>[];
  legitimacy_artifact_records: Extract<AuthorityArtifactRecord, { record_type: "legitimacy_artifact" }>[];
}

function authorityDir(): string {
  return resolve(process.cwd(), "audit", "authority");
}
// Authority replay must validate persisted records before use.
// Replay should never trust JSONL authority artifacts just because
// they exist on disk.

const permissionTokenValidator = getSchemaValidator(
  "schemas/authority/permission-token.schema.json"
);

const legitimacyArtifactValidator = getSchemaValidator(
  "schemas/authority/decision-legitimacy-artifact.schema.json"
);
// Fail closed on malformed authority records.
// A corrupted permission token or legitimacy artifact must not enter replay state.

function validateAuthorityRecord(
  record: AuthorityArtifactRecord,
  sourceFile: string
): void {

  if (record.record_type === "permission_token") {

    const valid = permissionTokenValidator(record.token);

    if (!valid) {
      throw new Error(
        `Invalid permission token record in ${sourceFile}: ` +
        formatAjvErrors(permissionTokenValidator.errors)
      );
    }

    return;
  }

  if (record.record_type === "legitimacy_artifact") {

    const valid = legitimacyArtifactValidator(record.artifact);

    if (!valid) {
      throw new Error(
        `Invalid legitimacy artifact record in ${sourceFile}: ` +
        formatAjvErrors(legitimacyArtifactValidator.errors)
      );
    }

    return;
  }

  throw new Error(
    `Unknown authority record type in ${sourceFile}`
  );
}
// Validate only records belonging to the requested trace.
// This preserves backward compatibility with older unrelated records
// while still enforcing strict validation for the replayed trace.

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
        validateAuthorityRecord(record, file);
        records.push(record);
      }
    }
// Grouped records provide replay consumers with typed authority views:
// raw records, permission token records, and legitimacy artifact records.

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
