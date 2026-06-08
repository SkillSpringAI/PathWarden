# PathWarden v0.1.5 — Report Fixtures and Regression Hardening

## Tag

```text
pw-v0.1.5-report-fixtures-and-regression-hardening
Summary

This release hardened PathWarden's evidence/reporting layer with verifier fixtures, regression tests, shared verifier utilities, report input support coverage, and evidence posture documentation.

The release confirms that PathWarden can generate and verify local evidence reports while preserving the boundary that federation readiness remains advisory and non-executable.

Added
Governance report verifier fixtures
tests/fixtures/governance-report/valid-incomplete.json
tests/fixtures/governance-report/invalid-release-safe-overstated.json
tests/fixtures/governance-report/invalid-missing-artifacts.json
scripts/dev/test-governance-report-verifier.ts

Package script:

npm run test:governance-report-verifier

Purpose:

Ensure governance reports cannot overstate release safety or hide required artifact references.
Replay provenance verifier fixtures
tests/fixtures/replay-provenance-report/valid-incomplete.json
tests/fixtures/replay-provenance-report/invalid-missing-baseline-gap.json
tests/fixtures/replay-provenance-report/invalid-admissible-overstated.json
scripts/dev/test-replay-provenance-verifier.ts

Package script:

npm run test:replay-provenance-verifier

Purpose:

Ensure replay lineage gaps are declared and incomplete lineage cannot be marked admissible.
Federation readiness verifier fixtures
tests/fixtures/federation-readiness-audit/valid-not-ready.json
tests/fixtures/federation-readiness-audit/invalid-ready-overstated.json
tests/fixtures/federation-readiness-audit/invalid-missing-requirements.json
tests/fixtures/federation-readiness-audit/invalid-runtime-field.json
scripts/dev/test-federation-readiness-verifier.ts

Package script:

npm run test:federation-readiness-verifier

Purpose:

Ensure federation readiness cannot be overstated and runtime-like federation fields are rejected.
Shared verifier utilities
scripts/dev/lib/reportVerifierUtils.ts

Shared utility coverage:

JSON file loading
object guard
status string guard
incomplete status detection
secret-like key detection
artifact reference validation
failure printing

Refactored verifiers:

scripts/dev/verify-governance-report.ts
scripts/dev/verify-replay-provenance-report.ts
scripts/dev/verify-federation-readiness-audit.ts
Report input support fixtures
tests/fixtures/replay-inputs/replay-baseline.valid.json
tests/fixtures/replay-inputs/replay-diff.valid.json
tests/fixtures/replay-inputs/replay-baseline.invalid-schema.json
scripts/dev/test-report-input-support.ts

Package script:

npm run test:report-input-support

Coverage:

governance report accepts replay baseline and replay diff inputs
governance report includes baseline_id and diff_id
federation readiness audit accepts replay baseline and replay diff inputs
federation readiness remains not ready
one-argument input fails closed
bad replay baseline schema fails closed
Evidence posture documentation
docs/audit/REPORT_VERIFIER_USAGE.md
docs/audit/EVIDENCE_POSTURE_SUMMARY.md
Planned fixture diagnostics

Updated:

core/common/diagnostics/diagnosticRegistry.ts

Registered planned metadata diagnostics:

diag.governance.report_verifier_fixtures
diag.replay.provenance_verifier_fixtures
diag.federation.readiness_verifier_fixtures
diag.reporting.input_fixture_verification

These are metadata only. They are not wired into npm run diag.

Verification completed

Final verification included:

npm run check
npm run diag
npm run verify:diagnostic-metadata

npm run export:governance-report
npm run export:replay-provenance-report
npm run export:federation-readiness-audit

npm run test:governance-report-verifier
npm run test:replay-provenance-verifier
npm run test:federation-readiness-verifier
npm run test:report-input-support

git status --short

Result:

all checks passed
all exports passed
all verifiers passed
all fixture tests passed
working tree clean
Current evidence posture

PathWarden now has:

local evidence generation
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
evidence posture documentation
Explicit boundaries

This release does not implement:

federation runtime
delegated authority
cross-runtime trust negotiation
signing
network behavior
remote endpoint calls
executable federation actions
diagnostic runner replacement
grouped diagnostic execution
runtime use of federation readiness as authorization
Recommended next pass
pw-v0.1.6-release-evidence-and-doc-cleanup

Recommended focus:

release evidence summary
fixture schema validation tests
report verifier negative-case matrix
README evidence posture update
release note cleanup
Final note

This release strengthens confidence in PathWarden's report verification and regression coverage.

It does not make PathWarden federation-ready at runtime. Federation readiness remains an advisory assessment until future runtime, signing, trust negotiation, and cross-runtime authority work are explicitly designed and implemented.
