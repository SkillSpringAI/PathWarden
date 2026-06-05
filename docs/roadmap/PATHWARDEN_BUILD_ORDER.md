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
not started

Start next session.

Implementation should follow:

docs/diagnostics/DIAGNOSTIC_METADATA_DESIGN.md

Expected first files:

core/common/diagnostics/diagnosticMetadata.ts
core/common/diagnostics/diagnosticRegistry.ts
schemas/diagnostics/diagnostic-metadata.schema.json

design complete
implementation not started

Design document:

docs/diagnostics/DIAGNOSTIC_METADATA_DESIGN.md

Likely implementation files:

core/common/diagnostics/diagnosticMetadata.ts
core/common/diagnostics/diagnosticRegistry.ts
schemas/diagnostics/diagnostic-metadata.schema.json
8. Governance Reporting

Status:

design complete
implementation not started

Design document:

docs/governance/GOVERNANCE_REPORTING_DESIGN.md

Likely implementation files:

core/audit/governanceReport.ts
schemas/audit/governance-report.schema.json
scripts/dev/export-governance-report.ts
9. Replay Provenance Reports

Status:

design complete
implementation not started

Design document:

docs/replay/REPLAY_PROVENANCE_REPORTING_DESIGN.md

Likely implementation files:

core/audit/replayProvenanceReport.ts
schemas/audit/replay-provenance-report.schema.json
scripts/dev/export-replay-provenance-report.ts
10. Federation Readiness Audit

Status:

design complete
implementation not started

Design document:

docs/federation/FEDERATION_READINESS_AUDIT_DESIGN.md

Likely implementation files:

core/audit/federationReadinessAudit.ts
schemas/audit/federation-readiness-audit.schema.json
scripts/dev/export-federation-readiness-audit.ts
Next Implementation Pass
Milestone 1: Authority Snapshot Implementation

Start here.

Implementation should follow:

docs/governance/AUTHORITY_SNAPSHOT_DESIGN.md

Initial conservative implementation target:

schema-valid authority snapshot export
deterministic authority record ordering
repository-safe output
trust context placeholder or reference
revocation context declaration
no secrets
no signing
no federation semantics
no executable behavior

Expected first files:

schemas/audit/authority-snapshot.schema.json
core/audit/authoritySnapshot.ts
scripts/dev/export-authority-snapshot.ts
Pacing Principle

Do not expand the system merely because an abstraction is interesting.

Expansion is justified only when:

current code becomes hard to reason about
diagnostics require the abstraction
replay requires the abstraction
federation requires the abstraction
external audit requires the abstraction
Current State
design foundation complete
implementation pass ready
working tree expected clean

