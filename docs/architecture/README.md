# PathWarden Architecture

## Overview

PathWarden is a governed local execution runtime with a desktop shell on top of a policy-first core. The architecture is intentionally split so authority, execution, audit, replay, and UI remain inspectable instead of collapsing into one opaque automation layer.

The current shape of the system is:

```text
desktop shell / developer scripts
            ↓
     planning or task intake
            ↓
      governance validation
            ↓
 bounded capability execution
            ↓
      audit persistence
            ↓
   replay and evidence export
```

PathWarden is not designed as an unrestricted agent. It is designed to prove:

- who authorized an action
- why it was allowed or refused
- what local capability ran
- what policy applied
- what evidence was persisted
- whether authority was later revoked or invalidated

## Main Subsystems

### Governance kernel

Location: `core/kernel/`

Responsible for:

- capability grant validation
- permission-token validation and revocation checks
- legitimacy artifacts
- trigger validation and drift warnings
- refusal construction
- risk handling
- execution-policy enforcement

The kernel is the authority layer. Execution should not occur until the kernel has allowed it.

### Execution layer

Location: `core/executor/`

Responsible for:

- governed filesystem execution
- commit and undo execution paths
- runtime validation handoff
- audit emission

The executor does not invent authority on its own. It executes only after governance approval succeeds.

### Task system

Location: `core/tasks/`

Responsible for:

- task lifecycle and persistence
- approval-gated execution
- queue and lock handling
- task audit history
- carrying authority context into execution

Tasks are the main queued execution envelope in the current repo.

### Filesystem capability layer

Location: `capabilities/filesystem/`

Current source-backed capabilities include:

- inspection of an allowed directory
- directory summary from immediate metadata
- metadata-only search over immediate files
- governed move, copy, rename, and delete execution paths

`fsWrite.ts` is still unimplemented and should not be documented as a supported developer or desktop workflow.

### Audit and replay layer

Locations: `core/audit/`, `audit/`, `exports/`

Responsible for:

- audit event persistence
- authority artifact persistence
- replay by trace ID
- trace export
- replay baselines and replay diffs
- governance and federation-readiness evidence outputs

Replay is part of the product’s evidence model, not just a debugging aid.

### Policy and schema layer

Locations: `policy/`, `schemas/`

Responsible for:

- execution policy
- trigger registry
- app and tool registry data
- grants and refusals
- revocation lists
- schema validation of core runtime artifacts

PathWarden prefers explicit data contracts over implicit runtime assumptions.

### Desktop shell

Location: `apps/desktop/`

Responsible for:

- surfacing validated evidence status
- exposing a lightweight capability inventory
- bridging to selected developer scripts
- offering experimental read-only planning and inspection flows

The desktop shell is currently a thin interface over local scripts and should be treated as a bounded operator surface, not a full productized control plane.

## Current Capability Shape

Current validated desktop slices:

- Evidence Overview
- Capabilities view

Current experimental or advanced slices:

- diagnostics and audit viewing
- task and approval queue management
- user-request planning
- read-only folder inspection
- directory summary
- metadata-only filesystem search
- planned-request execution for supported read-only flows

## Authority Model

Capability grants determine whether an app or tool can request authority. Successful validation leads to bounded authority artifacts such as permission tokens and legitimacy artifacts.

Permission tokens currently capture fields such as:

- token ID
- trace ID
- app ID
- tool ID
- granted operations
- risk ceiling
- approval requirement
- audit requirement
- issuer
- expiry

Revocation state is loaded from `policy/authority/permission-token-revocations.json`, and replay surfaces revoked token evidence explicitly.

## Replay and Evidence

Replay reconstructs execution state using:

- authority records
- audit events
- revocation data
- reconstructed authority chains

Current replay and evidence tooling covers:

- replay by trace ID
- trace export
- replay baselines
- replay diffs
- governance reports
- replay provenance reports
- federation-readiness audits
- latest report index export

## Current Boundaries

PathWarden currently supports:

- local-first governed execution
- explicit authority artifacts
- replayable evidence
- advisory federation-readiness reporting

PathWarden does not currently provide:

- federation runtime
- delegated cross-runtime authority
- remote execution
- unrestricted natural-language planning
- production-ready operator UX

## Architectural Direction

The project is evolving toward governed execution infrastructure rather than general-purpose automation tooling.

That direction includes:

- stronger authority integrity
- clearer policy surfaces
- portable replay evidence
- future federation compatibility

Historical roadmap and release documents in `docs/roadmap/` and `docs/releases/` remain useful context, but this file should be treated as the current architecture summary.
