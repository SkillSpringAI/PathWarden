# Future Expansion Candidates

## Governance / Kernel
- core/kernel/triggerRegistry.ts
- core/kernel/refusal.ts
- core/kernel/refusalCodes.ts
- core/kernel/permissionTokenBuilder.ts

## Audit / Replay
- core/audit/auditWriter.ts
- core/audit/authorityReader.ts
- core/audit/authorityWriter.ts

## Notes
These files are intentionally lightweight now but are expected
to expand during federation, replay-hardening, and governance
evolution work.

Diagnostic System

Future candidates:

core/common/diagnostics/diagnosticRunner.ts
core/common/diagnostics/diagnosticRegistry.ts
core/common/diagnostics/diagnosticGrouping.ts
core/common/diagnostics/diagnosticReportWriter.ts
core/common/diagnostics/diagnosticSeverity.ts

Expected refinements:

diagnostic categories
deterministic grouped execution
diagnostic dependency ordering
governance-only diagnostic runs
replay-only diagnostic runs
federation diagnostic suites
CI-compatible report outputs
drift comparison against previous diagnostic baselines

Activation threshold:

Introduce this structure only when diagnostic count, federation complexity, or CI requirements justify the extra abstraction.
## Execution Replay System

Future candidates:

```text
core/audit/replayDiff.ts
core/audit/replaySnapshot.ts
core/audit/replayBaseline.ts
core/audit/replayDriftDetector.ts
core/audit/replayExportVerifier.ts

Expected refinements:

deterministic replay comparison
replay divergence detection
baseline snapshots
governance drift analysis
replay provenance verification
export consistency validation
historical trust snapshots
policy-version-aware replay
federation-compatible replay bundles

Activation threshold:

Introduce this structure when replay becomes a primary governance artifact rather than a debugging utility.