# PathWarden Roadmap

## Overview

PathWarden is being developed incrementally as a governed local execution runtime.

The roadmap intentionally prioritises:

```text
governance integrity
before
automation expansion

The system is not being developed as a general-purpose autonomous agent.

The current direction is:

bounded
replayable
revocable
authority-governed execution
Development philosophy

PathWarden follows several sequencing rules:

1. Authority before autonomy

Execution authority must stabilise before autonomous behaviour expands.

Examples:

permission tokens before orchestration
revocation before delegation
replay before federation
governance diagnostics before automation scale
2. Replay before distribution

Distributed systems multiply debugging complexity.

Replay and trace reconstruction must exist before federation layers are introduced.

3. Diagnostics before mandatory enforcement

New governance features should gain diagnostics before becoming mandatory.

Typical workflow:

implement
? validate
? add diagnostics
? enforce
? replay
? document
4. Backend integrity before UI polish

The project currently prioritises runtime correctness over interface polish.

The backend governance model should stabilise before major UX expansion.

Current completed layers
Governance foundation

Completed:

schema validation
refusal construction
risk resolution
capability grants
permission-token issuance
permission-token enforcement
legitimacy artifacts
execution policy loading
trigger registry validation
trigger drift auditing
Execution foundation

Completed:

governed filesystem execution
committed execution model
approval-aware tasks
authority propagation into execution
audit persistence
replay reconstruction
Authority foundation

Completed:

authority persistence
authority replay
execution replay
revoked-token replay visibility
task authority replay
task authority refusal replay
trace export utilities
Operational tooling

Completed:

replay CLI
trace export utility
diagnostics suite
pre-commit validation
runtime trace inspection
Near-term priorities
Phase 1: Governance hardening

Current focus.

Priority items:

authority-chain enrichment
replay refinement
stronger trace exports
token expiry replay diagnostics
authority-chain hashing
replay export consistency
governance export bundles

Goal:

stable governed execution runtime
Phase 2: Delegated authority

Planned future layer.

Potential features:

delegated permission tokens
authority ceilings
delegation depth
delegation expiry constraints
inherited revocation
bounded sub-authority

Goal:

controlled authority propagation
Phase 3: Federation readiness

Planned future layer.

Potential features:

federation-aware tokens
issuer-node tracking
target-node constraints
remote replay visibility
revocation propagation
distributed trace reconstruction

Goal:

governed distributed execution
Phase 4: Integrity hardening

Planned future layer.

Potential features:

authority-chain hashing
signed exports
tamper-evident replay chains
cryptographic authority signing
integrity digests
secure audit packaging

Goal:

tamper-evident governance infrastructure
Phase 5: UI and operational tooling

Deferred intentionally.

Potential future work:

Electron management UI
governance dashboards
replay visualisation
authority graph views
task management interface
policy management tools

Goal:

operational visibility
without weakening governance discipline
Deferred layers

The following are intentionally deferred:

swarm orchestration
autonomous planning
LLM-driven execution
cloud execution
multi-agent coordination
internet-connected execution
remote execution nodes

These are delayed because governance integrity must stabilise first.

Long-term direction

PathWarden is gradually evolving toward:

governed execution infrastructure

rather than:

traditional automation tooling

Long-term architectural themes include:

replayable authority
revocable execution rights
bounded delegation
governance-first orchestration
traceable distributed execution
inspectable automation systems
Build methodology

Preferred workflow:

inspect
? patch narrowly
? run check
? run diagnostics
? verify replay
? commit clean milestone
? update documentation

Large architectural jumps are intentionally avoided.

The project prioritises:

structural integrity
over
rapid feature accumulation
Current project state

PathWarden is currently transitioning from:

governed local filesystem executor

toward:

authority-governed execution runtime

The present architecture already supports:

explicit execution authority
revocable authority
replayable authority
task authority propagation
runtime governance validation
audit-grade trace reconstruction

This foundation is intended to support future federation safely instead of retrofitting governance later.
