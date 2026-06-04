# PathWarden Governance

## Purpose

PathWarden is a governed execution system.

Its purpose is not simply to execute actions.

Its purpose is to ensure that execution remains:

```text
authorised
bounded
auditable
replayable
revocable
inspectable

Governance exists to determine whether execution should occur before execution is allowed to occur.

Governance Principles

PathWarden follows several core principles:

Fail Closed

Unknown or invalid authority should refuse execution.

PathWarden prefers refusal over unsafe execution.

Explicit Authority

Execution authority must be created, validated, and traceable.

Authority should never be implied.

Replayability

Governance decisions should be reconstructable after execution.

Replay must remain possible even after long periods of time.

Auditability

Governance decisions must leave evidence.

Evidence should be inspectable independently of runtime state.

Determinism

Equivalent inputs should produce equivalent governance outcomes.

Replay and diagnostics depend on stable behaviour.

Governance Architecture

High-level governance flow:

Capability Validation
        ↓
Permission Token Issuance
        ↓
Legitimacy Artifact Creation
        ↓
Execution Validation
        ↓
Execution
        ↓
Audit Persistence
        ↓
Replay Reconstruction

Governance exists before execution.

Execution should never bypass governance.

Authority Model

Authority is represented through governed artifacts.

Current authority artifacts include:

permission tokens
legitimacy artifacts
authority records

These artifacts form the authority chain used by replay and diagnostics.

Permission Tokens

Permission tokens define execution authority.

Current token responsibilities include:

tool identity
application identity
granted operations
risk ceiling
approval requirements
issuer identity
expiry
audit requirements

Tokens are validated before execution occurs.

Tokens may also be revoked.

Legitimacy Artifacts

Legitimacy artifacts capture why authority was granted.

They bind:

authority chain
trigger state
approval state
decision context
governance lineage

Legitimacy artifacts act as replayable governance evidence.

Refusals

PathWarden refusals are governed outcomes.

Refusals are not generic runtime exceptions.

A refusal contains:

decision code
refusal code
message
invariant identifier
trigger hits
audit requirements

Refusals provide deterministic and replayable failure semantics.

Trigger System

Triggers activate governance behaviour.

Examples include:

escalation
audit requirements
policy enforcement
refusal paths
diagnostic reporting

Triggers are resolved through the trigger registry.

Unknown triggers should not silently alter governance behaviour.

Trust and Signing

The trust system validates governance evidence.

Current trust capabilities include:

signer validation
fingerprint verification
purpose validation
signer expiry validation
historical trust evaluation
multi-signer support

Trust exists to verify that governance evidence originated from recognised authority.

Audit Layer

Audit records provide operational evidence.

Audit records capture:

decisions
outcomes
authority references
trigger activity
execution history

Audit records are append-only evidence artifacts.

Replay Layer

Replay reconstructs governance history.

Replay currently validates:

authority chain hashes
authority record hashes
authority continuity
revocation state
audit linkage

Replay is treated as governance evidence reconstruction rather than debugging infrastructure.

Diagnostics

Diagnostics continuously verify governance integrity.

Current diagnostic domains include:

configuration
schema validation
governance validation
audit validation
execution sandbox validation
trust diagnostics
replay diagnostics

Diagnostics help detect governance drift before execution problems occur.

Current Governance Status

Implemented:

permission tokens
legitimacy artifacts
authority persistence
authority replay
trust validation
signer lifecycle validation
revocation handling
audit persistence
diagnostic reporting

Planned:

authority delegation
federation trust
distributed replay
governance namespaces
policy versioning
cross-runtime authority propagation
Future Governance Work

Future governance evolution may include:

cryptographic authority chains
delegated authority models
federated trust networks
cross-node governance
portable replay bundles
governance consensus mechanisms

These capabilities should be introduced only when existing governance layers justify the additional complexity.

Pacing Rule

Governance complexity should follow operational need.

PathWarden should avoid introducing:

delegation
federation
consensus
distributed authority

before local governance semantics are fully stable.

The system should remain:

governance-first
replayable
auditable
bounded

throughout its evolution.

Required Validation

After governance-related code changes:

npm run check
npm run diag

Before merging governance changes:

git diff
git status --short
