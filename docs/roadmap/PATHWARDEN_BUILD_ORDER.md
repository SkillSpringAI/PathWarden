# PathWarden Build Order

## Purpose

This document defines the current implementation sequence for PathWarden.

The purpose is to prevent architectural drift, avoid skipping ahead, and keep governance, replay, diagnostics, reporting, and federation work paced correctly.

## Current Build Sequence

1. Authority Snapshot Design
2. Replay Baseline Design
3. Replay Diff Design
4. Authority Export Verification
5. Policy Manifest Design
6. Policy Hashing
7. Diagnostic Metadata
8. Governance Reporting
9. Replay Provenance Reports
10. Federation Readiness Audit

## Current Pass Status

```text
design pass complete
implementation pass not started

All ten design milestones have been drafted and committed.

The next phase is implementation, starting again from Milestone 1.

Rule

Do not skip ahead unless a bug fix or failed diagnostic requires it.

Each implementation step should follow the relevant design document.

Each implementation should remain conservative, schema-first, diagnostic-friendly, and non-executable unless explicitly intended.

Completed Design Milestones
1. Authority Snapshot Design

Status:

design complete
### Milestone 1: Authority Snapshot Implementation

Status:

```text
implementation complete
schema complete
export script complete
checks passing

Implemented files:

schemas/audit/authority-snapshot.schema.json
core/audit/authoritySnapshot.ts
scripts/dev/export-authority-snapshot.ts

Package script:

npm run export:authority-snapshot

Current behavior:

exports schema-valid authority snapshots
reads authority records without mutating them
sorts records deterministically
supports legacy records without persisted record_hash
omits invalid legacy previous_authority_hash values from snapshot output
writes generated snapshots under exports/authority
generated exports remain out of git

Validation result:

npm run check passed
npm run diag passed
npm run export:authority-snapshot passed

Export test result:

Authority records: 6044

Implementation remains conservative:

no signing
no federation semantics
no executable behavior
no authority record mutation
trust and governance references remain placeholders pending later milestone

Design document:

docs/governance/AUTHORITY_SNAPSHOT_DESIGN.md

Likely implementation files:

core/audit/authoritySnapshot.ts
schemas/audit/authority-snapshot.schema.json
scripts/dev/export-authority-snapshot.ts

### Milestone 2: Replay Baseline Implementation

Status:

```text
implementation complete
schema complete
export script complete
checks passing

Implemented files:

schemas/audit/replay-baseline.schema.json
core/audit/replayBaseline.ts
scripts/dev/export-replay-baseline.ts

Package script:

npm run export:replay-baseline -- <trace_id>

Current behavior:

exports schema-valid replay baselines
uses trace replay as source evidence
captures deterministic authority record references
captures deterministic execution event references
hashes reconstructed replay chain
records replay safety status
supports legacy authority records without persisted record_hash
writes generated baselines under exports/replay
generated exports remain out of git

Validation result:

npm run check passed
npm run diag passed
npm run export:replay-baseline passed

Export test result:

Trace id: trace_capability_1780619880414
Authority records: 2
Execution records: 1
Baseline safe: true

Implementation remains conservative:

no replay diffing
no signing
no federation semantics
no executable behavior
no authority record mutation
authority snapshot, trust, and governance references remain placeholders pending later milestones

docs/replay/REPLAY_BASELINE_DESIGN.md

Expected first files:

schemas/audit/replay-baseline.schema.json
core/audit/replayBaseline.ts
scripts/dev/export-replay-baseline.ts

Design document:

docs/replay/REPLAY_BASELINE_DESIGN.md

Likely implementation files:

core/audit/replayBaseline.ts
schemas/audit/replay-baseline.schema.json
scripts/dev/export-replay-baseline.ts

### Milestone 3: Replay Diff Implementation

Status:

```text
implementation complete
schema complete
export script complete
checks passing

Implemented files:

schemas/audit/replay-diff.schema.json
core/audit/replayDiff.ts
scripts/dev/export-replay-diff.ts

Package script:

npm run export:replay-diff -- <baseline_json_path> <trace_id>

