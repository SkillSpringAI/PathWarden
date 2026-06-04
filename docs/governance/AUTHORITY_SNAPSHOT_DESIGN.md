# Authority Snapshot Design

## Purpose

Authority snapshots define a stable record of PathWarden authority state at a specific point in time.

They are intended to support:

```text
governance auditability
authority replay
trust validation
historical reconstruction
future federation readiness

An authority snapshot is not an execution command.

It is evidence.

Current Milestone

This document covers design only.

No runtime implementation is introduced by this milestone.

Problem Statement

PathWarden already supports authority persistence, authority replay, execution replay, trust validation, signer lifecycle checks, and revocation awareness.

However, replay currently reconstructs authority state from records and manifests.

A snapshot would provide a stable checkpoint that answers:

what authority state existed
which signer context applied
which trust lifecycle state applied
which policy or governance context applied
which records were included
which records were excluded
whether the snapshot is replay-safe
Design Goals

Authority snapshots should be:

deterministic
read-only once exported
schema-valid
replay-friendly
trust-aware
revocation-aware
federation-compatible later
Non-Goals

Authority snapshots should not:

grant new authority
modify authority records
replace the authority log
replace trust manifests
execute filesystem actions
act as policy engines
Snapshot Boundary

A snapshot captures authority state.

It does not capture full execution state.

Included:

snapshot id
created timestamp
authority records
authority record hashes or identifiers
signer fingerprints
signer lifecycle status at snapshot time
trust manifest reference
revocation context
governance policy references
replay compatibility metadata
schema version

Excluded:

file contents
private keys
raw secrets
user approval UI state
non-authority task state
unrelated diagnostic logs
Proposed Snapshot Shape
{
  "schema_version": "authority-snapshot.v1",
  "snapshot_id": "authsnap_...",
  "created_at": "2026-06-05T00:00:00.000Z",
  "source": {
    "runtime": "pathwarden",
    "environment": "local"
  },
  "authority": {
    "record_count": 0,
    "records": []
  },
  "trust": {
    "manifest_id": null,
    "signers": []
  },
  "revocation": {
    "checked": true,
    "revoked_signers": []
  },
  "governance": {
    "policy_refs": [],
    "trigger_refs": []
  },
  "replay": {
    "replay_safe": true,
    "baseline_eligible": true,
    "notes": []
  }
}
Validation Rules

A valid authority snapshot must:

include schema_version
include snapshot_id
include created_at
include authority record count
preserve deterministic ordering
avoid secrets
declare replay safety
declare trust context
declare revocation context
Deterministic Ordering

Authority records should be ordered by a stable key.

Preferred order:

created_at
record id
hash

If timestamps are unavailable or equal, record id should be used.

If record id is unavailable, hash should be used.

Trust Semantics

Snapshots must preserve historical trust semantics.

A signer that is currently revoked may still have been historically valid at the time of a prior authority record.

Therefore, snapshots should distinguish:

valid at record time
valid at snapshot time
revoked after record time
invalid at record time
Replay Semantics

A snapshot is replay-safe only if:

authority records are readable
trust context is available
revocation context is checked
schema validation passes
record ordering is deterministic
no required authority material is missing
Future Implementation Candidates

Potential future files:

core/audit/authoritySnapshot.ts
schemas/audit/authority-snapshot.schema.json
scripts/dev/export-authority-snapshot.ts
scripts/dev/verify-authority-snapshot.ts
Future Diagnostic Candidates

Potential diagnostics:

authority snapshot schema validation
authority snapshot deterministic ordering
authority snapshot replay safety
authority snapshot secret leakage check
authority snapshot trust context check
authority snapshot revocation context check
Open Questions
Should snapshots include full authority records or only references plus hashes?
Should snapshot export require an explicit command, or should diagnostics create temporary snapshots?
Should snapshots bind to policy manifests once policy hashing exists?
Should snapshots become replay baseline inputs, or remain separate governance artifacts?
Initial Recommendation

Start conservative.

The first implementation should export a schema-valid authority snapshot that contains authority record metadata, deterministic ordering, trust context, and revocation context.

Do not introduce cryptographic signing yet.

Do not introduce federation semantics yet.

Do not make snapshots executable.

Status
design draft
implementation not started

