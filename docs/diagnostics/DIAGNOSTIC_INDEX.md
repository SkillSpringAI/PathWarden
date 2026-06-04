# PathWarden Diagnostic Index

## Purpose

This index groups PathWarden diagnostic and development scripts by subsystem.

The goal is to make the diagnostic surface easier to understand before introducing a formal diagnostic registry.

The current executable diagnostic entrypoint remains:

```powershell
npm run diag

Many individual diagnostics also exist under:

scripts/dev/
Kernel and Validation Diagnostics

These diagnostics validate core kernel behaviour, action validation, refusal paths, and protected-path handling.

test-kernel-hardening.ts
test-validator.ts
test-commit-validator.ts
test-plan-validator.ts
test-path-guards.ts
test-safe-execution-approval-flow.ts
test-decision-trace.ts
test-trigger-hit-validator.ts
test-trigger-registry.ts
test-runtime-trigger-validation.ts
Execution Policy Diagnostics

These diagnostics validate execution policy loading, enforcement, and denial behaviour.

test-execution-policy.ts
test-execution-policy-enforcement.ts
test-execution.ts
test-executor-policy-denial.ts
test-permission-token-execution.ts
Capability and Grant Diagnostics

These diagnostics validate capability grants, capability authority persistence, and capability-linked legitimacy artifacts.

test-capability-grants.ts
test-capability-legitimacy-artifact.ts
test-capability-authority-persistence.ts
test-capability-trigger-drift.ts
Permission Token Diagnostics

These diagnostics validate token issuance, validation, execution binding, revocation, and revoked-token execution refusal.

test-permission-token.ts
test-permission-token-issuance.ts
test-permission-token-validator.ts
test-permission-token-execution.ts
test-permission-token-revocation.ts
test-permission-token-revocation-enforcement.ts
test-task-revoked-token.ts
Legitimacy Artifact Diagnostics

These diagnostics validate legitimacy artifact creation and authority-linked governance evidence.

test-legitimacy-artifact.ts
test-capability-legitimacy-artifact.ts
Authority Diagnostics

These diagnostics validate authority chains, authority persistence, authority replay, hash verification, continuity, and corruption detection.

test-authority-chain.ts
test-authority-persistence.ts
test-capability-authority-persistence.ts
test-authority-replay.ts
test-authority-audit-enrichment.ts
test-authority-chain-hash-verification.ts
test-authority-record-corruption.ts
test-authority-continuity-break.ts
Replay Diagnostics

These diagnostics validate replay commands, execution replay, replay enrichment, and trace reconstruction.

test-execution-replay.ts
test-replay-trace-cli.ts
test-replay-trace-cli-execution.ts
test-revocation-replay-enrichment.ts
test-task-authority-replay.ts
Trace Export and Manifest Diagnostics

These diagnostics validate trace exports, tamper detection, trace manifests, manifest signatures, fingerprint binding, and schema rejection.

test-trace-export.ts
test-trace-export-tamper-detection.ts
test-trace-manifest-signature-tamper.ts
test-trace-manifest-fingerprint-mismatch.ts
test-trace-signature-envelope-schema-rejection.ts
Governance Trust Diagnostics

These diagnostics validate signer trust, signer lifecycle state, signer purpose, multi-signer support, unknown signer rejection, and historical trust semantics.

test-governance-trust-rejection.ts
test-governance-trust-statuses.ts
test-governance-trust-schema-rejection.ts
test-governance-signer-expiry.ts
test-governance-signer-not-yet-valid.ts
test-governance-signer-purpose.ts
test-governance-multi-signer.ts
test-governance-unknown-signer.ts
test-governance-historical-trust.ts
test-governance-historical-suspension.ts
Task Governance Diagnostics

These diagnostics validate task trace propagation, task authority integration, task replay, task refusal, audit enrichment, and task locking/state behaviour.

test-task-trace-propagation.ts
test-task-authority-integration.ts
test-task-authority-replay.ts
test-task-authority-refusal.ts
test-task-authority-audit-enrichment.ts
check-task-transition.ts
check-task-warnings.ts
Trigger Drift Diagnostics

These diagnostics validate trigger registry consistency and drift detection.

test-trigger-registry.ts
test-trigger-hit-validator.ts
test-runtime-trigger-validation.ts
test-capability-trigger-drift.ts
test-execution-trigger-drift.ts
Audit and Journal Diagnostics

These diagnostics validate audit persistence and audit trace behaviour.

test-audit-trace-persistence.ts
test-authority-audit-enrichment.ts
test-task-authority-audit-enrichment.ts
Runtime and Operations Utilities

These scripts are operational helpers rather than pure diagnostics.

run-diagnostics.ts
run-diagnostics-json.ts
run-startup.ts
run-startup-json.ts
run-due-tasks.ts
run-task.ts
dashboard.ts
view-latest-diagnostics.ts
view-latest-audit-report.ts
view-recent-audit.ts
view-audit.ts
Trace and Export Utilities

These scripts support trace replay, export, signing, and verification.

replay-trace.ts
export-trace.ts
verify-trace-export.ts
export-trace-manifest.ts
verify-trace-manifest.ts
sign-trace-manifest.ts
verify-trace-manifest-signature.ts
Task Utilities

These scripts create, edit, view, approve, cancel, and run tasks.

create-task.ts
create-task-draft.ts
create-task-draft-json.ts
create-task-from-template-json.ts
create-safe-move-task.ts
create-recurring-task.ts
approve-task.ts
cancel-task.ts
convert-task-draft.ts
edit-task.ts
edit-task-draft.ts
view-tasks.ts
view-task.ts
view-task-summary.ts
view-task-summary-one.ts
view-task-drafts.ts
view-task-draft.ts
view-task-draft-summary.ts
view-task-draft-summary-one.ts
view-task-history.ts
Lock and Runtime State Utilities

These scripts view or reset runtime locks and task run state.

view-global-lock.ts
view-task-lock.ts
view-lock-summary.ts
view-task-run-state.ts
reset-global-lock.ts
reset-task-lock.ts
reset-task-run-state.ts
Configuration Utilities

These scripts read and update local configuration state.

get-access-policy-json.ts
save-access-policy-json.ts
get-audit-json.ts
get-default-tasks-json.ts
get-device-apps-json.ts
get-device-folders-json.ts
get-diagnostics-json.ts
get-tasks-json.ts
view-startup-state.ts
view-recurrence-summary.ts
Governance Key and Trust Utilities

These scripts generate governance keys and trust manifests.

generate-governance-keypair.ts
generate-governance-keypair-for-signer.ts
create-governance-trust-manifest.ts
Future Index Improvements

Future refinements may include:

diagnostic IDs mapped to script names
diagnostic category metadata
CI run groups
dependency ordering
parallel-safe indicators
governance criticality labels
Pacing Rule

This index is intentionally documentation-only.

Do not introduce a formal diagnostic registry until the script surface becomes too large to maintain through documentation and package scripts.