Current behavior:

exports schema-valid replay diffs
compares exported replay baseline against current replay state
compares deterministic authority record references
compares deterministic execution event references
detects trust, revocation, and governance reference divergence
classifies no_divergence, unexpected_divergence, trust_divergence, revocation_divergence, governance_divergence, and invalid_diff
writes generated diffs under exports/replay
generated exports remain out of git

Validation result:

npm run check passed
npm run diag passed
npm run export:replay-diff passed

Implementation remains conservative:

no automatic remediation
no signing
no federation semantics
no executable behavior
no mutation of replay baseline artifacts
policy divergence remains placeholder-level until policy manifests and hashing exist
Design document:

docs/replay/REPLAY_DIFF_DESIGN.md

Likely implementation files:

core/audit/replayDiff.ts
schemas/audit/replay-diff.schema.json
scripts/dev/export-replay-diff.ts
### Milestone 4: Authority Export Verification Implementation

Status:

```text
implementation complete
schema complete
verification CLI complete
checks passing

Implemented files:

schemas/audit/authority-export-verification.schema.json
core/audit/authorityExportVerifier.ts
scripts/dev/verify-authority-export.ts

Package script:

npm run verify:authority-export -- <authority_snapshot_json_path>

Current behavior:

verifies exported authority snapshot artifacts
validates authority snapshot schema
checks required fields
checks record count consistency
checks authority record references
checks deterministic ordering
checks trust context presence
checks revocation context declaration
checks replay safety
checks secret-like key leakage without falsely flagging permission_token values
returns structured JSON verification output
fails closed when export is not admissible

Validation result:

npm run check passed
npm run diag passed
npm run verify:authority-export passed

Verification test result:

Target: authsnap_20260605T001035442Z
Status: verified
Severity: none
Admissible: true
Secret leakage detected: false

Implementation remains conservative:

authority snapshots only
no automatic repair
no signing
no federation semantics
no executable behavior
no authority record mutation

Design document:

docs/governance/AUTHORITY_EXPORT_VERIFICATION_DESIGN.md

Likely implementation files:

core/audit/authorityExportVerifier.ts
schemas/audit/authority-export-verification.schema.json
scripts/dev/verify-authority-export.ts
### Milestone 5: Policy Manifest Implementation

Status:

```text
implementation complete
schema complete
export script complete
checks passing

Implemented files:

schemas/policy/policy-manifest.schema.json
core/policy/policyManifest.ts
scripts/dev/export-policy-manifest.ts

Package script:

npm run export:policy-manifest

Current behavior:

exports schema-valid policy manifests
records repository-relative policy file references
records governance design document references
records trigger schema references when present
records trust manifest schema references
records schema file references
preserves deterministic file ordering by kind and path
includes hash-ready fields with hashes_available false
writes generated manifests under exports/policy
generated exports remain out of git

Validation result:

npm run check passed
npm run diag passed
npm run export:policy-manifest passed

Implementation remains conservative:

no hashing yet
no signing
no federation semantics
no executable behavior
no policy mutation
hash fields remain null pending Policy Hashing implementation

Design document:

docs/governance/POLICY_MANIFEST_DESIGN.md

Likely implementation files:

core/policy/policyManifest.ts
schemas/policy/policy-manifest.schema.json
scripts/dev/export-policy-manifest.ts
### Milestone 6: Policy Hashing Implementation

Status:

