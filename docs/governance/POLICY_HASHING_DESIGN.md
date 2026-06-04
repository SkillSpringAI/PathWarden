# Policy Hashing Design

## Purpose

Policy hashing defines how PathWarden will produce stable hashes for governance, policy, trigger, trust, and schema files.

It is intended to support:

```text
policy drift detection
replay policy equivalence
governance context verification
authority snapshot binding
future provenance reports
future federation readiness

Policy hashes are not execution commands.

They are verification signals.

Current Milestone

This document covers design only.

No runtime implementation is introduced by this milestone.

Problem Statement

PathWarden now has design coverage for policy manifests.

A manifest can describe which files belong to the active governance context, but without hashing it cannot prove whether those files changed between runs.

Policy hashing answers:

which policy files were hashed
which hash algorithm was used
whether file contents changed
whether two replay runs used equivalent policy context
whether governance drift occurred
whether authority or replay artifacts can bind to a stable policy context
Design Goals

Policy hashing should be:

deterministic
stable across runs
file-order independent
schema-compatible
diagnostic-friendly
replay-compatible
authority-compatible
future-compatible with federation
Non-Goals

Policy hashing should not:

grant authority
execute actions
replace policy manifests
replace schema validation
replace trust validation
hide policy drift
auto-approve changed policy context
Hashing Boundary

Policy hashing covers governance-context files.

Included:

policy files
governance files
trigger files
trust manifest files
schema files
diagnostic policy references later

Excluded:

private keys
raw secrets
runtime logs
execution records
temporary files
user approval UI state
node_modules
build outputs
Recommended Hash Algorithm

Initial recommendation:

sha256

Rationale:

widely supported
stable
sufficient for file integrity checks
available through Node crypto
simple to audit

This is not intended to be a full cryptographic authority chain yet.

It is file-integrity hashing.

Proposed Hash Entry Shape
{
  "path": "config/access-policy.json",
  "kind": "policy",
  "required": true,
  "hash_algorithm": "sha256",
  "hash": "..."
}
Proposed Manifest Hashing Shape

This extends the policy manifest design.

{
  "hashing": {
    "hash_algorithm": "sha256",
    "hashes_available": true,
    "file_hashes": [
      {
        "path": "config/access-policy.json",
        "kind": "policy",
        "required": true,
        "hash_algorithm": "sha256",
        "hash": "..."
      }
    ],
    "manifest_hash": "..."
  }
}
Manifest Hash

A policy manifest may later include a manifest-level hash.

The manifest hash should be calculated from a deterministic normalized representation of the manifest.

Initial recommendation:

file hashes first
manifest hash later

Reason:

file-level hashing gives immediate value
manifest-level hashing requires stricter canonicalization
Deterministic Ordering

File hash entries must be sorted by:

kind
path

This prevents false drift caused by ordering differences.

Path Normalization

Paths should be normalized before hashing metadata is recorded.

Recommended path rules:

use repository-relative paths
use forward slashes in exported artifacts
do not store absolute local machine paths
reject paths outside the repository root

Example:

config/access-policy.json

Not:

C:\Users\Laptop\Desktop\PathWarden\config\access-policy.json
File Content Hashing

Hash the raw file bytes.

Do not normalize file content before hashing.

Reason:

hashing should detect exact file changes
line-ending differences may matter for reproducibility

If line-ending normalization is needed later, it should be explicit and versioned.

Missing File Semantics

Recommended handling:

required file missing = critical failure
optional file missing = warning
unexpected file missing from manifest = drift warning
Hash Verification Semantics

Hash verification should compare expected hash against current hash.

Recommended statuses:

match
mismatch
missing_required
missing_optional
not_checked
invalid_entry
Relationship to Prior Milestones
authority snapshot = governance authority checkpoint
replay baseline = accepted replay reference checkpoint
replay diff = comparison artifact
authority export verification = admissibility check over authority exports
policy manifest = governance and policy context reference
policy hashing = integrity signal for policy manifest files

Policy hashes should later be referenced by:

authority snapshots
replay baselines
replay diffs
governance reports
federation readiness audits
Secret Safety

Policy hashing should not print file contents.

Hashing output should include:

path
kind
required status
hash algorithm
hash
verification status

Hashing output should not include:

file body
secrets
private keys
tokens
passwords
environment variables
Future Implementation Candidates

Potential future files:

core/policy/policyHasher.ts
scripts/dev/hash-policy-manifest.ts
scripts/dev/verify-policy-hashes.ts

Potential schema updates:

schemas/policy/policy-manifest.schema.json
Future Diagnostic Candidates

Potential diagnostics:

policy hash generation check
policy hash verification check
policy hash deterministic ordering check
policy hash repository-relative path check
policy hash required file check
policy hash drift detection check
policy hash secret output check
Open Questions
Should manifest-level hashing be implemented in the first pass or later?
Should schema files be included from the start?
Should diagnostics fail on optional-file hash mismatch, or only warn?
Should hashing operate from a static allow-list or discover files from the policy manifest?
Initial Recommendation

Start conservative.

The first implementation should hash files listed in the policy manifest using SHA-256.

It should use repository-relative paths, deterministic ordering, and file-level hashes only.

Do not introduce manifest-level hashing in the first pass.

Do not introduce cryptographic signing yet.

Do not introduce federation semantics yet.

Do not print file contents.

Status
design draft
implementation not started

