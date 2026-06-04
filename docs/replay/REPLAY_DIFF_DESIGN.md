# Replay Diff Design

## Purpose

Replay diffs define how PathWarden compares a known-good replay baseline against a later replay result.

They are intended to support:

```text
deterministic replay comparison
governance drift detection
authority divergence detection
trust-context divergence detection
policy-context divergence detection
future replay provenance reports
future federation readiness

A replay diff is not an execution command.

It is a comparison artifact.

Current Milestone

This document covers design only.

No runtime implementation is introduced by this milestone.

Problem Statement

PathWarden now has design coverage for authority snapshots and replay baselines.

The next requirement is to define how future replay results should be compared against an accepted baseline.

Replay diffing should answer:

what changed
what stayed the same
whether the change is expected
whether the change affects governance validity
whether authority continuity was preserved
whether trust or revocation context changed
whether policy context changed
whether replay output remains admissible
Design Goals

Replay diffs should be:

deterministic
schema-valid
human-readable
machine-checkable
governance-aware
trust-aware
revocation-aware
policy-aware later
safe for diagnostics
future-compatible with federation
Non-Goals

Replay diffs should not:

execute actions
grant authority
modify authority records
modify replay baselines
replace audit logs
hide divergence
auto-resolve governance conflicts
Diff Boundary

A replay diff compares replay reference state against replay result state.

Included:

diff id
created timestamp
schema version
baseline reference
candidate replay reference
authority differences
execution record differences
trust context differences
revocation context differences
governance reference differences
summary decision
severity classification
diagnostic compatibility metadata

Excluded:

private keys
raw secrets
file contents
full user approval UI state
temporary runtime-only values
unrelated diagnostic output
Proposed Diff Shape
{
  "schema_version": "replay-diff.v1",
  "diff_id": "replaydiff_...",
  "created_at": "2026-06-05T00:00:00.000Z",
  "baseline": {
    "baseline_id": "replaybase_...",
    "source": null
  },
  "candidate": {
    "replay_id": "replay_...",
    "source": null
  },
  "authority": {
    "changed": false,
    "added": [],
    "removed": [],
    "modified": []
  },
  "execution": {
    "changed": false,
    "added": [],
    "removed": [],
    "modified": []
  },
  "trust": {
    "changed": false,
    "details": []
  },
  "revocation": {
    "changed": false,
    "details": []
  },
  "governance": {
    "changed": false,
    "policy_ref_changes": [],
    "trigger_ref_changes": []
  },
  "summary": {
    "status": "no_divergence",
    "severity": "none",
    "admissible": true,
    "notes": []
  }
}
Diff Status Values

Recommended status values:

no_divergence
expected_divergence
unexpected_divergence
governance_divergence
trust_divergence
revocation_divergence
policy_divergence
invalid_diff
Severity Values

Recommended severity values:

none
info
warning
critical
Validation Rules

A valid replay diff must:

include schema_version
include diff_id
include created_at
include baseline reference
include candidate replay reference
declare whether authority changed
declare whether execution records changed
declare whether trust context changed
declare whether revocation context changed
declare summary status
declare severity
declare admissibility
avoid secrets
Deterministic Comparison

Replay diffing should compare records using stable identifiers.

Preferred comparison keys:

record id
hash
created_at

Record ordering should not create false divergence.

The diff process should normalize ordering before comparison.

Relationship to Prior Milestones
authority snapshot = governance authority checkpoint
replay baseline = accepted replay reference checkpoint
replay diff = comparison between baseline and later replay output

Replay diffing should not exist without a replay baseline.

Replay diffing may reference authority snapshots when available.

Governance Semantics

Not all divergence has the same meaning.

Examples:

new expected audit record = info
missing authority record = critical
changed signer lifecycle state = warning or critical
revoked signer affecting authority validity = critical
policy reference mismatch = warning now, critical once policy hashing exists

The diff should classify divergence rather than merely report that something changed.

Replay Diff Safety

A replay diff is safe only if:

baseline is readable
candidate replay result is readable
authority context is available
trust context is available
revocation context is checked
comparison ordering is deterministic
schema validation passes
no required replay material is missing
Future Implementation Candidates

Potential future files:

core/audit/replayDiff.ts
schemas/audit/replay-diff.schema.json
scripts/dev/export-replay-diff.ts
scripts/dev/verify-replay-diff.ts
Future Diagnostic Candidates

Potential diagnostics:

replay diff schema validation
replay diff deterministic comparison
replay diff baseline reference check
replay diff candidate reference check
replay diff trust context check
replay diff revocation context check
replay diff severity classification check
replay diff secret leakage check
Open Questions
Should replay diffs be generated only from exported baselines, or also from temporary diagnostic baselines?
Should expected divergence require explicit allow-listing?
Should policy divergence remain warning-level until policy hashing exists?
Should replay diff output be included in governance reports later?
Initial Recommendation

Start conservative.

The first implementation should compare a replay baseline against a candidate replay result using stable record references and hashes.

It should classify divergence, but not attempt automatic remediation.

Do not introduce federation semantics yet.

Do not introduce cryptographic signing yet.

Do not make diffs executable.

Status
design draft
implementation not started