```text
implementation complete
hashing CLI complete
verification CLI complete
checks passing

Implemented files:

core/policy/policyHasher.ts
scripts/dev/hash-policy-manifest.ts
scripts/dev/verify-policy-hashes.ts

Package scripts:

npm run hash:policy-manifest
npm run verify:policy-hashes -- <policy_manifest_json_path>

Current behavior:

generates SHA-256 hashes for files listed in the policy manifest
uses repository-relative paths
preserves deterministic hash ordering by kind and path
exports hashed policy manifests under exports/policy
verifies hashed manifests against current repository files
reports match, mismatch, missing_required, missing_optional, not_checked, and invalid_entry statuses
does not print file contents
generated exports remain out of git

Validation result:

npm run check passed
npm run diag passed
npm run hash:policy-manifest passed
npm run verify:policy-hashes passed

Hashing test result:

Hashes available: true
Hash algorithm: sha256
File hashes: 30

Implementation remains conservative:

file-level hashes only
no manifest-level hash yet
no signing
no federation semantics
no executable behavior
no policy mutation

Design document:

docs/governance/POLICY_HASHING_DESIGN.md

Likely implementation files:

core/policy/policyHasher.ts
scripts/dev/hash-policy-manifest.ts
scripts/dev/verify-policy-hashes.ts
### Milestone 7: Diagnostic Metadata Implementation

Status:

```text
implementation complete
schema complete
metadata types complete
passive registry complete
verification CLI complete
checks passing

Implemented files:

schemas/diagnostics/diagnostic-metadata.schema.json
core/common/diagnostics/diagnosticMetadata.ts
core/common/diagnostics/diagnosticRegistry.ts
scripts/dev/verify-diagnostic-metadata.ts

Package script:

npm run verify:diagnostic-metadata

Current behavior:

defines diagnostic metadata schema
defines diagnostic metadata TypeScript types
defines passive diagnostic metadata registry
validates diagnostic metadata shape
checks duplicate diagnostic IDs
checks missing diagnostic dependencies
reports active, blocking, and CI-compatible diagnostic counts
does not alter npm run diag behavior
does not execute diagnostics
does not introduce grouped execution

Validation result:

npm run check passed
npm run diag passed
npm run verify:diagnostic-metadata passed

Implementation remains conservative:

passive metadata only
no diagnostic runner rewiring
no grouped execution
no dependency-based execution ordering
no federation diagnostics
no replacement of existing diagnostic scripts

Design document:

docs/diagnostics/DIAGNOSTIC_METADATA_DESIGN.md

Likely implementation files:

core/common/diagnostics/diagnosticMetadata.ts
core/common/diagnostics/diagnosticRegistry.ts
schemas/diagnostics/diagnostic-metadata.schema.json
### Milestone 8: Governance Reporting Implementation

Status:

```text
implementation complete
schema complete
report builder complete
export script complete
checks passing

Implemented files:

schemas/audit/governance-report.schema.json
core/audit/governanceReport.ts
scripts/dev/export-governance-report.ts

Package script:

npm run export:governance-report

Current behavior:

exports schema-valid governance reports
summarizes authority snapshot evidence
summarizes authority export verification status
summarizes policy manifest and policy hash evidence
summarizes diagnostic metadata registry status
marks replay evidence as incomplete until replay baseline and replay diff inputs are supplied
preserves deterministic artifact ordering
writes generated reports under exports/governance
generated exports remain out of git

Validation result:

npm run check passed
npm run diag passed
npm run export:governance-report passed

Expected first-pass report posture:

Authority status: verified
Policy status: verified
Replay status: incomplete
Diagnostics status: verified
Summary status: incomplete
Release safe: false

Implementation remains conservative:

on-demand report generation only
no signing
no federation semantics
no executable behavior
no audit log mutation
no diagnostic runner replacement
no fake replay confidence
Design document:

docs/governance/GOVERNANCE_REPORTING_DESIGN.md

Likely implementation files:

core/audit/governanceReport.ts
schemas/audit/governance-report.schema.json
scripts/dev/export-governance-report.ts
### Milestone 9: Replay Provenance Reporting Implementation

Status:

```text
implementation complete
schema complete
report builder complete
export script complete
checks passing

Implemented files:

schemas/audit/replay-provenance-report.schema.json
core/audit/replayProvenanceReport.ts
scripts/dev/export-replay-provenance-report.ts

Package script:

npm run export:replay-provenance-report

Current behavior:

