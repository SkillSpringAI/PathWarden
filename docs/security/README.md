# PathWarden Security Model

## Overview

PathWarden is designed as a governed local execution runtime.

Its security model is based on:

```text
bounded authority
+
explicit validation
+
auditability
+
replayability
+
fail-closed execution

The system assumes local execution is inherently high risk and therefore should require explicit governance before actions execute.

Security principles
1. Local-first execution

PathWarden currently operates locally.

Current execution scope:

local filesystem operations
local task execution
local audit persistence
local replay reconstruction

The current implementation does not require:

cloud infrastructure
external orchestration
remote authority services

This reduces external attack surface during early development.

2. Explicit authority

PathWarden does not allow execution authority to exist implicitly.

Authority is represented through explicit objects:

capability grants
permission tokens
legitimacy artifacts
execution policies
trigger registries

Execution should only occur when authority is inspectable and replayable.

Permission-token security
Purpose

Permission tokens are bounded authority envelopes.

They define:

who requested authority
what operation is allowed
maximum risk level
approval requirements
expiry
audit expectations

Permission tokens are validated during execution.

Enforcement

Permission-token validation currently checks:

operation scope
trace consistency
expiry
revocation state
risk ceiling compatibility

Failures result in refusal instead of partial execution.

Revocation

Permission-token revocation is controlled through:

policy/authority/permission-token-revocations.json

Revoked tokens fail validation before execution proceeds.

Replay also surfaces revoked-token evidence.

Audit security
Audit persistence

Audit records are written locally under:

audit/

Audit output includes:

trace IDs
decision codes
refusal codes
trigger hits
plan IDs
commit IDs
authority references
Replay model

Replay reconstructs execution state from persisted records.

Replay currently supports:

authority replay
execution replay
trace reconstruction
revoked-token visibility

Replay utilities:

npm run replay:trace -- <trace_id>
npm run export:trace -- <trace_id>
Trigger governance

Runtime trigger behaviour is governed through:

policy/triggers/trigger-registry.json

Runtime trigger hits are validated against the registry.

Unknown or disabled triggers emit drift warnings instead of silently diverging.

This reduces governance drift between:

runtime behaviour
and
declared governance state
Execution policy security

Execution policy is controlled through:

policy/runtime/execution-policy.json

Current policy controls include:

mandatory permission tokens
mandatory audit
legacy execution compatibility

This allows staged hardening instead of unsafe migration.

Schema validation

Major governance objects are schema-validated.

Examples include:

actions
plans
commits
trigger registries
execution policies
revocation lists

Schema validation is fail-closed.

Invalid governance objects should refuse execution rather than degrade silently.

Current security limitations

PathWarden is still early-stage infrastructure.

The current implementation does not yet provide:

cryptographic signing
secure hardware-backed authority
remote revocation propagation
distributed consensus
federation trust validation
tamper-proof audit chains
encrypted audit persistence
secure multi-user isolation
production-grade sandboxing

Current replay and authority systems are governance-focused, not cryptographically authoritative.

Planned security direction

Future security work may include:

signed permission tokens
authority-chain hashing
tamper-evident replay chains
delegated authority
federation-aware authority envelopes
revocation propagation
governance export signing
distributed trace verification

These are intentionally deferred until the local governance model stabilises.

Threat model assumptions

Current assumptions:

developer-controlled local environment
trusted local runtime
non-hostile local operator
governance integrity more important than convenience
deterministic refusal preferred over permissive fallback

The current architecture prioritises:

governance correctness
before
autonomous capability expansion
Security philosophy

PathWarden treats execution authority as a security boundary.

The goal is not merely preventing malicious execution.

The goal is ensuring that execution remains:

bounded
inspectable
replayable
revocable
auditable

even as automation complexity increases.
