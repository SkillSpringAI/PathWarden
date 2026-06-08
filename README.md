# PathWarden

PathWarden is a local-first governed execution runtime for filesystem and task automation.

It is designed to execute local actions only when they pass explicit governance checks: schema validation, capability grants, permission-token authority, execution policy, audit logging, trace continuity, revocation checks, and replayable evidence.

PathWarden is not an autonomous agent. It is the governed local execution layer: the part of the system allowed to touch files, run approved tasks, emit audit records, and preserve forensic traces.

## Current status

PathWarden currently supports:

- Filesystem action planning and committed execution
- Schema-validated plans, commits, actions, authority artifacts, policies, and trigger registries
- Approval-gated task execution
- Capability grant validation
- Permission token issuance, validation, enforcement, and revocation
- Decision legitimacy artifacts
- Authority artifact persistence
- Authority and execution replay by trace ID
- Trace export utilities
- Runtime audit logging
- Task history and result archiving
- Trigger registry validation and drift warning
- Pre-commit checks using TypeScript and diagnostics

The current implementation remains local-first and filesystem-focused.

## Evidence and Reporting Status

Current evidence/reporting tag:

```text
pw-v0.1.5-report-fixtures-and-regression-hardening

PathWarden currently supports local evidence generation and verification for:

authority snapshots
replay baselines
replay diffs
authority export verification
policy manifests
policy hashing
diagnostic metadata
governance reports
replay provenance reports
federation readiness audits
report verifiers
verifier fixture tests
report input support tests

Current evidence posture:

local evidence generation is implemented
report verification is implemented
fixture-based regression coverage is implemented
report input support is tested
federation readiness remains advisory and non-executable

PathWarden does not currently implement:

federation runtime
delegated authority
cross-runtime trust negotiation
signing
network behavior
remote endpoint calls
runtime federation decisions
diagnostic runner replacement
grouped diagnostic execution

Recommended local verification sequence:

npm run check
npm run diag
npm run verify:diagnostic-metadata
npm run test:governance-report-verifier
npm run test:replay-provenance-verifier
npm run test:federation-readiness-verifier
npm run test:report-input-support
npm run test:report-fixture-schemas

Evidence references:

docs/audit/RELEASE_EVIDENCE_SUMMARY.md
docs/audit/EVIDENCE_POSTURE_SUMMARY.md
docs/audit/REPORT_VERIFIER_USAGE.md
docs/audit/REPORT_VERIFIER_NEGATIVE_CASE_MATRIX.md

## Governance model

PathWarden follows a simple execution rule:

```text
No local action should execute unless its authority, risk, policy, and audit path are explicit.
The main chain is:

Capability Grant
? Permission Token
? Legitimacy Artifact
? Task Payload
? Execution Policy
? Permission Token Validation
? Filesystem Execution
? Audit Event
? Authority Replay
? Execution Replay
Authority model

PathWarden now treats execution authority as a first-class object.

Permission tokens

Permission tokens define bounded authority:

token ID
trace ID
app ID
tool ID
granted operations
risk ceiling
approval requirement
audit requirement
issuer
expiry
signature stub

A supplied permission token is enforced at execution time. Invalid scope, trace mismatch, expired token, revoked token, or excessive risk causes refusal.

Decision legitimacy artifacts

Decision legitimacy artifacts explain why authority was legitimate:

artifact ID
trace ID
mode
decision code
invariant checks
trigger hits
approval state
capability source
authority chain
risk level
audit requirement

These artifacts are persisted and replayable.

Execution policy

Execution behaviour is controlled by:

policy/runtime/execution-policy.json

Current policy fields:

mandatory_permission_tokens
mandatory_audit
allow_legacy_execution

This allows staged migration from compatibility mode to mandatory permission-token enforcement.

Revocation

Permission tokens can be revoked through:

policy/authority/permission-token-revocations.json

Revoked tokens are refused by the permission-token validator and therefore fail through task and execution paths.

Replay also surfaces revoked token IDs.

Trigger registry

Runtime trigger hits are governed by:

policy/triggers/trigger-registry.json

The registry defines:

trigger ID
name
severity
plane
enabled status
description

Runtime trigger hits are validated against the registry. Unknown or disabled triggers emit drift warnings instead of silently diverging.

Audit and replay

PathWarden writes runtime audit evidence under:

audit/

Runtime audit output is intentionally ignored by git.

Replay utilities can reconstruct execution context by trace ID:

npm run replay:trace -- <trace_id>
npm run export:trace -- <trace_id>

Replay output includes:

authority records
permission token IDs
legitimacy artifact IDs
revoked token IDs
audit decision codes
reconstructed authority/execution chain

Trace exports are written to:

exports/traces/

Runtime exports are ignored by git.

Main commands

Install dependencies:

npm install

Type-check:

npm run check

Run diagnostics:

npm run diag

Replay a trace:

npm run replay:trace -- <trace_id>

Export a trace:

npm run export:trace -- <trace_id>
Development discipline

PathWarden should be developed using a guarded workflow:

inspect files
? patch narrowly
? run check
? run diagnostics
? commit only clean milestones

Every governance feature should have diagnostic coverage before becoming mandatory.

Current limitations

PathWarden does not yet provide:

full natural-language task creation
autonomous planning
swarm/federated orchestration
production UI polish
cryptographic signing of permission tokens
hash-chained authority artifacts
remote revocation propagation
production-grade policy administration

These are future layers. The current focus is governed local execution and replayable authority.

Roadmap

Near-term priorities:

Complete README and architecture documentation
Strengthen task authority and replay documentation
Add richer trace export formats
Add authority-chain hashing
Add token expiry and revocation replay diagnostics
Add governance export bundles
Prepare federation-aware permission-token fields
Build UI only after backend governance remains stable
Project principle

PathWarden prioritises explicit authority over convenience.

A local action should not be merely possible. It should be authorised, bounded, traceable, auditable, replayable, and revocable.
