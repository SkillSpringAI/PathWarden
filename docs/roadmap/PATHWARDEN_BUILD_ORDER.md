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
implementation not started

Design document:

docs/governance/AUTHORITY_SNAPSHOT_DESIGN.md

Likely implementation files:

core/audit/authoritySnapshot.ts
schemas/audit/authority-snapshot.schema.json
scripts/dev/export-authority-snapshot.ts
2. Replay Baseline Design

Status:

design complete
implementation not started

Design document:

docs/replay/REPLAY_BASELINE_DESIGN.md

Likely implementation files:

core/audit/replayBaseline.ts
schemas/audit/replay-baseline.schema.json
scripts/dev/export-replay-baseline.ts
3. Replay Diff Design

Status:

design complete
implementation not started

Design document:

docs/replay/REPLAY_DIFF_DESIGN.md

Likely implementation files:

core/audit/replayDiff.ts
schemas/audit/replay-diff.schema.json
scripts/dev/export-replay-diff.ts
4. Authority Export Verification

Status:

design complete
implementation not started

Design document:

docs/governance/AUTHORITY_EXPORT_VERIFICATION_DESIGN.md

Likely implementation files:

core/audit/authorityExportVerifier.ts
schemas/audit/authority-export-verification.schema.json
scripts/dev/verify-authority-export.ts
5. Policy Manifest Design

Status:

design complete
implementation not started

Design document:

docs/governance/POLICY_MANIFEST_DESIGN.md

Likely implementation files:

core/policy/policyManifest.ts
schemas/policy/policy-manifest.schema.json
scripts/dev/export-policy-manifest.ts
6. Policy Hashing

Status:

design complete
implementation not started

Design document:

docs/governance/POLICY_HASHING_DESIGN.md

Likely implementation files:

core/policy/policyHasher.ts
scripts/dev/hash-policy-manifest.ts
scripts/dev/verify-policy-hashes.ts
7. Diagnostic Metadata

Status:

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

