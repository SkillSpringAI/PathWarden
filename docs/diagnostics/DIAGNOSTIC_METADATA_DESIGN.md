# Diagnostic Metadata Design

## Purpose

Diagnostic metadata defines how PathWarden diagnostics describe their identity, category, severity, dependencies, scope, and execution context.

It is intended to support:

```text
diagnostic categorization
deterministic diagnostic grouping
CI-aware diagnostic runs
governance-only diagnostic runs
replay-only diagnostic runs
future diagnostic registry support
future governance reporting
future federation readiness

Diagnostic metadata is not a diagnostic result by itself.

It is descriptive structure for diagnostics.

Current Milestone

This document covers design only.

No runtime implementation is introduced by this milestone.

Problem Statement

PathWarden already has a central diagnostic runner and several diagnostic categories covering governance, trust, replay, authority, tasks, and exports.

However, diagnostics do not yet have a formal metadata model that can answer:

which subsystem owns this diagnostic
what category does it belong to
how severe is failure
can it run in CI
does it require filesystem access
does it require replay artifacts
does it require authority records
does it depend on another diagnostic
is it blocking or advisory

A diagnostic metadata model provides the missing structure.

Design Goals

Diagnostic metadata should be:

deterministic
machine-readable
human-readable
registry-ready
CI-compatible
governance-aware
replay-aware
future-compatible with federation
Non-Goals

Diagnostic metadata should not:

execute diagnostics
replace diagnostic logic
replace diagnostic results
grant authority
modify runtime state
hide diagnostic failure
auto-resolve failures
Metadata Boundary

Diagnostic metadata describes a diagnostic.

Included:

diagnostic id
name
description
category
subsystem
severity
blocking status
CI compatibility
required inputs
dependencies
tags
owner area
status

Excluded:

private keys
raw secrets
full diagnostic output
runtime logs
execution records
authority record contents
user approval UI state
Proposed Metadata Shape
{
  "id": "diag.authority.snapshot.schema",
  "name": "Authority Snapshot Schema Validation",
  "description": "Validates authority snapshot artifacts against the authority snapshot schema.",
  "category": "authority",
  "subsystem": "audit",
  "severity": "critical",
  "blocking": true,
  "ci_compatible": true,
  "requires": {
    "filesystem": true,
    "authority_records": true,
    "trust_manifest": false,
    "replay_artifacts": false
  },
  "dependencies": [],
  "tags": [
    "authority",
    "schema",
    "governance"
  ],
  "status": "planned"
}
Recommended Categories

Initial categories:

governance
authority
trust
replay
policy
diagnostics
tasks
exports
federation
Recommended Subsystems

Initial subsystems:

kernel
audit
trust
replay
policy
diagnostics
executor
tasks
federation
Severity Values

Recommended severity values:

info
warning
critical
Blocking Semantics

Blocking diagnostics should fail the overall diagnostic run.

Advisory diagnostics should warn without failing the overall run.

Recommended interpretation:

blocking true = failure blocks release or commit confidence
blocking false = failure is visible but advisory
CI Compatibility

A diagnostic is CI-compatible only if it can run without:

local secrets
manual approval
machine-specific state
external network access
interactive UI input
Required Input Flags

Recommended input flags:

filesystem
authority_records
trust_manifest
replay_artifacts
policy_manifest
policy_hashes
execution_records
network
manual_approval
Dependency Semantics

Dependencies should be diagnostic IDs.

Example:

{
  "dependencies": [
    "diag.policy.manifest.schema"
  ]
}

Dependency rules:

dependencies must be deterministic
missing dependencies should be diagnostic metadata failures
cyclic dependencies should be invalid
dependencies should not create hidden execution order
Diagnostic Status Values

Recommended status values:

active
planned
deprecated
disabled
Relationship to Prior Milestones
authority snapshot = governance authority checkpoint
replay baseline = accepted replay reference checkpoint
replay diff = comparison artifact
authority export verification = admissibility check over authority exports
policy manifest = governance and policy context reference
policy hashing = integrity signal for policy manifest files
diagnostic metadata = descriptive structure for diagnostic identity and execution constraints

Diagnostic metadata should later support:

diagnostic registry
grouped execution
CI-aware diagnostics
governance reports
replay provenance reports
federation readiness audits
Future Implementation Candidates

Potential future files:

core/common/diagnostics/diagnosticMetadata.ts
core/common/diagnostics/diagnosticRegistry.ts
core/common/diagnostics/diagnosticGrouping.ts
schemas/diagnostics/diagnostic-metadata.schema.json

Potential documentation updates:

docs/diagnostics/DIAGNOSTIC_INDEX.md
docs/diagnostics/README.md
Future Diagnostic Candidates

Potential diagnostics:

diagnostic metadata schema validation
diagnostic id uniqueness check
diagnostic dependency validation
diagnostic cycle detection
diagnostic CI compatibility validation
diagnostic severity validation
diagnostic category validation
Open Questions
Should diagnostic metadata live beside diagnostic code or in a central registry?
Should planned diagnostics be included in the metadata registry, or only active diagnostics?
Should CI compatibility be declared manually or inferred?
Should advisory diagnostics ever block tagged releases?
Initial Recommendation

Start conservative.

The first implementation should define a metadata type and a small registry for active diagnostics only.

It should include diagnostic ID, category, subsystem, severity, blocking status, CI compatibility, requirements, dependencies, tags, and status.

Do not introduce grouped execution yet.

Do not introduce federation diagnostics yet.

Do not make metadata responsible for running diagnostics.

Status
design draft
implementation not started

