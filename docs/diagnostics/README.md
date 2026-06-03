# PathWarden Diagnostics

## Purpose

PathWarden diagnostics verify that governance, replay, authority, trust, policy, and execution behaviours remain stable over time.

Diagnostics are not just tests. They are operational integrity checks used to detect governance drift, replay inconsistency, malformed authority records, trust-policy errors, and unsafe execution behaviour.

## Current Diagnostic Runner

The current diagnostic runner is:

```text
scripts/dev/run-diagnostics.ts

It currently performs deterministic checks across:

DIAG-001..DIAG-013

These checks are intentionally executed in stable order so reports remain reproducible.

Current Diagnostic Groups
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

Verify that governed allow/refuse decisions remain deterministic and fail closed.
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
Existing Script-Based Diagnostics

Additional diagnostics currently live under:

scripts/dev/

These include authority, replay, trust, signer lifecycle, manifest signing, trigger, revocation, and export diagnostics.

The main npm diagnostic chain is:

npm run diag
Future Diagnostic Groups

Planned future groups include:

authority
trust
replay
federation
policy-versioning
trigger-drift
diagnostic-drift
Future Diagnostic Architecture

The current runner is registry-ready but not yet registry-dependent.

Future structure may include:

core/common/diagnostics/
  diagnosticRunner.ts
  diagnosticRegistry.ts
  diagnosticReportWriter.ts
  diagnosticGrouping.ts
  diagnosticSeverity.ts

This should only be introduced once the diagnostic system becomes large enough to justify the extra abstraction.

Pacing Rule

Do not introduce a full diagnostic registry too early.

Use the current runner while diagnostics remain manageable.

Introduce registry-based execution when one or more of the following becomes true:

diagnostic count exceeds roughly 25 checks
diagnostics are distributed across multiple modules
CI needs category-specific runs
federation diagnostics require isolated execution
replay diagnostics need deterministic dependency ordering
Required Validation

After changing diagnostics:

npm run check

For governance, replay, trust, authority, policy, or schema diagnostics:

npm run diag