exports schema-valid replay provenance reports
supports advisory mode with no replay baseline or replay diff arguments
supports fuller mode with supplied replay baseline and replay diff JSON paths
summarizes authority snapshot reference
summarizes replay baseline reference
summarizes replay diff reference
summarizes execution replay references from baseline evidence
summarizes trust and revocation context from replay baseline evidence
summarizes policy manifest and policy hash status
declares missing replay baseline and replay diff as lineage gaps
preserves deterministic artifact ordering
preserves deterministic lineage gap ordering
writes generated reports under exports/replay
generated exports remain out of git

Validation result:

npm run check passed
npm run diag passed
npm run export:replay-provenance-report passed

Expected first-pass advisory posture:

Replay status: incomplete
Baseline id: null
Diff id: null
Lineage complete: false
Lineage explainable: false
Summary status: incomplete
Admissible: false

Implementation remains conservative:

on-demand report generation only
no signing
no federation semantics
no executable behavior
no replay artifact mutation
no audit log mutation
no fake replay lineage confidence

design complete
implementation complete

Design document:

docs/replay/REPLAY_PROVENANCE_REPORTING_DESIGN.md

Likely implementation files:

core/audit/replayProvenanceReport.ts
schemas/audit/replay-provenance-report.schema.json
scripts/dev/export-replay-provenance-report.ts
### Milestone 10: Federation Readiness Audit Implementation

Status:

```text
implementation complete
schema complete
audit builder complete
export script complete
checks passing

Implemented files:

schemas/audit/federation-readiness-audit.schema.json
core/audit/federationReadinessAudit.ts
scripts/dev/export-federation-readiness-audit.ts

Package script:

npm run export:federation-readiness-audit

Current behavior:

exports schema-valid federation readiness audits
summarizes governance report readiness
summarizes replay provenance readiness
summarizes policy manifest and policy hash readiness
summarizes diagnostic metadata readiness
declares missing requirements explicitly
marks federation as not ready until governance and replay provenance are complete/admissible
writes generated audits under exports/federation
generated exports remain out of git

Expected first-pass advisory posture:

Governance status: incomplete
Governance release safe: false
Replay provenance status: incomplete
Replay provenance admissible: false
Replay lineage complete: false
Policy status: verified
Diagnostics status: verified
Federation status: incomplete
Federation ready: false
Summary status: incomplete
Ready for federation: false

Implementation remains conservative:

readiness audit only
no federation runtime behavior
no delegated authority
no cross-runtime trust negotiation
no signing
no network behavior
no executable federation actions
no fake readiness confidence

design complete
implementation complete

Design document:

docs/federation/FEDERATION_READINESS_AUDIT_DESIGN.md

Likely implementation files:

core/audit/federationReadinessAudit.ts
schemas/audit/federation-readiness-audit.schema.json
scripts/dev/export-federation-readiness-audit.ts
Next Implementation Pass
## Evidence and Reporting Foundation Status

Status:

```text
complete for current pass

Completed implementation pass:

Milestone 1: Authority Snapshot Implementation
Milestone 2: Replay Baseline Implementation
Milestone 3: Replay Diff Implementation
Milestone 4: Authority Export Verification Implementation
Milestone 5: Policy Manifest Implementation
Milestone 6: Policy Hashing Implementation
Milestone 7: Diagnostic Metadata Implementation
Milestone 8: Governance Reporting Implementation
Milestone 9: Replay Provenance Reporting Implementation
Milestone 10: Federation Readiness Audit Implementation

Current posture:

PathWarden now has a local evidence/reporting foundation.
Artifacts are generated on demand.
Reports are schema-valid.
Missing evidence is declared rather than hidden.
Generated exports remain outside git.
Federation readiness remains advisory and non-executable.

## Post-v0.1.3 Verification and Input Hardening Pass

Status:

