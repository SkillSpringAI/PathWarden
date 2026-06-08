# PathWarden Report Viewer Data Contract

## Purpose

This document defines the read-only data contract for PathWarden's first Evidence UI Shell report viewer.

The goal is to make existing evidence reports visible and understandable without giving the UI authority to execute actions, approve work, modify policy, or promote federation readiness.

## Current baseline

```text
pw-v0.1.6-release-evidence-and-doc-cleanup
Contract boundary

The report viewer may read and display report data.

The report viewer must not:

generate reports
modify reports
modify authority records
modify policy files
execute actions
approve actions
deny actions
trigger diagnostics
trigger federation
sign artifacts
call networks
Primary input sources

The first report viewer should consume local generated JSON artifacts through a report index.

Expected index:

exports/report-index/latest-report-index.json

Expected source report locations:

exports/governance/*.json
exports/replay/*.json
exports/federation/*.json
Report categories

The UI should support three report categories in the first pass:

governance report
replay provenance report
federation readiness audit
Shared display fields

All report cards should display:

report kind
report id / audit id
created_at
source.runtime
source.environment
summary status
severity
primary recommendation
artifact references
Governance report display contract

Source schema:

schemas/audit/governance-report.schema.json

Display fields:

report_id
created_at
authority.snapshot_id
authority.record_count
authority.status
trust.status
trust.warnings
trust.critical_failures
revocation.checked
revocation.status
policy.manifest_id
policy.hashes_available
policy.status
replay.baseline_id
replay.diff_id
replay.status
diagnostics.overall_status
diagnostics.passed
diagnostics.failed
diagnostics.warnings
summary.release_safe
summary.status
summary.severity
summary.recommendation
summary.notes
artifacts

Important UI rule:

If summary.release_safe is false, show "Not release-safe" clearly.
Do not bury it in report details.
Replay provenance report display contract

Source schema:

schemas/audit/replay-provenance-report.schema.json

Display fields:

report_id
created_at
authority.snapshot_id
authority.status
replay.baseline_id
replay.diff_id
replay.execution_replay_refs
replay.status
trust.manifest_id
trust.status
trust.warnings
trust.critical_failures
revocation.checked
revocation.status
revocation.warnings
revocation.critical_failures
policy.manifest_id
policy.hashes_available
policy.status
lineage.complete
lineage.explainable
lineage.gaps
lineage.notes
summary.status
summary.severity
summary.admissible
summary.recommendation
summary.notes
artifacts

Important UI rule:

If lineage.complete is false, show "Lineage incomplete" clearly.
If summary.admissible is false, show "Not admissible" clearly.
Missing baseline or diff must appear as declared lineage gaps.
Federation readiness audit display contract

Source schema:

schemas/audit/federation-readiness-audit.schema.json

Display fields:

audit_id
created_at
governance.report_id
governance.status
governance.release_safe
replay_provenance.report_id
replay_provenance.status
replay_provenance.admissible
replay_provenance.lineage_complete
policy.manifest_id
policy.hashes_available
policy.status
diagnostics.registered
diagnostics.blocking
diagnostics.ci_compatible
diagnostics.status
federation.ready
federation.status
federation.warnings
federation.critical_failures
federation.missing_requirements
summary.status
summary.severity
summary.ready_for_federation
summary.recommendation
summary.notes
artifacts

Important UI rule:

If summary.ready_for_federation is false, show "Federation not ready" clearly.
The UI must not present federation readiness as execution authorization.
Status badge mapping

Use the same mapping across all report types.

verified = Passed
verified_with_warnings = Warning
incomplete = Incomplete
failed = Failed
not_checked = Not checked
Severity display mapping
none = no issue
info = informational
warning = review required
critical = blocking failure
Boolean display rules
release_safe
true = Release-safe evidence available
false = Not release-safe
admissible
true = Replay provenance admissible
false = Replay provenance not admissible
lineage.complete
true = Lineage complete
false = Lineage incomplete
lineage.explainable
true = Lineage explainable
false = Lineage not fully explainable
ready_for_federation
true = Federation design may be considered
false = Federation not ready
federation.ready
true = Federation readiness checks passed
false = Federation readiness checks not passed
Warning display rules

Warnings should be shown in a visible warning panel.

Warning sources:

trust.warnings
revocation.warnings
lineage.gaps where severity is warning
federation.warnings
summary.notes
Critical display rules

Critical failures should be shown in a visible blocking panel.

Critical sources:

trust.critical_failures
revocation.critical_failures
lineage.gaps where severity is critical
federation.critical_failures
failed status values
critical severity values
Missing requirement display rules

Missing requirements should be shown separately from general warnings.

Source:

federation.missing_requirements

Display label:

Missing requirements before federation
Artifact reference display

Each artifact reference should display:

kind
id
path
required

Display rules:

required true = Required artifact
required false = Optional artifact
path null = No file path supplied
id null = No artifact id supplied
Empty state rules

If no report exists:

show "No report available"
show expected export command
do not show a successful status

Expected commands:

npm run export:governance-report
npm run export:replay-provenance-report
npm run export:federation-readiness-audit
Latest report index contract

Expected future index path:

exports/report-index/latest-report-index.json

Expected top-level shape:

{
  "schema_version": "latest-report-index.v1",
  "index_id": "reportindex_...",
  "created_at": "2026-06-08T00:00:00.000Z",
  "source": {
    "runtime": "pathwarden",
    "environment": "local"
  },
  "reports": {
    "governance": {
      "path": "exports/governance/...",
      "id": "govreport_...",
      "created_at": "...",
      "status": "incomplete",
      "release_safe": false
    },
    "replay_provenance": {
      "path": "exports/replay/...",
      "id": "replayprov_...",
      "created_at": "...",
      "status": "incomplete",
      "admissible": false,
      "lineage_complete": false
    },
    "federation_readiness": {
      "path": "exports/federation/...",
      "id": "fedready_...",
      "created_at": "...",
      "status": "incomplete",
      "ready_for_federation": false
    }
  }
}
UI sections using this contract

Recommended first UI sections:

Evidence Overview
Governance Report
Replay Provenance
Federation Readiness
Diagnostics Summary
Artifact References
Warnings and Blockers
Anti-overbuild rule

If a field is not in the report/index JSON, the UI should not invent it.

If a report is missing, the UI should show missing state, not infer success.

If federation is not ready, the UI should say so directly.

Summary

This data contract exists to keep the Evidence UI Shell read-only, evidence-based, and honest about incomplete readiness.
