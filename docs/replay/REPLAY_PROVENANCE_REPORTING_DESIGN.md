# Replay Provenance Reporting Design

## Purpose

Replay provenance reports define how PathWarden summarizes where replay evidence came from, what authority and trust context applied, and whether replay results remain explainable over time.

They are intended to support:

```text
replay evidence review
authority provenance
trust provenance
revocation provenance
replay baseline traceability
replay diff traceability
future governance reports
future federation readiness

A replay provenance report is not an execution command.

It is an evidence lineage artifact.

Current Milestone

This document covers design only.

No runtime implementation is introduced by this milestone.

Problem Statement

PathWarden now has design coverage for:

authority snapshots
replay baselines
replay diffs
authority export verification
policy manifests
policy hashing
diagnostic metadata
governance reporting

Governance reports summarize overall evidence.

Replay provenance reports focus specifically on replay lineage.

They should answer:

which replay artifacts were used
which authority snapshot was referenced
which replay baseline was referenced
which replay diff was referenced
which trust context applied
which revocation context applied
which policy context applied
whether replay evidence is complete
whether replay evidence is explainable
whether replay lineage has gaps
Design Goals

Replay provenance reports should be:

deterministic
human-readable
machine-referenceable
evidence-oriented
lineage-aware
authority-aware
trust-aware
revocation-aware
policy-aware
future-compatible with federation
Non-Goals

Replay provenance reports should not:

execute actions
grant authority
modify authority records
modify replay artifacts
replace governance reports
replace replay diffs
replace audit logs
auto-repair lineage gaps
hide missing evidence
Report Boundary

Replay provenance reports summarize replay lineage.

Included:

report id
created timestamp
runtime source
authority snapshot references
replay baseline references
replay diff references
execution replay references
trust context references
revocation context summary
policy manifest references
policy hash status
lineage completeness status
explainability status
warnings
critical failures
artifact references

Excluded:

private keys
raw secrets
file contents
full audit log bodies
full execution record bodies
user approval UI state
temporary runtime-only values
Proposed Report Shape
{
  "schema_version": "replay-provenance-report.v1",
  "report_id": "replayprov_...",
  "created_at": "2026-06-05T00:00:00.000Z",
  "source": {
    "runtime": "pathwarden",
    "environment": "local"
  },
  "authority": {
    "snapshot_id": null,
    "status": "not_checked"
  },
  "replay": {
    "baseline_id": null,
    "diff_id": null,
    "execution_replay_refs": [],
    "status": "not_checked"
  },
  "trust": {
    "manifest_id": null,
    "status": "not_checked",
    "warnings": [],
    "critical_failures": []
  },
  "revocation": {
    "checked": false,
    "status": "not_checked",
    "warnings": [],
    "critical_failures": []
  },
  "policy": {
    "manifest_id": null,
    "hashes_available": false,
    "status": "not_checked"
  },
  "lineage": {
    "complete": false,
    "explainable": false,
    "gaps": [],
    "notes": []
  },
  "summary": {
    "status": "incomplete",
    "severity": "warning",
    "admissible": false,
    "recommendation": "Do not treat replay provenance as complete until required lineage artifacts are available.",
    "notes": []
  },
  "artifacts": []
}
Report Status Values

Recommended status values:

verified
verified_with_warnings
incomplete
failed
not_checked
Severity Values

Recommended severity values:

none
info
warning
critical
Lineage Gap Shape

Recommended gap shape:

{
  "kind": "missing_authority_snapshot",
  "severity": "warning",
  "message": "Replay provenance does not reference an authority snapshot."
}
Artifact Reference Shape

Recommended artifact reference shape:

{
  "kind": "replay_baseline",
  "id": "replaybase_...",
  "path": "exports/replay/replaybase_....json",
  "required": true
}
Validation Rules

A valid replay provenance report must:

include schema_version
include report_id
include created_at
include runtime source metadata
include authority section
include replay section
include trust section
include revocation section
include policy section
include lineage section
include summary section
avoid secrets
preserve deterministic artifact ordering
Deterministic Ordering

Artifact references should be sorted by:

kind
id
path

Lineage gaps should be sorted by:

severity
kind
message
Provenance Semantics

Replay provenance should distinguish:

evidence present
evidence missing
evidence present but unchecked
evidence checked with warnings
evidence checked with critical failure

Recommended interpretation:

verified = lineage evidence exists and passed checks
verified_with_warnings = lineage evidence exists but non-critical gaps remain
incomplete = required lineage evidence is missing
failed = critical lineage or verification failure
not_checked = check was not run
Explainability Semantics

Replay provenance is explainable only if:

replay source artifacts are identified
authority context is identified or explicitly not required
trust context is identified or explicitly not required
revocation context is checked when required
policy context is identified when required
lineage gaps are declared rather than hidden
Admissibility Semantics

A replay provenance report should be admissible only if:

required lineage artifacts are available
required checks have run
no critical failures exist
no secrets are exposed
artifact references are deterministic
lineage gaps are either absent or non-critical
Relationship to Prior Milestones
authority snapshot = governance authority checkpoint
replay baseline = accepted replay reference checkpoint
replay diff = comparison artifact
authority export verification = admissibility check over authority exports
policy manifest = governance and policy context reference
policy hashing = integrity signal for policy manifest files
diagnostic metadata = descriptive structure for diagnostic identity and execution constraints
governance report = consolidated evidence summary
replay provenance report = replay-specific lineage and explainability summary
Future Implementation Candidates

Potential future files:

core/audit/replayProvenanceReport.ts
schemas/audit/replay-provenance-report.schema.json
scripts/dev/export-replay-provenance-report.ts
scripts/dev/verify-replay-provenance-report.ts
Future Diagnostic Candidates

Potential diagnostics:

replay provenance report schema validation
replay provenance artifact reference check
replay provenance lineage completeness check
replay provenance explainability check
replay provenance secret leakage check
replay provenance deterministic ordering check
Open Questions
Should replay provenance reports be separate from governance reports, or generated as a replay section inside governance reports?
Should replay provenance require authority snapshot references from the start?
Should incomplete provenance be advisory or blocking?
Should replay provenance reports become required before federation readiness audits?
Initial Recommendation

Start conservative.

The first implementation should generate an on-demand replay provenance report from available local evidence.

It should clearly mark missing future artifacts as incomplete or not_checked rather than pretending full provenance exists.

Do not introduce federation semantics yet.

Do not introduce cryptographic signing yet.

Do not make reports executable.

Status
design draft
implementation not started

