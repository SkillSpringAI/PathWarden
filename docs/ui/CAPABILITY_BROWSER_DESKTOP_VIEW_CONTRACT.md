# Capability Browser Desktop View Contract

## Purpose

This document defines how a future PathWarden desktop Capabilities view should behave.

The view should help users understand available, experimental, disabled, and future capabilities without granting authority or enabling execution.

## Current v0.1.12 boundary

This is a display contract only.

Allowed:

```text
define future Capabilities view layout
define capability card fields
define validated / experimental / future grouping
define simple and advanced views
document read-only UI authority boundary

Not allowed:

add desktop IPC for capabilities
add new execution behavior
grant permissions
edit policy
expand filesystem authority
execute tasks
approve tasks
start federation
Source of truth

The future Capabilities view should not invent capability state.

It should consume source-backed data from:

docs/capabilities/CAPABILITY_INVENTORY.md
capabilities/filesystem
core/kernel/capabilityGrantValidator.ts
core/kernel/executionPolicy.ts
core/kernel/permissionToken*.ts
core/executor/commitExecutor.ts
config/access-policy.json
policy/registry/app-registry.json
policy/registry/tool-registry.json
policy/grants/app-grants.json
policy/runtime/execution-policy.json

If a stable machine-readable capability source is later created, the UI should consume that source rather than duplicating logic.

View title

Recommended title:

Capabilities

Recommended subtitle:

Read-only capability overview. This view explains capability posture but does not grant authority.
Grouping model

The view should group capability cards by posture:

Validated
Experimental / Advanced
Disabled / Blocked
Future / Not implemented
Authority Mechanisms
General-user capability card

Each general-user card should show:

Capability name
Short description
Status
Risk
Approval requirement
Execution mode
Short limitation note

Example:

Evidence Overview
Status: Validated
Risk: Low
Approval: None
Mode: Read-only
Limit: Displays existing local evidence only. Does not generate reports or execute actions.
Advanced capability details

Advanced details may show:

source files
policy references
scope limits
capability category
current UI exposure
notes
raw inventory entry if available

Advanced details should be collapsed or secondary by default.

Capability status labels

Use these labels consistently:

Validated
Experimental
Advanced
Disabled
Future
Not implemented
Risk labels

Use these labels consistently:

None
Low
Medium
High
Blocked
Unknown
Approval labels

Use these labels consistently:

None
Required
Conditional
Blocked
Unknown
Execution mode labels

Use these labels consistently:

Read-only
Dry-run
Approval-gated
Controlled write
Disabled
Future
Unknown
Recommended first visible capabilities

Initial browser should show these groups from the current inventory.

Validated
Evidence Overview
Latest Report Index
Advanced / Reporting
Governance Report Export
Replay Provenance Report Export
Federation Readiness Audit
Diagnostics
Experimental / Advanced
Tasks / Approval Queue
Filesystem Read
Filesystem Move
Filesystem Copy
Filesystem Rename
Filesystem Delete
Access Policy
Not implemented
Filesystem Search
Filesystem Write
Authority mechanisms
Capability Grant Validation
Permission Tokens
Execution Policy
Access Policy
Required boundary copy

The view must include this copy:

This view is read-only.
It explains capability posture.
It does not grant permissions.
It does not approve or execute tasks.
It does not change policy.
It does not start federation.
Button policy

Allowed buttons:

View advanced details
Open source reference, later if safe
Open related documentation, later if safe

Not allowed buttons:

Run
Execute
Approve
Grant permission
Edit policy
Enable federation
Expand scope
Empty state

If capability data is missing or unavailable, show:

Capability status unavailable.
The UI cannot safely determine capability posture from available data.

Do not show guessed capability cards.

Future data model

A future machine-readable capability manifest may use fields like:

id
name
description
category
status
risk_level
approval_requirement
execution_mode
scope_limits
current_ui_exposure
source_references
notes

This should be introduced only when the source model is stable enough.

Final rule
The capability browser explains boundaries before the system exposes actions.