```text
implementation complete
verification hardening complete
input support complete
checks passing

Completed after tag:

pw-v0.1.3-evidence-reporting-foundation

Purpose:

Harden the evidence/reporting layer before any federation runtime work.
Keep federation readiness as an assessment artifact only.
Prevent report drift, hidden lineage gaps, and overstated readiness confidence.

Completed items:

1. Governance Report Verification

Implemented files:

scripts/dev/verify-governance-report.ts

Package script:

npm run verify:governance-report -- <governance_report_json_path>

Current behavior:

verifies governance report schema shape
checks required evidence sections
checks deterministic artifact references
supports diagnostics.overall_status
confirms replay-incomplete reports remain release_safe false
detects overstated summary status
detects secret-like key leakage
fails closed on invalid reports

Implementation remains conservative:

verification only
no runtime behavior
no federation behavior
no signing
no network behavior
no delegated authority
2. Replay Provenance Report Verification

Implemented files:

scripts/dev/verify-replay-provenance-report.ts

Package script:

npm run verify:replay-provenance-report -- <replay_provenance_report_json_path>

Current behavior:

verifies replay provenance report shape
checks deterministic artifact references
checks deterministic lineage gaps
confirms missing baseline creates missing_replay_baseline gap
confirms missing diff creates missing_replay_diff gap
confirms incomplete lineage keeps lineage.complete false
confirms incomplete lineage keeps lineage.explainable false
confirms incomplete lineage keeps summary.admissible false
detects secret-like key leakage
fails closed on invalid reports

Implementation remains conservative:

verification only
no replay mutation
no executable replay behavior
no signing
no federation behavior
3. Federation Readiness Audit Verification

Implemented files:

scripts/dev/verify-federation-readiness-audit.ts

Package script:

npm run verify:federation-readiness-audit -- <federation_readiness_audit_json_path>

Current behavior:

verifies federation readiness audit shape
checks deterministic artifact references
confirms federation.ready remains false when governance is incomplete or not release-safe
confirms federation.ready remains false when replay provenance is incomplete, inadmissible, or lineage incomplete
confirms summary.ready_for_federation is not overstated
confirms missing readiness requirements are declared
confirms federation runtime behavior remains intentionally not implemented
confirms cross-runtime trust negotiation remains intentionally not implemented
detects secret-like keys
rejects forbidden runtime-like federation fields
fails closed on invalid audits

Implementation remains conservative:

verification only
readiness assessment only
no federation runtime
no delegated authority
no signing
no network behavior
no cross-runtime trust negotiation
4. Passive Diagnostic Registry Integration

Updated files:

core/common/diagnostics/diagnosticRegistry.ts

Registered planned diagnostics:

diag.governance.report_verification
diag.replay.provenance_verification
diag.federation.readiness_verification

Current behavior:

registers report verification diagnostics as planned metadata
keeps active diagnostics count unchanged
keeps blocking diagnostics count unchanged
does not wire report verifiers into npm run diag
does not introduce grouped diagnostic execution
does not replace existing diagnostic runner

Expected registry posture:

total diagnostics: 10
active diagnostics: 7
planned diagnostics: 3
blocking diagnostics: 7
ci-compatible diagnostics: 10
5. Diagnostic Metadata Verification Hardening

Updated files:

scripts/dev/verify-diagnostic-metadata.ts

Current behavior:

validates registry shape
checks duplicate IDs
checks missing dependencies
checks diagnostic ID pattern
checks self-referential dependencies
checks active diagnostics have tags
checks empty tags
checks blocking diagnostics are CI-compatible
checks active CI-compatible diagnostics do not require network
checks active diagnostics do not require manual approval
reports active, planned, blocking, and CI-compatible counts

Implementation remains conservative:

metadata verification only
no diagnostic execution changes
no grouped runner
no npm run diag rewiring
6. Governance Report Optional Replay Inputs

Updated files:

core/audit/governanceReport.ts
scripts/dev/export-governance-report.ts
schemas/audit/governance-report.schema.json
core/audit/federationReadinessAudit.ts

Current behavior:

npm run export:governance-report

continues to produce the advisory default posture:

Replay status: incomplete
Replay baseline id: null
Replay diff id: null
Summary status: incomplete
Release safe: false

Optional input behavior:

npm run export:governance-report -- <replay_baseline_json_path> <replay_diff_json_path>

supports fuller replay evidence by:

reading replay baseline JSON
reading replay diff JSON
validating schema_version values
extracting baseline_id and diff_id
adding replay_baseline and replay_diff artifact references
setting replay IDs in the governance report
failing closed if only one path is supplied
failing closed if files are missing or invalid

Implementation remains conservative:

evidence-aware reporting only
no replay execution
no federation runtime
no signing
no network behavior
7. Federation Readiness Optional Replay Inputs

Updated files:

core/audit/federationReadinessAudit.ts
scripts/dev/export-federation-readiness-audit.ts

Current behavior:

npm run export:federation-readiness-audit

continues to produce the advisory default posture:

Governance status: incomplete
Governance release safe: false
Replay provenance status: incomplete
Replay provenance admissible: false
Replay lineage complete: false
Federation ready: false
Ready for federation: false

Optional input behavior:

npm run export:federation-readiness-audit -- <replay_baseline_json_path> <replay_diff_json_path>

supports fuller replay evidence by:

reading replay baseline JSON
reading replay diff JSON
validating schema_version values
passing replay evidence into governance report construction
passing replay evidence into replay provenance construction
failing closed if only one path is supplied
failing closed if files are missing or invalid

Implementation remains conservative:

readiness assessment only
no federation runtime
no delegated authority
no cross-runtime trust negotiation
no signing
no network behavior
no executable federation actions

Current pass result:

Phase 1 complete: Evidence Verification Hardening
Phase 2 complete: Passive Diagnostic Registry Integration
Phase 3 complete: Report Input Support
Phase 4 in progress: Documentation, final verification, tag

Next verification pass:

npm run check
npm run diag
npm run verify:diagnostic-metadata
npm run export:governance-report
npm run export:replay-provenance-report
npm run export:federation-readiness-audit

$latestGov = Get-ChildItem ".\exports\governance" -Filter "govreport_*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName

$latestReplay = Get-ChildItem ".\exports\replay" -Filter "replayprov_*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName

$latestFed = Get-ChildItem ".\exports\federation" -Filter "fedready_*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName

npm run verify:governance-report -- "$latestGov"
npm run verify:replay-provenance-report -- "$latestReplay"
npm run verify:federation-readiness-audit -- "$latestFed"

git status --short

Suggested next tag:

pw-v0.1.4-report-verification-hardening

Tag command after final verification and commit:

git push
git tag -a pw-v0.1.4-report-verification-hardening -m "PathWarden v0.1.4 report verification hardening"
git push origin pw-v0.1.4-report-verification-hardening

Next recommended implementation focus after tag:

Do not start federation runtime.
Do not wire report verifiers into npm run diag yet unless explicitly planned.
Recommended next pass: documentation cleanup, verifier fixtures, or report input test fixtures.


## v0.1.5 Report Fixtures and Regression Hardening Pass

Status:

```text
implementation complete
fixture coverage complete
documentation complete
diagnostic metadata registration complete
pending final verification and tag

