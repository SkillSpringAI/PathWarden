import {
  formatAjvErrors,
  getSchemaValidator
} from "../common/schemaValidator";
import type {
  AuthoritySnapshot,
  AuthoritySnapshotRecord
} from "./authoritySnapshot";

export interface AuthorityExportVerification {
  schema_version: "authority-export-verification.v1";
  verification_id: string;
  created_at: string;
  target: {
    artifact_type: "authority_snapshot";
    artifact_id: string;
    source: string | null;
  };
  checks: {
    schema_valid: boolean;
    required_fields_present: boolean;
    record_count_valid: boolean;
    record_refs_valid: boolean;
    deterministic_ordering: boolean;
    trust_context_present: boolean;
    revocation_context_checked: boolean;
    replay_safe: boolean;
    secret_leakage_detected: boolean;
  };
  summary: {
    status:
      | "verified"
      | "verified_with_warnings"
      | "failed"
      | "invalid_target"
      | "incomplete_context"
      | "not_replay_safe"
      | "not_admissible";
    severity: "none" | "info" | "warning" | "critical";
    admissible: boolean;
    notes: string[];
  };
}

const SECRET_KEY_PATTERNS = [
  "private_key",
  "secret",
  "password",
  "seed",
  "mnemonic",
  "api_key",
  "access_token",
  "refresh_token",
  "bearer_token"
];

function createVerificationId(
  artifactId: string,
  createdAt: string
): string {
  const safeArtifactId = artifactId
    .replace(/[^0-9A-Za-z_-]/g, "")
    .slice(0, 64);

  const safeTimestamp = createdAt
    .replace(/[^0-9A-Za-z]/g, "")
    .slice(0, 20);

  return `authexportver_${safeArtifactId}_${safeTimestamp}`;
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

function hasDeterministicOrdering(
  records: AuthoritySnapshotRecord[]
): boolean {
  const sorted = [...records].sort(compareSnapshotRecords);

  return records.every((record, index) => {
    const expected = sorted[index];

    return (
      record.timestamp === expected.timestamp &&
      record.trace_id === expected.trace_id &&
      record.record_type === expected.record_type &&
      record.record_hash === expected.record_hash
    );
  });
}

function hasValidRecordRefs(records: AuthoritySnapshotRecord[]): boolean {
  return records.every((record) => (
    typeof record.record_type === "string" &&
    typeof record.trace_id === "string" &&
    typeof record.timestamp === "string" &&
    typeof record.record_hash === "string" &&
    record.record_hash.length === 64 &&
    record.record_hash_algorithm === "sha256"
  ));
}

function detectSecretLeakage(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => detectSecretLeakage(item));
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).some(
      ([key, nestedValue]) => {
        const normalizedKey = key.toLowerCase();

        return (
          SECRET_KEY_PATTERNS.some((pattern) =>
            normalizedKey.includes(pattern)
          ) ||
          detectSecretLeakage(nestedValue)
        );
      }
    );
  }

  return false;
}

function validateSnapshotSchema(snapshot: AuthoritySnapshot): boolean {
  const validator = getSchemaValidator(
    "schemas/audit/authority-snapshot.schema.json"
  );

  return Boolean(validator(snapshot));
}

function buildNotes(
  verification: Omit<AuthorityExportVerification, "summary">
): string[] {
  const notes: string[] = [];

  if (!verification.checks.schema_valid) {
    notes.push("Authority snapshot failed schema validation.");
  }

  if (!verification.checks.record_count_valid) {
    notes.push("Authority snapshot record_count does not match records length.");
  }

  if (!verification.checks.record_refs_valid) {
    notes.push("Authority snapshot contains invalid record references.");
  }

  if (!verification.checks.deterministic_ordering) {
    notes.push("Authority snapshot records are not deterministically ordered.");
  }

  if (!verification.checks.trust_context_present) {
    notes.push("Authority snapshot trust context is missing.");
  }

  if (!verification.checks.revocation_context_checked) {
    notes.push("Authority snapshot revocation context was not checked.");
  }

  if (!verification.checks.replay_safe) {
    notes.push("Authority snapshot is not replay-safe.");
  }

  if (verification.checks.secret_leakage_detected) {
    notes.push("Authority snapshot contains secret-like strings.");
  }

  if (notes.length === 0) {
    notes.push("Authority snapshot export verified.");
  }

  return notes;
}

function buildSummary(
  verification: Omit<AuthorityExportVerification, "summary">
): AuthorityExportVerification["summary"] {
  const notes = buildNotes(verification);

  if (verification.checks.secret_leakage_detected) {
    return {
      status: "not_admissible",
      severity: "critical",
      admissible: false,
      notes
    };
  }

  if (!verification.checks.schema_valid) {
    return {
      status: "failed",
      severity: "critical",
      admissible: false,
      notes
    };
  }

  if (
    !verification.checks.required_fields_present ||
    !verification.checks.record_count_valid ||
    !verification.checks.record_refs_valid ||
    !verification.checks.deterministic_ordering
  ) {
    return {
      status: "failed",
      severity: "critical",
      admissible: false,
      notes
    };
  }

  if (!verification.checks.replay_safe) {
    return {
      status: "not_replay_safe",
      severity: "critical",
      admissible: false,
      notes
    };
  }

  if (
    !verification.checks.trust_context_present ||
    !verification.checks.revocation_context_checked
  ) {
    return {
      status: "incomplete_context",
      severity: "warning",
      admissible: false,
      notes
    };
  }

  return {
    status: "verified",
    severity: "none",
    admissible: true,
    notes
  };
}

export function verifyAuthoritySnapshotExport(
  snapshot: AuthoritySnapshot,
  source: string | null = null,
  createdAt = new Date().toISOString()
): AuthorityExportVerification {
  const partial: Omit<AuthorityExportVerification, "summary"> = {
    schema_version: "authority-export-verification.v1",
    verification_id: createVerificationId(snapshot.snapshot_id, createdAt),
    created_at: createdAt,
    target: {
      artifact_type: "authority_snapshot",
      artifact_id: snapshot.snapshot_id,
      source
    },
    checks: {
      schema_valid: validateSnapshotSchema(snapshot),
      required_fields_present: Boolean(
        snapshot.schema_version &&
        snapshot.snapshot_id &&
        snapshot.created_at &&
        snapshot.authority &&
        snapshot.trust &&
        snapshot.revocation &&
        snapshot.governance &&
        snapshot.replay
      ),
      record_count_valid:
        snapshot.authority.record_count === snapshot.authority.records.length,
      record_refs_valid:
        hasValidRecordRefs(snapshot.authority.records),
      deterministic_ordering:
        hasDeterministicOrdering(snapshot.authority.records),
      trust_context_present:
        Boolean(snapshot.trust) &&
        Array.isArray(snapshot.trust.signers),
      revocation_context_checked:
        snapshot.revocation.checked === true,
      replay_safe:
        snapshot.replay.replay_safe === true,
      secret_leakage_detected:
        detectSecretLeakage(snapshot)
    }
  };

  return {
    ...partial,
    summary: buildSummary(partial)
  };
}

export function validateAuthorityExportVerification(
  verification: AuthorityExportVerification
): void {
  const validator = getSchemaValidator(
    "schemas/audit/authority-export-verification.schema.json"
  );

  const valid = validator(verification);

  if (!valid) {
    throw new Error(
      "Invalid authority export verification: " +
      formatAjvErrors(validator.errors)
    );
  }
}
