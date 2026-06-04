# Policy Manifest Design

## Purpose

Policy manifests define how PathWarden describes the active governance and policy context used by the runtime.

They are intended to support:

```text
policy provenance
governance context verification
replay policy equivalence
future policy hashing
diagnostic drift checks
future federation readiness

A policy manifest is not an execution command.

It is a governance context artifact.

Current Milestone

This document covers design only.

No runtime implementation is introduced by this milestone.

Problem Statement

PathWarden has governance, policy, trigger, trust, authority, and replay structures.

However, replay and audit cannot yet formally answer:

which policy files were active
which governance files were active
which trigger registry version applied
which trust manifest version applied
whether two replay runs used equivalent policy context
whether policy drift occurred between runs

A policy manifest provides the missing reference layer.

Design Goals

Policy manifests should be:

deterministic
schema-valid
read-only once exported
hash-ready
diagnostic-friendly
replay-compatible
authority-compatible
future-compatible with federation
Non-Goals

Policy manifests should not:

grant authority
execute actions
replace policy files
replace trust manifests
replace trigger registries
modify governance state
hide policy drift
Manifest Boundary

A policy manifest describes policy and governance context.

Included:

manifest id
created timestamp
schema version
runtime identity
policy file references
governance file references
trigger file references
trust manifest references
schema references
future hash fields
diagnostic compatibility metadata

Excluded:

private keys
raw secrets
user approval UI state
execution records
full audit logs
file contents unless explicitly needed later
runtime-only temporary state
Proposed Manifest Shape
{
  "schema_version": "policy-manifest.v1",
  "manifest_id": "policymanifest_...",
  "created_at": "2026-06-05T00:00:00.000Z",
  "source": {
    "runtime": "pathwarden",
    "environment": "local"
  },
  "policy": {
    "files": []
  },
  "governance": {
    "files": []
  },
  "triggers": {
    "files": []
  },
  "trust": {
    "manifest_refs": []
  },
  "schemas": {
    "files": []
  },
  "hashing": {
    "hash_algorithm": null,
    "hashes_available": false,
    "file_hashes": []
  },
  "diagnostics": {
    "drift_check_eligible": true,
    "notes": []
  }
}
File Reference Shape

Recommended file reference shape:

{
  "path": "config/access-policy.json",
  "kind": "policy",
  "required": true,
  "hash": null
}
Policy File Categories

Initial categories:

policy
governance
trigger
trust
schema
diagnostic
Validation Rules

A valid policy manifest must:

include schema_version
include manifest_id
include created_at
include runtime source metadata
declare policy file references
declare governance file references
declare trigger file references
declare whether hashes are available
avoid secrets
preserve deterministic ordering
Deterministic Ordering

Manifest file references should be sorted by:

kind
path

This prevents false drift from file-order changes.

Relationship to Prior Milestones
authority snapshot = governance authority checkpoint
replay baseline = accepted replay reference checkpoint
replay diff = comparison artifact
authority export verification = admissibility check over authority exports
policy manifest = governance and policy context reference

Policy manifests should later be referenced by authority snapshots, replay baselines, replay diffs, and governance reports.

Relationship to Policy Hashing

Policy manifest design comes before policy hashing.

The manifest should be hash-ready, but hashes do not need to be implemented yet.

Recommended initial posture:

include hash fields
set hashes_available to false
leave individual hashes null

Policy hashing can later fill these fields without changing the manifest concept.

Future Implementation Candidates

Potential future files:

core/policy/policyManifest.ts
schemas/policy/policy-manifest.schema.json
scripts/dev/export-policy-manifest.ts
scripts/dev/verify-policy-manifest.ts
Future Diagnostic Candidates

Potential diagnostics:

policy manifest schema validation
policy manifest required file check
policy manifest deterministic ordering check
policy manifest secret leakage check
policy manifest drift eligibility check
policy manifest hash readiness check
Open Questions
Should the first manifest include schemas, or only policy and governance files?
Should missing optional files produce warnings or be omitted?
Should policy manifests be required before replay baselines are exported?
Should diagnostics generate temporary policy manifests automatically?
Initial Recommendation

Start conservative.

The first implementation should export a schema-valid policy manifest containing known policy, governance, trigger, trust, and schema references.

It should include hash-ready fields but not compute hashes yet.

Do not introduce federation semantics yet.

Do not introduce cryptographic signing yet.

Do not make manifests executable.

Status
design draft
implementation not started