Target tag:

pw-v0.1.5-report-fixtures-and-regression-hardening

Purpose:

Add regression coverage around report verifiers and report input support.
Reduce risk of silent verifier drift.
Keep federation readiness advisory and non-executable.

Completed items:

1. Governance Report Verifier Fixtures

Implemented files:

tests/fixtures/governance-report/valid-incomplete.json
tests/fixtures/governance-report/invalid-release-safe-overstated.json
tests/fixtures/governance-report/invalid-missing-artifacts.json
scripts/dev/test-governance-report-verifier.ts

Package script:

npm run test:governance-report-verifier

Current coverage:

valid incomplete governance report passes
overstated release_safe fails
missing artifacts fail
2. Replay Provenance Verifier Fixtures

Implemented files:

tests/fixtures/replay-provenance-report/valid-incomplete.json
tests/fixtures/replay-provenance-report/invalid-missing-baseline-gap.json
tests/fixtures/replay-provenance-report/invalid-admissible-overstated.json
scripts/dev/test-replay-provenance-verifier.ts

Package script:

npm run test:replay-provenance-verifier

Current coverage:

valid incomplete replay provenance report passes
missing baseline lineage gap fails
overstated admissibility fails
3. Federation Readiness Verifier Fixtures

Implemented files:

tests/fixtures/federation-readiness-audit/valid-not-ready.json
tests/fixtures/federation-readiness-audit/invalid-ready-overstated.json
tests/fixtures/federation-readiness-audit/invalid-missing-requirements.json
tests/fixtures/federation-readiness-audit/invalid-runtime-field.json
scripts/dev/test-federation-readiness-verifier.ts

