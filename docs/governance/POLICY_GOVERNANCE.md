# PathWarden Policy Governance

## Purpose

PathWarden policy files define runtime governance behaviour.

Policy governance exists to ensure that policy state remains:

```text
explicit
versionable
auditable
replayable
inspectable

Policy should not be treated as loose configuration once it begins shaping authority, trust, execution, replay, and diagnostics.

Current Policy Surface

Current policy domains include:

policy/authority/
policy/grants/
policy/invariants/
policy/modes/
policy/refusals/
policy/registry/
policy/risk/
policy/runtime/
policy/triggers/
policy/trust/

These domains govern:

permission-token revocation
application grants
governance invariants
mode policy
refusal codes
application and tool registries
risk rules
execution policy
trigger definitions
governance trust manifests
Current Status

Current state:

policy domains exist
policy files are loaded by runtime code
several policy files are schema-validated
trust policy is signer-aware
revocation policy affects replay and execution
trigger policy affects governance drift checks

Not yet implemented:

policy bundle manifest
policy version identifiers
policy hash manifest
policy provenance metadata
policy migration tracking
policy replay snapshots
policy signing
Policy as Governance Evidence

As PathWarden matures, policy should become replay-relevant evidence.

Replay should eventually be able to answer:

which policy version applied
which policy files were loaded
whether policy changed after execution
whether replay used equivalent policy state

This is not yet implemented.

Future Policy Manifest

A future policy manifest may include:

schema_version
policy_bundle_id
policy_version
generated_at
policy_file_hashes
policy_domains
active_runtime_profile
trust_manifest_fingerprint
trigger_registry_hash
execution_policy_hash
revocation_policy_hash

Potential future file:

policy/policy-manifest.json
Future Policy Hashing

Policy hashing may eventually cover:

execution-policy.json
trigger-registry.json
permission-token-revocations.json
governance-trust-manifest.json
app-grants.json
app-registry.json
tool-registry.json
risk-rules.json
refusal-codes.json
invariants.json

Hashing should be introduced only when replay or diagnostics need to prove policy consistency.

Mode Policy Note

The current mode policy files appear to be placeholders:

policy/modes/assistant.policy.json
policy/modes/connect.policy.json
policy/modes/core.policy.json

These should be reviewed later before mode-specific enforcement expands.

Possible future work:

mode policy schemas
mode capability boundaries
mode-specific trigger rules
mode-specific execution constraints
mode-specific refusal semantics
Policy Versioning Pacing Rule

Do not implement policy versioning just because the policy surface exists.

Introduce policy manifests or hashes when one or more of the following becomes true:

replay must prove policy equivalence
diagnostics need policy drift detection
federation requires portable policy context
external audit requires policy provenance
mode-specific governance becomes active

Until then, policy governance should remain documented and intentionally paced.

Future Candidates

Potential future files:

core/policy/policyManifest.ts
core/policy/policyHasher.ts
core/policy/policyVersion.ts
core/policy/policySnapshot.ts
schemas/policy/policy-manifest.schema.json
scripts/dev/export-policy-manifest.ts
scripts/dev/verify-policy-manifest.ts
Required Validation

After policy-related code changes:

npm run check
npm run diag

Before committing policy changes:

git diff
git status --short
