# Replay Baseline Design

## Purpose

Replay baselines define a stable reference point for comparing future replay results.

They are intended to support:

```text
deterministic replay comparison
governance drift detection
authority continuity checks
future replay diffing
future provenance reports
future federation readiness

A replay baseline is not an execution command.

It is a reference artifact.

Current Milestone

This document covers design only.

No runtime implementation is introduced by this milestone.

Problem Statement

PathWarden already supports authority replay and execution replay.

However, replay currently answers whether records can be reconstructed and inspected.

It does not yet define a stable baseline that future replay outputs can be compared against.

A replay baseline would answer:

what replay state was accepted as known-good
which authority context was used
which trust context was used
which execution records were included
which policy or governance references applied
whether future replay results diverge from the baseline
Design Goals

Replay baselines should be:

deterministic
schema-valid
read-only once exported
compatible with authority snapshots
compatible with replay diffing
safe for diagnostics
future-compatible with federation
Non-Goals

Replay baselines should not:

execute actions
grant authority
modify authority records
replace audit logs
replace authority snapshots
replace policy manifests
hide replay divergence
Baseline Boundary

A replay baseline captures accepted replay reference state.

Included:

baseline id
created timestamp
schema version
replay source metadata
authority snapshot reference
execution replay references
record counts
record hashes or identifiers
trust context reference
revocation context summary
policy references
diagnostic compatibility metadata

Excluded:

private keys
raw secrets
file contents
full user approval UI state
unrelated task state
unrelated diagnostic output
temporary runtime-only values
Proposed Baseline Shape
{
  "schema_version": "replay-baseline.v1",
  "baseline_id": "replaybase_...",
  "created_at": "2026-06-05T00:00:00.000Z",
  "source": {
    "runtime": "pathwarden",
    "environment": "local"
  },
  "authority": {
    "snapshot_id": null,
    "record_count": 0,
    "record_refs": []
  },
  "execution": {
    "record_count": 0,
    "record_refs": []
  },
  "trust": {
    "manifest_id": null,
    "signer_refs": []
  },
  "revocation": {
    "checked": true,
    "summary": []
  },
  "governance": {
    "policy_refs": [],
    "trigger_refs": []
  },
  "replay": {
    "baseline_safe": true,
    "diff_eligible": true,
    "notes": []
  }
}
Validation Rules

A valid replay baseline must:

include schema_version
include baseline_id
include created_at
declare replay source metadata
preserve deterministic ordering
avoid secrets
declare authority context
declare trust context
declare revocation context
declare whether diffing is allowed
Deterministic Ordering

Replay baseline records should be ordered by stable keys.

Preferred order:

created_at
record id
hash

If timestamps are unavailable or equal, record id should be used.

If record id is unavailable, hash should be used.

Relationship to Authority Snapshots

Authority snapshots capture authority state.

Replay baselines capture accepted replay reference state.

A replay baseline may reference an authority snapshot, but should not replace it.

Recommended relationship:

authority snapshot = governance authority checkpoint
replay baseline = replay comparison checkpoint
replay diff = comparison between baseline and later replay result
Replay Safety

A replay baseline is safe only if:

authority context is available
trust context is available
revocation context is checked
execution records are readable
record ordering is deterministic
schema validation passes
no required replay material is missing
Future Implementation Candidates

Potential future files:

core/audit/replayBaseline.ts
schemas/audit/replay-baseline.schema.json
scripts/dev/export-replay-baseline.ts
scripts/dev/verify-replay-baseline.ts
Future Diagnostic Candidates

Potential diagnostics:

replay baseline schema validation
replay baseline deterministic ordering
replay baseline authority context check
replay baseline trust context check
replay baseline revocation context check
replay baseline secret leakage check
replay baseline diff eligibility check
Open Questions
Should replay baselines require an authority snapshot reference?
Should baselines include full record metadata or only references plus hashes?
Should diagnostics create temporary baselines, or only verify exported baselines?
Should replay baselines become required before replay diffing is enabled?
Initial Recommendation

Start conservative.

The first implementation should export a schema-valid replay baseline containing replay metadata, authority context references, deterministic record references, trust context, and revocation context.

Do not introduce replay diffing yet.

Do not introduce cryptographic signing yet.

Do not introduce federation semantics yet.

Do not make baselines executable.

Status
design draft
implementation not started