Package script:

npm run test:federation-readiness-verifier

Current coverage:

valid not-ready federation readiness audit passes
overstated readiness fails
missing readiness requirements fail
runtime-like federation fields fail
4. Shared Report Verifier Utilities

Implemented files:

scripts/dev/lib/reportVerifierUtils.ts

Refactored files:

scripts/dev/verify-governance-report.ts
scripts/dev/verify-replay-provenance-report.ts
scripts/dev/verify-federation-readiness-audit.ts

Current behavior:

shared JSON loading
shared object guards
shared status helpers
shared incomplete-status detection
shared secret-like key detection
shared artifact reference validation
shared failure printing

Regression protection:

governance verifier fixtures pass
replay provenance verifier fixtures pass
federation readiness verifier fixtures pass
5. Report Input Support Fixtures

Implemented files:

tests/fixtures/replay-inputs/replay-baseline.valid.json
tests/fixtures/replay-inputs/replay-diff.valid.json
tests/fixtures/replay-inputs/replay-baseline.invalid-schema.json
scripts/dev/test-report-input-support.ts

Package script:

npm run test:report-input-support

Current coverage:

governance report accepts replay baseline and replay diff inputs
governance report includes replay baseline and replay diff IDs
federation readiness audit accepts replay baseline and replay diff inputs
federation readiness remains not ready
one-argument input fails closed
bad replay baseline schema fails closed
6. Report Verifier Usage Documentation

Implemented files:

docs/audit/REPORT_VERIFIER_USAGE.md

Current coverage:

verifier purpose
verifier commands
export commands
fixture test commands
recommended verification sequence
explicit boundaries
7. Evidence Posture Summary

Implemented files:

docs/audit/EVIDENCE_POSTURE_SUMMARY.md

Current coverage:

what evidence exists
what is verified
what remains advisory
what is intentionally not implemented
what is required before runtime federation
8. Planned Fixture Diagnostic Metadata

Updated files:

core/common/diagnostics/diagnosticRegistry.ts

Registered planned diagnostics:

diag.governance.report_verifier_fixtures
diag.replay.provenance_verifier_fixtures
diag.federation.readiness_verifier_fixtures
diag.reporting.input_fixture_verification

Current registry posture:

active diagnostics unchanged
planned diagnostics increased
no npm run diag wiring
no grouped execution
metadata only

Expected diagnostic metadata counts:

total diagnostics: 14
active diagnostics: 7
planned diagnostics: 7
blocking diagnostics: 7
ci-compatible diagnostics: 14

Implementation remains conservative:

no federation runtime
no delegated authority
no signing
no network behavior
no cross-runtime trust negotiation
no executable federation actions
no diagnostic runner replacement

Final verification command set:

npm run check
npm run diag
npm run verify:diagnostic-metadata

npm run export:governance-report
npm run export:replay-provenance-report
npm run export:federation-readiness-audit

$latestGov = Get-ChildItem ".\exports\governance" -Filter "govreport_*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName

$latestReplay = Get-ChildItem ".\exports\replay" -Filter "replayprov_*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName

$latestFed = Get-ChildItem ".\exports\federation" -Filter "fedready_*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName

npm run verify:governance-report -- "$latestGov"
npm run verify:replay-provenance-report -- "$latestReplay"
npm run verify:federation-readiness-audit -- "$latestFed"

npm run test:governance-report-verifier
npm run test:replay-provenance-verifier
npm run test:federation-readiness-verifier
npm run test:report-input-support

git status --short

Recommended next pass after tag:

Do not start federation runtime yet.
Recommended next options:
1. verifier fixture expansion
2. report fixture schema validation tests
3. documentation cleanup
4. release evidence summary
5. diagnostic runner design only, not implementation

