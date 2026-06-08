# Approval State Display Model

## Purpose

This document defines how approval and task states should be displayed in the PathWarden desktop shell.

The goal is to make task status understandable without changing the underlying approval, policy, or execution behavior.

## Core rule

```text
The UI displays state.
The kernel and task system determine state.

The UI must not infer, invent, upgrade, downgrade, or override task state.

Display principles

Approval state display should be:

plain-language first
audit-backed
policy-aware
safe by default
honest about uncertainty
clear about next available action

Raw state fields, IDs, traces, and JSON should remain available for advanced users, but should not be the default reading path.

Canonical display states

Use these states consistently:

Pending Approval
Approved
Denied
Refused
Simulated
Executed
Failed Closed
Audited
Unknown
State display contract

Each displayed state should include:

plain-language meaning
source-of-truth field
allowed user action
forbidden UI assumption
advanced detail available
Pending Approval
Plain-language meaning
This task needs user approval before it can continue.
Source of truth
task status
approval ticket
policy block
kernel decision envelope
Allowed user actions
Approve once
Deny
Dry run, if available
Open audit context
View advanced details
Forbidden UI assumption
Do not imply the task is safe simply because approval is requested.
Advanced detail
task ID
approval ticket ID
risk level
policy decision
triggered policy
affected paths/apps/networks
raw task JSON
Approved
Plain-language meaning
The user approved this task, but policy and executor checks still apply.
Source of truth
approval status
task status
audit record
policy block
Allowed user actions
Run, only if task state and policy allow it
Open audit context
View advanced details
Forbidden UI assumption
Do not treat approval as permission to bypass policy.
Advanced detail
approval timestamp
approver identity if available
decision code
policy version
execution readiness
raw approval JSON
Denied
Plain-language meaning
The user denied this task.
Source of truth
approval status
task status
audit record
Allowed user actions
Review context
Open audit record
Create a modified request later
Forbidden UI assumption
Do not retry or resubmit automatically.
Advanced detail
denial timestamp
task ID
audit path
raw task JSON
Refused
Plain-language meaning
PathWarden refused this request.
Source of truth
kernel decision envelope
policy block
refusal code
audit record
Allowed user actions
Read refusal reason
Open audit context
Modify request if safe
Forbidden UI assumption
Do not show approval controls for refused actions unless the kernel emits a valid revision path.
Advanced detail
refusal code
trigger hits
policy version
decision envelope
raw refusal JSON
Simulated
Plain-language meaning
PathWarden evaluated the action without performing the real change.
Source of truth
simulation result
dry-run record
task status
audit record
Allowed user actions
Review simulated result
Approve once, if policy allows
Deny
Modify request
Open audit context
Forbidden UI assumption
Do not imply simulation means the action has executed.
Advanced detail
dry-run output
affected paths/apps/networks
warnings
policy block
raw simulation JSON
Executed
Plain-language meaning
The approved and policy-valid action was executed.
Source of truth
execution result
task status
audit record
executor report
Allowed user actions
Review result
Open audit record
View affected artifacts
View advanced details
Forbidden UI assumption
Do not hide warnings, partial failures, or uncertainty.
Advanced detail
execution timestamp
executor result
changed artifacts
warnings
audit path
raw execution JSON
Failed Closed
Plain-language meaning
PathWarden stopped instead of continuing under uncertainty or invalid state.
Source of truth
failure record
kernel decision envelope
diagnostic result
audit record
Allowed user actions
Review failure reason
Open diagnostics
Open audit context
Modify request later
Forbidden UI assumption
Do not allow bypass from the UI.
Advanced detail
failure code
diagnostic metadata
policy block
trace ID
raw failure JSON
Audited
Plain-language meaning
An audit record exists for this task or decision.
Source of truth
audit record
audit index
task record
Allowed user actions
Open simple audit view
Open forensic audit view
View raw JSON
Forbidden UI assumption
Do not claim audit completeness unless the audit record confirms it.
Advanced detail
audit path
audit record ID
trace ID
policy version
capability version
raw audit JSON
Unknown
Plain-language meaning
PathWarden cannot clearly determine the current state from available data.
Source of truth
missing, malformed, stale, or inconsistent task/evidence data
Allowed user actions
Refresh
Open diagnostics
View raw data
Open audit context if available
Forbidden UI assumption
Do not guess the state.
Do not allow execution from Unknown state.
Advanced detail
raw task object
missing fields
validation errors
diagnostic references
Display priority

Default cards should show:

state
plain-language explanation
risk level
what happens next
available actions

Advanced details may show:

task ID
trace ID
policy version
capability version
raw JSON
artifact paths
diagnostic metadata
Button visibility rule

Buttons should only appear when supported by current state.

Examples:

Pending Approval may show Approve once / Deny / Dry run.
Denied should not show Run.
Refused should not show Approve unless a kernel-backed revision path exists.
Failed Closed should not show bypass or force-run.
Unknown should not show execution buttons.
Final rule
State display must reduce confusion without increasing authority.

