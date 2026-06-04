# Governance Reporting Design

## Purpose

Governance reporting defines how PathWarden summarizes governance evidence into a readable and reviewable report.

It is intended to support:

```text
audit review
release confidence
authority evidence summaries
replay evidence summaries
policy context summaries
diagnostic summaries
future provenance reporting
future federation readiness

A governance report is not an execution command.

It is an evidence summary artifact.

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

However, these artifacts are individually useful but not yet consolidated into a single governance-facing report.

A governance report should answer:

what governance evidence exists
which authority state applied
which replay baseline or diff applied
which policy context applied
whether trust and revocation checks passed
which diagnostics passed or failed
whether the current state is release-safe
whether any warnings or critical failures exist
Design Goals

Governance reports should be:

human-readable
machine-referenceable
deterministic
schema-compatible later
evidence-oriented
diagnostic-friendly
replay-compatible
future-compatible with federation
Non-Goals

Governance reports should not:

execute actions
grant authority
modify authority records
modify policy files
replace diagnostics
replace replay artifacts
replace audit logs
hide failures
auto-remediate issues
Report Boundary

Governance reports summarize governance evidence.

Included:

report id
created timestamp
runtime source
authority summary
trust summary
revocation summary
policy summary
replay summary
diagnostic summary
risk summary
release recommendation
open warnings
critical failures
artifact references

Excluded:

private keys
raw secrets
file contents
full audit log bodies
full execution record bodies
user approval UI state
runtime-only temporary values
Proposed Report Shape
{
  "schema_version": "governance-report.v1",
  "report_id": "govreport_...",
  "created_at": "2026-06-05T00:00:00.000Z",
  "source": {
    "runtime": "pathwarden",
    "environment": "local"
  },
  "authority": {
    "snapshot_id": null,
    "record_count": 0,
    "status": "not_checked"
  },
  "trust": {
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
  "replay": {
    "baseline_id": null,
    "diff_id": null,
    "status": "not_checked"
  },
  "diagnostics": {
    "overall_status": "not_checked",
    "passed": 0,
    "failed": 0,
    "warnings": 0
  },
  "summary": {
    "release_safe": false,
    "status": "incomplete",
    "severity": "warning",
    "recommendation": "Do not treat this report as release evidence until required checks are complete.",
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
Release Recommendation Values

Recommended values:

release_safe
release_safe_with_warnings
not_release_safe
insufficient_evidence
Artifact Reference Shape

Recommended artifact reference shape:

{
  "kind": "authority_snapshot",
  "id": "authsnap_...",
  "path": "exports/authority/authsnap_....json",
  "required": true
}
Validation Rules

A valid governance report must:

include schema_version
include report_id
include created_at
include runtime source metadata
include authority summary
include trust summary
include revocation summary
include policy summary
include replay summary
include diagnostic summary
include release recommendation
avoid secrets
preserve deterministic artifact ordering
Deterministic Ordering

Artifact references should be sorted by:

kind
id
path

This prevents false drift from output ordering differences.

Governance Semantics

A governance report should distinguish evidence levels.

Recommended interpretation:

verified = evidence exists and passed checks
verified_with_warnings = evidence exists but non-critical issues remain
incomplete = required evidence is missing
failed = critical verification failure
not_checked = check was not run
Release Safety Semantics

A report should be release-safe only if:

required diagnostics passed
authority context is valid or intentionally absent
trust context passed when required
revocation context passed when required
policy context is valid when required
replay evidence is valid when required
no critical failures exist
Relationship to Prior Milestones
authority snapshot = governance authority checkpoint
replay baseline = accepted replay reference checkpoint
replay diff = comparison artifact
authority export verification = admissibility check over authority exports
policy manifest = governance and policy context reference
policy hashing = integrity signal for policy manifest files
diagnostic metadata = descriptive structure for diagnostic identity and execution constraints
governance report = consolidated evidence summary
Future Implementation Candidates

Potential future files:

core/governance/governanceReport.ts
schemas/governance/governance-report.schema.json
scripts/dev/export-governance-report.ts
scripts/dev/verify-governance-report.ts

Alternative location if governance folder is not introduced yet:

core/audit/governanceReport.ts
schemas/audit/governance-report.schema.json
Future Diagnostic Candidates

Potential diagnostics:

governance report schema validation
governance report required section check
governance report artifact reference check
governance report release safety check
governance report secret leakage check
governance report deterministic ordering check
Open Questions
Should governance reports live under audit or governance?
Should reports be generated only on demand, or as part of release checks?
Should governance reports require replay baseline evidence from the start?
Should release safety be strict by default or allow advisory reports?
Initial Recommendation

Start conservative.

The first implementation should generate an on-demand governance report from available local evidence.

It should summarize authority, trust, revocation, policy, replay, and diagnostics, but should not require all advanced artifacts to exist yet.

Missing future artifacts should produce incomplete or not_checked statuses rather than fake confidence.

Do not introduce federation semantics yet.

Do not introduce cryptographic signing yet.

Do not make reports executable.

Status
design draft
implementation not started

