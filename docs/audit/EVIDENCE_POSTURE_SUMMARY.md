# Evidence Posture Summary

## Purpose

This document summarizes PathWarden's current evidence, reporting, verification, and readiness posture.

It is intended to prevent confusion between:

- evidence that exists
- evidence that is verified
- evidence that remains advisory
- runtime behavior that is intentionally not implemented

PathWarden currently has a local evidence/reporting foundation. It does not yet have federation runtime behavior.

## Current Evidence Layer

PathWarden currently supports the following local evidence artifacts:

| Evidence area | Artifact / Script | Current posture |
|---|---|---|
| Authority snapshot | `npm run export:authority-snapshot` | Implemented |
| Replay baseline | `npm run export:replay-baseline -- <trace_id>` | Implemented |
| Replay diff | `npm run export:replay-diff -- <baseline_json_path> <trace_id>` | Implemented |
| Authority export verification | `npm run verify:authority-export -- <authority_snapshot_json_path>` | Implemented |
| Policy manifest | `npm run export:policy-manifest` | Implemented |
| Policy hashing | `npm run hash:policy-manifest` | Implemented |
| Policy hash verification | `npm run verify:policy-hashes -- <policy_manifest_json_path>` | Implemented |
| Diagnostic metadata verification | `npm run verify:diagnostic-metadata` | Implemented |
| Governance report | `npm run export:governance-report` | Implemented |
| Replay provenance report | `npm run export:replay-provenance-report` | Implemented |
| Federation readiness audit | `npm run export:federation-readiness-audit` | Implemented |

Generated evidence exports remain outside git.

## Current Verification Layer

PathWarden currently supports these report/audit verifiers:

| Verifier | Command | Purpose |
|---|---|---|
| Governance report verifier | `npm run verify:governance-report -- <governance_report_json_path>` | Prevents overstated governance release confidence |
| Replay provenance verifier | `npm run verify:replay-provenance-report -- <replay_provenance_report_json_path>` | Prevents hidden replay lineage gaps and inadmissible provenance |
| Federation readiness verifier | `npm run verify:federation-readiness-audit -- <federation_readiness_audit_json_path>` | Prevents false federation readiness claims |

Fixture tests currently cover:

| Fixture test | Command |
|---|---|
| Governance report verifier fixtures | `npm run test:governance-report-verifier` |
| Replay provenance verifier fixtures | `npm run test:replay-provenance-verifier` |
| Federation readiness verifier fixtures | `npm run test:federation-readiness-verifier` |
| Report input support fixtures | `npm run test:report-input-support` |

## Verified Evidence

The current system can verify:

- authority snapshot shape and admissibility
- policy manifest hashes against repository files
- diagnostic metadata registry coherence
- governance report structure and conservative release posture
- replay provenance structure and declared lineage gaps
- federation readiness audit structure and conservative readiness posture
- fail-closed behavior for partial replay input paths
- fail-closed behavior for invalid replay input schemas

## Advisory Evidence

Some evidence can be valid while still advisory.

Examples:

```text
Governance report is valid, but release_safe is false.
Replay provenance report is valid, but admissible is false.
Federation readiness audit is valid, but ready_for_federation is false.
This is intentional.

A valid report means the report is structurally coherent and honestly represents available evidence. It does not mean the system is production-ready, release-safe, or federation-ready.

Default Advisory Posture

When no replay baseline and replay diff inputs are supplied:

Governance replay status: incomplete
Governance release safe: false
Replay provenance lineage complete: false
Replay provenance admissible: false
Federation ready: false
Ready for federation: false

This is the expected conservative posture.

Replay Input Support

The governance report and federation readiness audit can now accept replay baseline and replay diff inputs.

Governance report with replay evidence:

npm run export:governance-report -- <replay_baseline_json_path> <replay_diff_json_path>

Federation readiness audit with replay evidence:

npm run export:federation-readiness-audit -- <replay_baseline_json_path> <replay_diff_json_path>

Replay input support is evidence-aware reporting only.

It does not create replay execution, federation runtime behavior, delegated authority, signing, network behavior, or trust negotiation.

Diagnostic Metadata Posture

Current diagnostic metadata registry posture:

total diagnostics: 10
active diagnostics: 7
planned diagnostics: 3
blocking diagnostics: 7
ci-compatible diagnostics: 10

The three planned diagnostics are:

diag.governance.report_verification
diag.replay.provenance_verification
diag.federation.readiness_verification

These are registered as planned metadata only.

They are not wired into npm run diag.

Intentionally Not Implemented

The following are intentionally not implemented:

federation runtime behavior
delegated authority
cross-runtime trust negotiation
signing
network behavior
remote endpoint calls
executable federation actions
automatic replay mutation
automatic remediation
replacement of the diagnostic runner
grouped diagnostic execution
runtime use of federation readiness audits as permission grants

This boundary is deliberate.

Federation readiness is an assessment artifact, not authorization.

What Would Be Required Before Runtime Federation

Before any federation runtime work, PathWarden would need a separate design and verification pass covering:

Federation authority model
what can be trusted
what cannot be trusted
who or what can grant authority
revocation and expiry rules
Trust negotiation model
local-only trust assumptions
cross-runtime identity boundaries
handshake semantics, if any
failure modes
Signing model
what is signed
where keys live
how signatures are verified
how signing fails closed
Network model
whether networking is allowed at all
endpoint allow-lists
offline mode
no-network diagnostic mode
Replay and audit admissibility model
what evidence is required before federation actions
how replay provenance is bound to decisions
what makes federation evidence inadmissible
Runtime permission model
explicit capability boundaries
deny-by-default behavior
manual approval requirements
audit requirements
Diagnostic integration model
whether report verifiers become active diagnostics
whether diagnostics remain manually invoked
whether grouped execution is allowed

None of this should be smuggled into reporting or audit work.

Current Readiness Judgment

PathWarden is currently ready for:

local evidence generation
local evidence verification
report verification
replay lineage reporting
readiness assessment
fixture-based verifier regression testing

PathWarden is not currently ready for:

federation runtime
delegated authority
cross-runtime trust
networked federation
signed release evidence
runtime federation decisions
Working Rule

Reports can become more complete.

Verifiers can become stricter.

Readiness cannot be assumed.

Runtime authority must not be created by documentation, report exports, or audit summaries.

Final Posture

The current evidence layer is useful because it is conservative.

It can say "not ready" clearly.

That is the point.