# PathWarden Capability Inventory

## Purpose

This document records the current observable capability surface of PathWarden.

It is read-only documentation.

It does not grant authority, enable execution, expand policy, or replace the kernel capability registry.

## Source status

This inventory is derived from current repository inspection.

Relevant source areas:

```text
capabilities/filesystem
core/kernel/capabilityGrantValidator.ts
core/kernel/executionPolicy.ts
core/kernel/permissionToken.ts
core/kernel/permissionTokenBuilder.ts
core/kernel/permissionTokenValidator.ts
core/executor/commitExecutor.ts
config/access-policy.json
policy/registry/app-registry.json
policy/registry/tool-registry.json
policy/grants/app-grants.json
policy/runtime/execution-policy.json
Inventory boundary

This document may describe visible or source-backed capabilities.

It must not claim that a capability is production-ready unless it is validated by the current release.

Status meanings:

Validated = release-tested current UI or workflow
Experimental = technically present but not final user-facing posture
Advanced = developer/power-user function
Disabled = intentionally unavailable
Future = planned direction
Not implemented = placeholder or refused by implementation
Current capability groups
Evidence Overview

Description:

Displays the latest local evidence index in the desktop shell.

Status:

Validated

Risk level:

Low

Approval requirement:

None

Execution mode:

Read-only

Scope limits:

Reads generated evidence index data.
Does not generate reports.
Does not execute tasks.
Does not mutate policy or authority.
Does not start federation.

Current UI exposure:

View Evidence

Source references:

apps/desktop/main/main.cjs
apps/desktop/preload/preload.cjs
apps/desktop/ui/src/index.html
apps/desktop/ui/src/renderer.js
exports/report-index/latest-report-index.json

Notes:

This is the strongest current demo-ready workflow.
Governance Report Export

Description:

Exports governance evidence report artifacts.

Status:

Advanced

Risk level:

Low

Approval requirement:

None

Execution mode:

Local report export

Scope limits:

CLI-driven.
Not generated from the desktop UI.
Writes generated report artifacts under exports.

Current UI exposure:

Displayed indirectly through Evidence Overview after export.

Source references:

core/audit/governanceReport.ts
scripts/dev/export-governance-report.ts
exports/governance

Notes:

Used as part of the Evidence Overview demo preparation.
Replay Provenance Report Export

Description:

Exports replay provenance evidence.

Status:

Advanced

Risk level:

Low

Approval requirement:

None

Execution mode:

Local report export

Scope limits:

CLI-driven.
Not generated from the desktop UI.
Writes generated report artifacts under exports.

Current UI exposure:

Displayed indirectly through Evidence Overview after export.

Source references:

core/audit/replayProvenanceReport.ts
scripts/dev/export-replay-provenance-report.ts
exports/replay

Notes:

Used to assess replay admissibility and lineage completeness.
Federation Readiness Audit

Description:

Exports advisory federation readiness evidence.

Status:

Advanced

Risk level:

Low

Approval requirement:

None

Execution mode:

Local report export

Scope limits:

Advisory only.
Does not enable federation runtime.
Does not create delegated authority.
Does not perform network behavior.

Current UI exposure:

Displayed indirectly through Evidence Overview after export.

Source references:

core/audit/federationReadinessAudit.ts
scripts/dev/export-federation-readiness-audit.ts
exports/federation

Notes:

Federation remains non-executable in the current release posture.
Latest Report Index

Description:

Summarizes the latest generated governance, replay provenance, and federation readiness artifacts.

Status:

Validated

Risk level:

Low

Approval requirement:

None

Execution mode:

Local index export and verification

Scope limits:

Indexes existing generated reports.
Does not validate report truth beyond index shape/path/status checks.
Does not execute actions.

Current UI exposure:

Evidence Overview reads this index.

Source references:

scripts/dev/export-latest-report-index.ts
scripts/dev/verify-latest-report-index.ts
exports/report-index/latest-report-index.json

Notes:

This is the bridge artifact used by the desktop Evidence Overview.
Diagnostics

Description:

Runs and displays local diagnostic checks.

Status:

Experimental / Advanced

Risk level:

Low

Approval requirement:

None

Execution mode:

Local diagnostics

Scope limits:

Available through CLI and older shell controls.
Not currently the primary validated demo workflow.

Current UI exposure:

Run Diagnostics
View Diagnostics

Source references:

core/common/diagnostics
scripts/dev/run-diagnostics-json.ts
scripts/dev/get-diagnostics-json.ts

Notes:

Useful for development and verification. The current public demo should prioritize View Evidence.
Tasks / Approval Queue

Description:

Displays and manages local task queue actions through the existing desktop shell.

Status:

Experimental / Advanced

Risk level:

Medium

Approval requirement:

Conditional

Execution mode:

Approval-gated / experimental shell control

Scope limits:

Current UI labels are clarified, but this is not yet the final approval queue UX.
Approval does not bypass policy or executor checks.
No new task behavior was added in v0.1.12.

Current UI exposure:

View Tasks / Approval Queue
Create Experimental Task Draft
Default Task Templates

Source references:

core/tasks
core/tasks/taskPolicy.ts
apps/desktop/ui/src/renderer.js
scripts/dev/get-tasks-json.ts
scripts/dev/approve-task.ts
scripts/dev/cancel-task.ts
scripts/dev/run-task.ts

Notes:

The approval queue UX contract exists, but the current UI remains experimental.
Filesystem Read

Description:

Reads local file contents.

Status:

Experimental / Advanced

Risk level:

Low to Medium

Approval requirement:

Conditional

Execution mode:

Controlled by policy and executor path

Scope limits:

Subject to access policy and path guards.
Should not be exposed as a general UI capability until policy and UX are ready.

Current UI exposure:

No dedicated validated desktop capability browser view yet.

Source references:

capabilities/filesystem/fsRead.ts
capabilities/filesystem/pathGuards.ts
config/access-policy.json

Notes:

Read capability exists in source but should remain capability-inventory information for now.
Filesystem Move

Description:

Moves files from one path to another.

Status:

Experimental / Advanced

Risk level:

Medium

Approval requirement:

Required or Conditional

Execution mode:

Approval-gated / policy-gated

Scope limits:

Subject to access policy, path guards, executor policy, and permission-token requirements.

Current UI exposure:

No dedicated validated desktop capability browser view yet.

Source references:

capabilities/filesystem/fsMove.ts
capabilities/filesystem/pathGuards.ts
core/executor/commitExecutor.ts

Notes:

Should not be promoted as validated general-user capability yet.
Filesystem Copy

Description:

Copies files from one path to another.

Status:

Experimental / Advanced

Risk level:

Medium

Approval requirement:

Required or Conditional

Execution mode:

Approval-gated / policy-gated

Scope limits:

Subject to access policy, path guards, executor policy, and permission-token requirements.

Current UI exposure:

No dedicated validated desktop capability browser view yet.

Source references:

capabilities/filesystem/fsCopy.ts
capabilities/filesystem/pathGuards.ts
core/executor/commitExecutor.ts

Notes:

Should not be promoted as validated general-user capability yet.
Filesystem Rename

Description:

Renames files or paths.

Status:

Experimental / Advanced

Risk level:

Medium

Approval requirement:

Required or Conditional

Execution mode:

Approval-gated / policy-gated

Scope limits:

Subject to access policy, path guards, executor policy, and permission-token requirements.

Current UI exposure:

No dedicated validated desktop capability browser view yet.

Source references:

capabilities/filesystem/fsRename.ts
capabilities/filesystem/pathGuards.ts
core/executor/commitExecutor.ts

Notes:

Should not be promoted as validated general-user capability yet.
Filesystem Delete

Description:

Deletes a target path.

Status:

Experimental / Advanced

Risk level:

High

Approval requirement:

Required

Execution mode:

Approval-gated / policy-gated

Scope limits:

Subject to access policy, path guards, executor policy, and permission-token requirements.
Should remain heavily constrained.

Current UI exposure:

No dedicated validated desktop capability browser view yet.

Source references:

capabilities/filesystem/fsDelete.ts
capabilities/filesystem/pathGuards.ts
core/executor/commitExecutor.ts

Notes:

Deletion should not be normalized in UI before stronger safety and reversibility design.
Filesystem Search

Description:

Search placeholder currently returns an empty result set.

Status:

Not implemented

Risk level:

Unknown

Approval requirement:

Unknown

Execution mode:

Not implemented

Scope limits:

Current implementation appears placeholder only.

Current UI exposure:

None

Source references:

capabilities/filesystem/fsSearch.ts

Notes:

Do not present as working search capability.
Filesystem Write

Description:

Write placeholder currently throws not implemented.

Status:

Not implemented

Risk level:

High

Approval requirement:

Blocked

Execution mode:

Not implemented

Scope limits:

Current implementation throws an error.
Should not be presented as available.

Current UI exposure:

None

Source references:

capabilities/filesystem/fsWrite.ts

Notes:

Write is not implemented in phase 1.
Capability Grant Validation

Description:

Validates whether an app/tool capability grant is allowed under registry, grant, risk, approval, and audit rules.

Status:

Advanced

Risk level:

High

Approval requirement:

Conditional

Execution mode:

Kernel authority function

Scope limits:

Kernel-side authority path only.
Not a general-user UI capability.
Should not be invoked from desktop UI until a safe display-only contract exists.

Current UI exposure:

None

Source references:

core/kernel/capabilityGrantValidator.ts
policy/registry/app-registry.json
policy/registry/tool-registry.json
policy/grants/app-grants.json

Notes:

This is a source of capability authority, not a UI feature.
Permission Tokens

Description:

Permission token creation, validation, and revocation support governed execution authority.

Status:

Advanced

Risk level:

High

Approval requirement:

Conditional

Execution mode:

Kernel authority mechanism

Scope limits:

Not a general-user UI capability.
Should not be exposed as a control surface without strict governance.

Current UI exposure:

None

Source references:

core/kernel/permissionToken.ts
core/kernel/permissionTokenBuilder.ts
core/kernel/permissionTokenValidator.ts
core/kernel/permissionTokenRevocation.ts

Notes:

Permission tokens are authority artifacts, not user-facing convenience controls.
Access Policy

Description:

Defines allowed and blocked local paths or access constraints.

Status:

Advanced

Risk level:

High

Approval requirement:

Required or Conditional

Execution mode:

Policy configuration

Scope limits:

Should not be casually editable from general-user UI.
Policy edits can change safety boundaries.

Current UI exposure:

Settings panels may expose folder/app policy controls from earlier shell work.

Source references:

config/access-policy.json
capabilities/filesystem/pathGuards.ts
apps/desktop/ui/src/renderer.js

Notes:

Current settings UI should remain experimental / advanced.
Summary

Current validated capability:

Evidence Overview

Current advanced/reporting capabilities:

Governance Report Export
Replay Provenance Report Export
Federation Readiness Audit
Latest Report Index
Diagnostics

Current experimental capabilities:

Tasks / Approval Queue
Filesystem Read
Filesystem Move
Filesystem Copy
Filesystem Rename
Filesystem Delete
Access Policy UI

Current not implemented capabilities:

Filesystem Search
Filesystem Write

Current authority mechanisms:

Capability Grant Validation
Permission Tokens
Execution Policy
Access Policy
Final rule
This inventory documents capability posture.
It does not grant, enable, or expand capability authority.

