# PathWarden Release Evidence Summary

## Current tag

```text
pw-v0.1.5-report-fixtures-and-regression-hardening
Purpose

This document summarizes what the current PathWarden release evidence proves, what it does not prove, and which commands are used to verify the current local evidence/reporting posture.

Current posture

PathWarden currently supports local evidence generation, report verification, verifier fixture tests, report input support, and evidence posture documentation.

Federation readiness remains advisory and non-executable.

What this tag proves
governance reports can be exported
replay provenance reports can be exported
federation readiness audits can be exported
governance report verifier catches overstated release confidence
replay provenance verifier catches hidden or overstated lineage confidence
federation readiness verifier catches overstated readiness and runtime-like fields
report input support accepts valid replay baseline and replay diff inputs
report input support fails closed on bad or incomplete input
diagnostic metadata remains valid
fixture regression tests pass
What this tag does not prove
federation runtime is implemented
delegated authority is implemented
cross-runtime trust negotiation is implemented
signing is implemented
network behavior is implemented
remote endpoint calls are implemented
runtime federation decisions are authorized
diagnostic runner replacement is implemented
grouped diagnostic execution is implemented
Evidence artifacts
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
Report verifiers
verify:governance-report
verify:replay-provenance-report
verify:federation-readiness-audit
Fixture regression tests
test:governance-report-verifier
test:replay-provenance-verifier
test:federation-readiness-verifier
test:report-input-support
Recommended verification sequence
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
Boundary statement

PathWarden's current evidence/reporting layer is local, advisory, and non-executable.

Federation readiness audits assess whether future federation work is safe to consider. They do not create federation runtime behavior, grant delegated authority, negotiate trust, sign evidence, call networks, or authorize cross-runtime actions.

Next recommended pass
v0.1.6-release-evidence-and-doc-cleanup

Recommended next work:

release evidence summary
fixture schema validation tests
report verifier negative-case matrix
README evidence posture update
v0.1.5 release note

