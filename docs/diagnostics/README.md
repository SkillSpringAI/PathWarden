# PathWarden Diagnostics

## Purpose

PathWarden diagnostics verify that governance, replay, authority, trust, policy, and execution behaviours remain stable over time.

Diagnostics are not just tests. They are operational integrity checks used to detect governance drift, replay inconsistency, malformed authority records, trust-policy errors, and unsafe execution behaviour.

## Current Entry Points

The current primary regression entry point is:

```text
npm run diag
```

That package script chains a broad set of focused regression scripts covering:

- path guards
- execution policy
- capability grants
- task authority
- permission tokens and revocation
- audit persistence
- replay and trace export
- governance trust
- signer lifecycle and historical trust checks

The desktop shell also exposes report-oriented diagnostic helpers through:

```text
scripts/dev/run-diagnostics-json.ts
scripts/dev/get-diagnostics-json.ts
scripts/dev/run-diagnostics.ts
```

Those scripts are useful for viewing a structured diagnostic report in the current desktop shell, but they are not the whole diagnostic story.

## Report-Oriented Diagnostic Runner

`scripts/dev/run-diagnostics.ts` currently performs a smaller deterministic report pass across:

DIAG-001..DIAG-013

These checks are intentionally executed in stable order so reports remain reproducible.

## Report-Oriented Diagnostic Groups

1. Configuration and Schema
DIAG-001 Folder Structure Check
DIAG-002 Policy File Load Check
DIAG-003 Schema File Load Check
DIAG-004 AJV Compile Check

Purpose:

Ensure required folders, policy files, and schemas exist and can be loaded before deeper governance checks run.

2. Governance Kernel
DIAG-005 Refusal Construction Check
DIAG-006 Validator Refusal Path Check
DIAG-007 Validator Allow Path Check
DIAG-008 Protected Path Detection Check

Purpose:

Verify that governed allow or refuse decisions remain deterministic and fail closed.

3. Audit and Journal
DIAG-009 Audit Write Check
DIAG-010 Journal Write Check

Purpose:

Verify append-only operational evidence can be written.

4. Execution Sandbox
DIAG-011 Copy Sandbox Check
DIAG-012 Rename Sandbox Check
DIAG-013 Sandbox Cleanup Check

Purpose:

Verify basic governed filesystem operations work inside a controlled sandbox.

## Existing Script-Based Diagnostics

Many additional diagnostics live under `scripts/dev/`.

These cover authority, replay, trust, signer lifecycle, manifest signing, trigger handling, revocation, report verification, and export integrity.

## Future Diagnostic Groups

Planned future groups include:

- authority
- trust
- replay
- federation
- policy-versioning
- trigger-drift
- diagnostic-drift

## Future Diagnostic Architecture

The current runner is registry-ready but not yet registry-dependent.

Future structure may include:

```text
core/common/diagnostics/
  diagnosticRunner.ts
  diagnosticRegistry.ts
  diagnosticReportWriter.ts
  diagnosticGrouping.ts
  diagnosticSeverity.ts
```

This should only be introduced once the diagnostic system becomes large enough to justify the extra abstraction.

## Pacing Rule

Do not introduce a full diagnostic registry too early.

Use the current runner while diagnostics remain manageable.

Introduce registry-based execution when one or more of the following becomes true:

- diagnostic count exceeds roughly 25 checks
- diagnostics are distributed across multiple modules
- CI needs category-specific runs
- federation diagnostics require isolated execution
- replay diagnostics need deterministic dependency ordering

## Required Validation

After changing diagnostics:

```text
npm run check
```

For governance, replay, trust, authority, policy, schema, or desktop diagnostic-bridge work:

```text
npm run diag
```
