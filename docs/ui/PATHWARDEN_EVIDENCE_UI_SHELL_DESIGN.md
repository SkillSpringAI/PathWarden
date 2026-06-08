# PathWarden Evidence UI Shell Design

## Purpose

The Evidence UI Shell gives PathWarden a read-only local interface for viewing evidence, reports, readiness posture, and audit-facing status without adding new execution behavior.

This UI is intended to make the existing evidence/reporting layer understandable to a user before PathWarden expands into approval queues, action previews, or controlled execution.

## Current tag baseline

```text
pw-v0.1.6-release-evidence-and-doc-cleanup
Design posture

PathWarden now has a local evidence/reporting foundation.

The next priority is visibility, not backend expansion.

The Evidence UI Shell should expose:

governance report status
replay provenance report status
federation readiness audit status
diagnostic metadata posture
latest generated report references
known warnings and missing requirements
explicit non-runtime federation boundary
Non-goals

The Evidence UI Shell must not implement:

file execution
approval actions
federation runtime
delegated authority
cross-runtime trust negotiation
signing
network behavior
remote endpoint calls
diagnostic runner replacement
grouped diagnostic execution
Rust/native modules
Core rule
The UI may display governance decisions.
The UI must not make governance decisions.
Read-only boundary

The first UI shell is read-only.

Allowed:

read latest exported report index
display report summaries
display report statuses
display warnings
display critical failures
display missing requirements
display artifact references
display current evidence posture

Not allowed:

execute file actions
approve actions
deny actions
modify policy
modify authority records
modify evidence reports
trigger federation
sign artifacts
rewrite diagnostics
Proposed screens
1. Evidence Overview

Shows:

latest governance report
latest replay provenance report
latest federation readiness audit
overall evidence posture
release-safe status
federation-ready status
admissibility status

Primary message:

PathWarden is locally evidence-aware.
Federation remains advisory and non-executable.
2. Governance Report Viewer

Shows:

report id
created timestamp
authority status
policy status
replay status
diagnostic status
summary status
release_safe value
notes
artifact references

Important display rule:

If release_safe is false, the UI must clearly state that the report is not release evidence for runtime expansion.
3. Replay Provenance Viewer

Shows:

report id
baseline id
diff id
lineage complete
lineage explainable
admissible
lineage gaps
execution replay refs
artifact references

Important display rule:

Missing replay baseline or replay diff must be shown as a declared lineage gap, not hidden.
4. Federation Readiness Viewer

Shows:

audit id
governance release-safe status
replay provenance admissibility
lineage completeness
policy status
diagnostic status
federation.ready
ready_for_federation
missing requirements
warnings
critical failures

Important display rule:

Federation readiness is advisory only. The UI must not present it as authorization.
5. Diagnostics Overview

Shows:

registered diagnostic metadata count
active diagnostics
planned diagnostics
blocking diagnostics
CI-compatible diagnostics

Initial implementation may read this from a generated index or future diagnostic metadata export.

Data sources

Initial UI should consume generated local JSON artifacts only.

Primary sources:

exports/report-index/latest-report-index.json
exports/governance/*.json
exports/replay/*.json
exports/federation/*.json

Supporting source:

core/common/diagnostics/diagnosticRegistry.ts

The UI should not scan arbitrary folders directly in the first pass.

Latest report index

Before building UI screens, PathWarden should generate a latest report index.

Expected future file:

scripts/dev/export-latest-report-index.ts

Expected output:

exports/report-index/latest-report-index.json

The index should summarize:

latest governance report path
latest replay provenance report path
latest federation readiness audit path
created timestamps
summary statuses
release_safe
admissible
ready_for_federation
warnings / missing requirements counts
UI layout concept

Recommended first layout:

left sidebar: Evidence, Governance, Replay, Federation, Diagnostics
main panel: selected report summary
right panel: warnings, critical failures, missing requirements, artifact refs
Status badge mapping

Initial status badges:

verified = stable / passed
verified_with_warnings = warning
incomplete = incomplete evidence
failed = failed evidence
not_checked = not checked

Readiness badges:

release_safe true = release evidence available
release_safe false = not release-safe
admissible true = replay provenance admissible
admissible false = replay provenance not admissible
ready_for_federation true = federation design may be considered
ready_for_federation false = federation not ready
First implementation boundary

The first UI shell should only prove:

PathWarden can display its evidence posture in a readable local UI.

It should not attempt:

approval queue
action execution
policy editing
report generation from UI
diagnostic execution from UI
federation readiness promotion
Future placeholders

Future screens may include:

approval queue
action preview
audit receipt viewer
policy browser
capability browser
settings

These are placeholders only for v0.1.7.

Build sequence

Recommended order:

1. Evidence UI shell design
2. Report viewer data contract
3. Latest report index export script
4. Latest report index verification
5. Minimal read-only UI shell
Rust boundary

Rust is not appropriate for this phase.

Rust should remain deferred until a later feasibility spike for:

filesystem safety core
high-integrity hashing or evidence packaging
sandboxed execution boundary
performance-sensitive scanning
Summary

The Evidence UI Shell is a visibility layer.

It makes PathWarden easier to understand without increasing authority, runtime power, or federation scope.
