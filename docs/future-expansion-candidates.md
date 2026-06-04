# Future Expansion Candidates

## Purpose

This document tracks PathWarden files and subsystems that are intentionally lightweight today but likely to expand later.

Items listed here are not active implementation commitments.

They are parked candidates for future review when operational need justifies added complexity.

## Governance / Kernel

### Current lightweight files

```text
core/kernel/triggerRegistry.ts
core/kernel/refusal.ts
core/kernel/refusalCodes.ts
core/kernel/permissionTokenBuilder.ts
core/kernel/types.ts
Expected refinements
trigger categories
trigger provenance
federation trigger namespaces
structured refusal metadata
refusal remediation hints
cryptographic permission-token signing
authority scope narrowing
federation execution envelopes
distributed trace semantics
Activation threshold

Expand these files when governance logic becomes difficult to express through the current compact structures.

Audit / Authority / Replay
Current lightweight files
core/audit/auditWriter.ts
core/audit/authorityReader.ts
core/audit/authorityWriter.ts
core/audit/executionReplay.ts
Expected refinements
append integrity verification
replay checkpoints
authority snapshots
replay caching
partial replay reconstruction
chained authority persistence
federation replay support
replay divergence detection
Activation threshold

Expand these files when replay or authority persistence becomes a primary governance artifact rather than supporting infrastructure.

Diagnostic System
Future candidates
core/common/diagnostics/diagnosticRunner.ts
core/common/diagnostics/diagnosticRegistry.ts
core/common/diagnostics/diagnosticGrouping.ts
core/common/diagnostics/diagnosticReportWriter.ts
core/common/diagnostics/diagnosticSeverity.ts
Expected refinements
diagnostic categories
deterministic grouped execution
diagnostic dependency ordering
governance-only diagnostic runs
replay-only diagnostic runs
federation diagnostic suites
CI-compatible report outputs
drift comparison against previous diagnostic baselines
Activation threshold

Introduce this structure only when diagnostic count, federation complexity, or CI requirements justify the extra abstraction.

Execution Replay System
Future candidates
core/audit/replayDiff.ts
core/audit/replaySnapshot.ts
core/audit/replayBaseline.ts
core/audit/replayDriftDetector.ts
core/audit/replayExportVerifier.ts
Expected refinements
deterministic replay comparison
replay divergence detection
baseline snapshots
governance drift analysis
replay provenance verification
export consistency validation
historical trust snapshots
policy-version-aware replay
federation-compatible replay bundles
Activation threshold

Introduce this structure when replay becomes a primary governance artifact rather than a debugging utility.

Policy Governance
Future candidates
core/policy/policyManifest.ts
core/policy/policyHasher.ts
core/policy/policyVersion.ts
core/policy/policySnapshot.ts
schemas/policy/policy-manifest.schema.json
scripts/dev/export-policy-manifest.ts
scripts/dev/verify-policy-manifest.ts
Expected refinements
policy bundle manifests
policy file hashing
policy version identifiers
policy provenance metadata
policy replay snapshots
trust-manifest fingerprint binding
trigger-registry hash binding
execution-policy hash binding
Activation threshold

Introduce policy governance when replay must prove policy equivalence, diagnostics need policy drift detection, or federation requires portable policy context.

Federation
Future candidates
core/federation/federationTrustManifest.ts
core/federation/delegatedAuthorityArtifact.ts
core/federation/authorityPropagationEnvelope.ts
core/federation/federatedReplayBundle.ts
core/federation/runtimeTrustRegistry.ts
Expected refinements
runtime trust registries
delegated authority artifacts
portable replay bundles
cross-runtime legitimacy artifacts
federated signer namespaces
authority propagation envelopes
Activation threshold

Introduce federation only when multiple governed runtimes exist and portable authority becomes operationally necessary.

General Pacing Rule

Do not expand candidates merely because they are architecturally interesting.

A candidate should become active implementation only when one of the following is true:

current code becomes hard to reason about
diagnostics require the abstraction
replay requires the abstraction
federation requires the abstraction
external audit requires the abstraction
