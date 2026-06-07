# Report Verifier Usage

## Purpose

PathWarden report verifiers check exported evidence/reporting artifacts after they are generated.

They are designed to prevent:

- overstated release confidence
- hidden replay lineage gaps
- false federation readiness claims
- nondeterministic artifact references
- secret-like key leakage
- accidental introduction of federation runtime fields

These verifiers are assessment tools only. They do not execute runtime actions.

## Current Verifiers

### Governance Report Verifier

Command:

```powershell
npm run verify:governance-report -- <governance_report_json_path>@'
# Report Verifier Usage

## Purpose

PathWarden report verifiers check exported evidence/reporting artifacts after they are generated.

They are designed to prevent:

- overstated release confidence
- hidden replay lineage gaps
- false federation readiness claims
- nondeterministic artifact references
- secret-like key leakage
- accidental introduction of federation runtime fields

These verifiers are assessment tools only. They do not execute runtime actions.

## Current Verifiers

### Governance Report Verifier

Command:

```powershell
npm run verify:governance-report -- <governance_report_json_path>

Example:

$latestGov = Get-ChildItem ".\exports\governance" -Filter "govreport_*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName

npm run verify:governance-report -- "$latestGov"

Checks include:

report identity fields exist
required evidence sections exist
diagnostics.overall_status is supported
summary status is not overstated
summary.release_safe is false when replay or required evidence is incomplete
artifact references are deterministic
secret-like keys are not present

Expected advisory posture when no replay baseline/diff inputs are supplied:

Replay status: incomplete
Summary status: incomplete
Release safe: false
Replay Provenance Report Verifier

Command:

npm run verify:replay-provenance-report -- <replay_provenance_report_json_path>

Example:

$latestReplay = Get-ChildItem ".\exports\replay" -Filter "replayprov_*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName

npm run verify:replay-provenance-report -- "$latestReplay"

Checks include:

report identity fields exist
status sections exist
lineage object is present
lineage gaps are deterministic
missing baseline_id declares missing_replay_baseline
missing diff_id declares missing_replay_diff
lineage.complete is false when required replay artifacts are missing
lineage.explainable is false when required replay artifacts are missing
summary.admissible is false when lineage is incomplete
artifact references are deterministic
secret-like keys are not present

Expected advisory posture when no replay baseline/diff inputs are supplied:

Replay status: incomplete
Baseline id: null
Diff id: null
Lineage complete: false
Lineage explainable: false
Summary admissible: false
Federation Readiness Audit Verifier

Command:

npm run verify:federation-readiness-audit -- <federation_readiness_audit_json_path>

Example:

$latestFed = Get-ChildItem ".\exports\federation" -Filter "fedready_*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName

npm run verify:federation-readiness-audit -- "$latestFed"

Checks include:

audit identity fields exist
governance, replay provenance, policy, and diagnostics sections exist
federation readiness is not overstated
federation.ready is false when governance is incomplete or not release-safe
federation.ready is false when replay provenance is incomplete, inadmissible, or lineage incomplete
summary.ready_for_federation is not overstated
missing requirements are declared
federation runtime non-implementation warning is present
cross-runtime trust negotiation non-implementation warning is present
artifact references are deterministic
secret-like keys are not present
runtime-like federation fields are rejected

Expected advisory posture when no replay baseline/diff inputs are supplied:

Governance release safe: false
Replay provenance admissible: false
Replay lineage complete: false
Federation ready: false
Ready for federation: false
Export Commands
Governance Report

Advisory mode:

npm run export:governance-report

Replay-input mode:

npm run export:governance-report -- <replay_baseline_json_path> <replay_diff_json_path>

Fail-closed behavior:

one replay argument fails
missing files fail
invalid replay baseline schema fails
invalid replay diff schema fails
missing baseline_id fails
missing diff_id fails
Replay Provenance Report

Advisory mode:

npm run export:replay-provenance-report

Replay-input mode:

npm run export:replay-provenance-report -- <replay_baseline_json_path> <replay_diff_json_path>

Fail-closed behavior:

one replay argument fails
missing files fail
invalid or malformed input fails through validation
Federation Readiness Audit

Advisory mode:

npm run export:federation-readiness-audit

Replay-input mode:

npm run export:federation-readiness-audit -- <replay_baseline_json_path> <replay_diff_json_path>

Fail-closed behavior:

one replay argument fails
missing files fail
invalid replay baseline schema fails
invalid replay diff schema fails
missing baseline_id fails
missing diff_id fails
Fixture Tests
Governance Report Verifier Fixtures
npm run test:governance-report-verifier

Covers:

valid incomplete governance report passes
overstated release_safe fails
missing artifacts fail
Replay Provenance Verifier Fixtures
npm run test:replay-provenance-verifier

Covers:

valid incomplete replay provenance report passes
missing baseline lineage gap fails
overstated admissibility fails
Federation Readiness Verifier Fixtures
npm run test:federation-readiness-verifier

Covers:

valid not-ready federation audit passes
overstated readiness fails
missing requirements fail
runtime-like federation fields fail
Report Input Support Fixtures
npm run test:report-input-support

Covers:

governance report accepts replay baseline and replay diff inputs
governance report includes replay baseline and replay diff IDs
federation readiness audit accepts replay baseline and replay diff inputs
federation readiness audit still remains not ready
one-argument input fails closed
bad replay schema fails closed
Recommended Verification Sequence
npm run check
npm run diag
npm run verify:diagnostic-metadata

npm run export:governance-report
npm run export:replay-provenance-report
npm run export:federation-readiness-audit

$latestGov = Get-ChildItem ".\exports\governance" -Filter "govreport_*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName

$latestReplay = Get-ChildItem ".\exports\replay" -Filter "replayprov_*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName

$latestFed = Get-ChildItem ".\exports\federation" -Filter "fedready_*.json" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName

npm run verify:governance-report -- "$latestGov"
npm run verify:replay-provenance-report -- "$latestReplay"
npm run verify:federation-readiness-audit -- "$latestFed"

npm run test:governance-report-verifier
npm run test:replay-provenance-verifier
npm run test:federation-readiness-verifier
npm run test:report-input-support

git status --short
Boundaries

The report verifiers do not:

sign artifacts
create federation runtime behavior
delegate authority
negotiate cross-runtime trust
access network endpoints
mutate authority records
mutate replay artifacts
execute federation actions
replace npm run diag
create grouped diagnostic execution
Current Posture

The evidence/reporting layer is stronger, but federation readiness remains advisory.

A report or audit may be valid while still saying:

not release-safe
not admissible
not ready for federation

That is not a failure. That is the intended conservative posture.

Working Rule

Evidence can become more complete.

Readiness cannot be assumed.

Runtime federation must remain outside the gate until explicitly designed, reviewed, verified, and authorized.