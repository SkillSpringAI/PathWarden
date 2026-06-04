# PathWarden Build Order

## Purpose

This document defines the current implementation sequence for PathWarden.

The purpose is to prevent architectural drift, avoid skipping ahead, and keep governance, replay, diagnostics, and federation work paced correctly.

## Current Build Sequence

1. Authority Snapshot Design
2. Replay Baseline Design
3. Replay Diff Design
4. Authority Export Verification
5. Policy Manifest Design
6. Policy Hashing
7. Diagnostic Metadata
8. Governance Reporting
9. Replay Provenance Reports
10. Federation Readiness Audit

## Rule

Do not skip ahead unless a bug fix or failed diagnostic requires it.

Each item should be designed before implementation.

## Current Milestone

### Milestone 1: Authority Snapshot Design

Status:

```text
design drafted
implementation not started

Design document:

docs/governance/AUTHORITY_SNAPSHOT_DESIGN.md

Goal:

Define how PathWarden captures authority-state snapshots for governance, replay, audit, and future federation use.

Potential future files:

core/audit/authoritySnapshot.ts
schemas/audit/authority-snapshot.schema.json
scripts/dev/export-authority-snapshot.ts

Implementation must not begin until the requirements and design boundaries are documented.

Next Milestone
Milestone 2: Replay Baseline Design

Status:

not started

Goal:

Define how PathWarden stores replay baselines for deterministic comparison, replay drift detection, and future provenance reporting.

Potential future files:

core/audit/replayBaseline.ts
schemas/audit/replay-baseline.schema.json
scripts/dev/export-replay-baseline.ts
Pacing Principle

Do not expand the system merely because an abstraction is interesting.

Expansion is justified only when:

current code becomes hard to reason about
diagnostics require the abstraction
replay requires the abstraction
federation requires the abstraction
external audit requires the abstraction

