# PathWarden Architecture

## Overview

PathWarden is a governed local execution runtime.

The system is intentionally split into layers so that:

```text
authority
policy
execution
audit
replay

remain separable and inspectable.

The architecture prioritises:

explicit authority
bounded execution
deterministic validation
replayability
revocation
auditability
fail-closed behaviour

PathWarden is not designed as an unrestricted autonomous agent.

It is designed as a constrained execution layer capable of proving:

who authorised an action
why it was allowed
what executed
what policy applied
what audit evidence exists
whether authority was later revoked
High-level architecture
User / App
    ?
Capability Grant Validation
    ?
Permission Token Issuance
    ?
Legitimacy Artifact Generation
    ?
Task Creation
    ?
Task Runner
    ?
Execution Policy Validation
    ?
Permission Token Enforcement
    ?
Filesystem Execution
    ?
Audit Persistence
    ?
Authority Replay
    ?
Execution Replay
    ?
Trace Export
Main subsystems
1. Governance Kernel

Location:

core/kernel/

Responsible for:

capability grants
permission-token validation
legitimacy artifacts
trigger validation
trigger drift detection
execution policy enforcement
refusal construction
risk handling
invariant enforcement

The kernel is the authority layer.

It decides whether execution is legitimate before execution occurs.

2. Execution Layer

Location:

core/executor/

Responsible for:

committed execution
filesystem operations
policy enforcement
runtime validation
audit emission

The executor does not independently decide authority.

It executes only after governance approval succeeds.

3. Task System

Location:

core/tasks/

Responsible for:

task lifecycle
task queueing
task execution
approval gating
task audit events
authority propagation into execution

Tasks act as governance-aware execution envelopes.

4. Audit Layer

Location:

core/audit/
audit/

Responsible for:

audit event persistence
authority artifact persistence
replay reconstruction
trace export

The audit layer exists for:

debugging
forensic reconstruction
governance verification
future federation visibility
5. Policy Layer

Location:

policy/

Responsible for runtime governance configuration.

Current policy domains:

policy/runtime/
policy/triggers/
policy/authority/

Examples:

execution policy
trigger registry
token revocation list
6. Schema Layer

Location:

schemas/

All major governance objects are schema-validated.

Examples:

actions
plans
commits
triggers
policies
authority objects

PathWarden prefers explicit schemas over implicit runtime assumptions.

Authority model
Capability grants

Capability grants determine whether an application is allowed to request authority.

Capability grants evaluate:

app identity
tool identity
requested risk
approval requirement
registry state
policy compatibility

Successful grants issue:

permission token
+
legitimacy artifact
Permission tokens

Permission tokens are bounded authority objects.

Current token fields include:

token ID
trace ID
app ID
tool ID
granted operations
risk ceiling
approval requirement
issuer
expiry
audit requirement

Permission tokens are enforced during execution.

Revocation

Revocation is handled through:

policy/authority/permission-token-revocations.json

Revoked tokens fail validation and therefore fail execution.

Replay surfaces revoked-token evidence explicitly.

Replay system

Replay reconstructs execution history using:

authority records
audit events
execution traces
reconstructed authority chains

Replay utilities:

npm run replay:trace -- <trace_id>
npm run export:trace -- <trace_id>

Replay output includes:

permission token IDs
legitimacy artifact IDs
revoked token IDs
audit decision codes
reconstructed chain
Trigger system

Trigger definitions are stored in:

policy/triggers/trigger-registry.json

Runtime trigger hits are validated against the registry.

Unknown or disabled triggers generate drift warnings instead of silently diverging.

This prevents governance drift between:

runtime behaviour
and
declared governance state
Current execution boundaries

PathWarden currently supports:

local filesystem execution
governed task execution
replayable authority chains

PathWarden does not yet implement:

distributed execution
swarm orchestration
federation
cryptographic signing
remote authority propagation
autonomous planning

These are future layers.

Development methodology

PathWarden is intentionally developed incrementally.

Preferred workflow:

inspect
? patch narrowly
? run check
? run diagnostics
? commit clean milestone

Governance features should gain diagnostics before becoming mandatory.

The project prioritises architectural integrity over development speed.

Architectural direction

PathWarden is evolving toward:

governed execution infrastructure

rather than:

general automation tooling

The long-term direction includes:

federated governance
delegated authority
replayable distributed execution
authority-chain integrity
bounded orchestration
governance-first local automation
