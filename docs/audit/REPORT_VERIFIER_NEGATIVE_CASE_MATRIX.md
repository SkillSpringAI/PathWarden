# Report Verifier Negative-Case Matrix

## Purpose

This matrix documents the intentionally invalid report and input fixtures used by PathWarden's verifier regression tests.

These fixtures exist to prevent evidence reports from overstating confidence, hiding missing artifacts, or implying runtime/federation capability that does not exist.

## Boundary

Negative fixtures are not expected to pass normal report validation.

They are expected to fail in specific, controlled ways.

This document explains the expected failure and the risk each fixture prevents.

---

## Governance Report Fixtures

| Fixture | Test / Verifier | Expected failure | Risk prevented |
|---|---|---|---|
| `tests/fixtures/governance-report/invalid-release-safe-overstated.json` | `test:governance-report-verifier` / `verify:governance-report` | Report claims `release_safe: true` while required evidence is incomplete or not verified. | Prevents overstated release confidence. |
| `tests/fixtures/governance-report/invalid-missing-artifacts.json` | `test:governance-report-verifier` / `verify:governance-report` | Report omits required artifact references. | Prevents reports from hiding missing evidence dependencies. |

## Replay Provenance Report Fixtures

| Fixture | Test / Verifier | Expected failure | Risk prevented |
|---|---|---|---|
| `tests/fixtures/replay-provenance-report/invalid-missing-baseline-gap.json` | `test:replay-provenance-verifier` / `verify:replay-provenance-report` | Replay baseline is missing but the required lineage gap is not declared. | Prevents hidden replay lineage gaps. |
| `tests/fixtures/replay-provenance-report/invalid-admissible-overstated.json` | `test:replay-provenance-verifier` / `verify:replay-provenance-report` | Report claims admissibility while lineage is incomplete or unresolved. | Prevents overstated replay admissibility. |

## Federation Readiness Audit Fixtures

| Fixture | Test / Verifier | Expected failure | Risk prevented |
|---|---|---|---|
| `tests/fixtures/federation-readiness-audit/invalid-ready-overstated.json` | `test:federation-readiness-verifier` / `verify:federation-readiness-audit` | Audit claims federation readiness while required local evidence is incomplete. | Prevents premature federation approval. |
| `tests/fixtures/federation-readiness-audit/invalid-missing-requirements.json` | `test:federation-readiness-verifier` / `verify:federation-readiness-audit` | Audit is not ready but does not declare missing requirements. | Prevents readiness blockers from being hidden. |
| `tests/fixtures/federation-readiness-audit/invalid-runtime-field.json` | `test:federation-readiness-verifier` / `verify:federation-readiness-audit` | Audit contains runtime-like federation fields. | Prevents readiness audits from drifting into federation runtime behavior. |

## Replay Input Fixtures

| Fixture / Case | Test / Verifier | Expected failure | Risk prevented |
|---|---|---|---|
| `tests/fixtures/replay-inputs/replay-baseline.invalid-schema.json` | `test:report-input-support` | Replay baseline input fails schema validation. | Prevents malformed replay evidence from entering report generation. |
| One-argument replay input case | `test:report-input-support` | Supplying only a baseline or only a diff fails closed. | Prevents partial replay input from being treated as complete evidence. |

---

## Design Principle

Invalid fixtures should fail for a clear reason.

A negative fixture should never be vague. Each one should map to a specific verifier rule, confidence-boundary rule, or non-runtime boundary.

## Current Protected Boundaries

```text
release safety cannot be overstated
replay admissibility cannot be overstated
missing replay lineage must be declared
required artifacts cannot be hidden
federation readiness cannot be overstated
runtime-like federation fields are rejected
partial replay inputs fail closed
malformed replay inputs fail closed
Non-Runtime Boundary

These fixtures protect the current PathWarden boundary:

reports are evidence artifacts
readiness audits are advisory
federation runtime is not implemented
delegated authority is not implemented
cross-runtime trust negotiation is not implemented
network behavior is not implemented
signing is not implemented

