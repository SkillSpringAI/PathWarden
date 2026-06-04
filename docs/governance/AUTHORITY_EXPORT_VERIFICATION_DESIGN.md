# Authority Export Verification Design

## Purpose

Authority export verification defines how PathWarden checks that exported authority artifacts are complete, valid, replay-safe, and governance-admissible.

It is intended to support:

```text
authority export integrity
authority replay confidence
snapshot verification
trust-context verification
revocation-context verification
future replay provenance reports
future federation readiness

Authority export verification is not an execution command.

It is a validation process.

Current Milestone

This document covers design only.

No runtime implementation is introduced by this milestone.

Problem Statement

PathWarden already supports authority persistence, authority replay, execution replay, trust validation, and design coverage for:

authority snapshots
replay baselines
replay diffs

However, exported authority artifacts need explicit verification rules.

Without export verification, PathWarden can generate or store authority-related records, but cannot yet formally answer:

is this authority export complete
is this authority export schema-valid
is this authority export replay-safe
is this authority export trust-aware
is this authority export revocation-aware
is this authority export admissible as governance evidence
Design Goals

Authority export verification should be:

deterministic
schema-validating
read-only
trust-aware
revocation-aware
replay-aware
secret-safe
diagnostic-friendly
future-compatible with federation
Non-Goals

Authority export verification should not:

grant authority
modify authority records
modify trust manifests
modify replay baselines
modify authority snapshots
execute filesystem actions
auto-repair invalid authority exports
hide verification failures
Verification Boundary

Authority export verification checks authority export artifacts.

Included checks:

schema version check
required field check
authority record count check
authority record reference check
deterministic ordering check
trust context check
signer lifecycle context check
revocation context check
replay safety check
secret leakage check
governance admissibility summary

Excluded checks:

private key validation
live external trust lookup
filesystem action execution
full policy hashing
federation runtime validation
distributed authority validation
Proposed Verification Shape
{
  "schema_version": "authority-export-verification.v1",
  "verification_id": "authexportver_...",
  "created_at": "2026-06-05T00:00:00.000Z",
  "target": {
    "artifact_type": "authority_snapshot",
    "artifact_id": "authsnap_...",
    "source": null
  },
  "checks": {
    "schema_valid": true,
    "required_fields_present": true,
    "record_count_valid": true,
    "record_refs_valid": true,
    "deterministic_ordering": true,
    "trust_context_present": true,
    "revocation_context_checked": true,
    "replay_safe": true,
    "secret_leakage_detected": false
  },
  "summary": {
    "status": "verified",
    "severity": "none",
    "admissible": true,
    "notes": []
  }
}
Verification Status Values

Recommended status values:

verified
verified_with_warnings
failed
invalid_target
incomplete_context
not_replay_safe
not_admissible
Severity Values

Recommended severity values:

none
info
warning
critical
Validation Rules

A valid authority export verification result must:

include schema_version
include verification_id
include created_at
include target artifact type
include target artifact id
declare schema validity
declare required field status
declare trust context status
declare revocation context status
declare replay safety
declare secret leakage result
declare summary status
declare severity
declare admissibility
Supported Target Artifacts

Initial supported target:

authority_snapshot

Future supported targets:

replay_baseline
replay_diff
policy_manifest
federated_replay_bundle
Governance Semantics

Verification failure should be explicit.

Examples:

missing schema version = failed
missing authority records = failed or warning depending on expected empty state
missing trust context = incomplete_context
unchecked revocation context = not_replay_safe
detected secret leakage = not_admissible
non-deterministic ordering = failed
unknown artifact type = invalid_target
Replay Semantics

An authority export is replay-safe only if:

authority records are readable or validly referenced
trust context is present
revocation context has been checked
ordering is deterministic
schema validation passes
no required authority material is missing
no secrets are exposed
Secret Leakage Checks

Verification should reject or flag exports containing obvious secret-like fields.

Examples:

private_key
secret
token
password
seed
mnemonic
api_key

This is a defensive check.

It does not prove that no secret exists.

It only catches known dangerous patterns.

Relationship to Prior Milestones
authority snapshot = governance authority checkpoint
replay baseline = accepted replay reference checkpoint
replay diff = comparison artifact
authority export verification = admissibility check over exported authority artifacts

Authority export verification should first support authority snapshots.

Later, it can support replay baselines, replay diffs, and policy manifests.

Future Implementation Candidates

Potential future files:

core/audit/authorityExportVerifier.ts
schemas/audit/authority-export-verification.schema.json
scripts/dev/verify-authority-export.ts
Future Diagnostic Candidates

Potential diagnostics:

authority export schema validation
authority export required field validation
authority export deterministic ordering validation
authority export trust context validation
authority export revocation context validation
authority export replay safety validation
authority export secret leakage validation
authority export admissibility validation
Open Questions
Should authority export verification initially target only authority snapshots?
Should verification results be saved as audit artifacts?
Should verification failure block replay baseline creation?
Should secret leakage checks remain keyword-based initially, or use structured allow-lists?
Initial Recommendation

Start conservative.

The first implementation should verify authority snapshot exports only.

It should check schema validity, required fields, deterministic ordering, trust context, revocation context, replay safety, and obvious secret leakage patterns.

Do not introduce federation validation yet.

Do not introduce cryptographic verification yet.

Do not auto-repair invalid exports.

Status
design draft
implementation not started

