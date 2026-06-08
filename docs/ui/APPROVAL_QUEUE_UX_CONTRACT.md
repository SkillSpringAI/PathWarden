# Approval Queue UX Contract

## Purpose

This document defines how PathWarden should present approval requests in the desktop shell.

The approval queue is a user-facing review layer. It does not create authority by itself.

## Core rule

```text
Approval UI may display and submit approval choices.
The kernel determines whether approval is required, valid, sufficient, or denied.
Current v0.1.9 boundary

v0.1.9 is UX-contract work.

Allowed:

define approval card fields
define approval states
define simple and advanced views
clarify approval boundaries
prepare task UI language for later cleanup

Not allowed:

change executor behavior
expand filesystem authority
change policy logic
change approval state machine
auto-execute approved tasks
add AI chat
add federation runtime
Approval queue purpose

The approval queue should help the user answer:

What is being requested?
What will happen if I approve?
Why is approval needed?
What risk level is involved?
What policy caused this?
Can I dry run it?
Can I deny or modify it?
Where is the audit record?
Approval card fields

Each approval card should show:

original request
parsed intent
mapped capability
confidence
risk level
policy decision
approval requirement
execution mode
affected files
affected folders
affected applications
network access required
reversibility
dry-run availability
triggered policy
audit record reference
next available action
Simple view

Simple View is for general users.

It should show:

plain-language title
short summary
risk level
what will happen
why approval is needed
available actions

Example:

Request: Move selected files into an archive folder.
Risk: Medium
Why approval is needed: This changes local files.
Available actions: Dry run, Approve once, Deny.
Advanced view

Advanced View is for power users.

It may show:

request ID
trace ID
task ID
capability ID
policy version
decision code
trigger hits
affected paths
execution parameters
audit path
raw JSON

Advanced View should not be the default.

Approval states

Use these display states consistently:

Pending Approval
Approved
Denied
Refused
Simulated
Executed
Failed Closed
Audited
State meanings
Pending Approval

Meaning:

The kernel determined that user approval is required before the action can continue.

Allowed user actions:

Approve once
Deny
Dry run, if available
Open audit context
View advanced details

Forbidden UI assumption:

Do not imply the task is safe merely because it is pending approval.
Approved

Meaning:

The user approved the task, but execution still depends on policy and executor checks.

Allowed user actions:

Run, if the kernel and executor allow it
Open audit context
View advanced details

Forbidden UI assumption:

Do not treat approval as authority to bypass policy.
Denied

Meaning:

The user denied the approval request.

Allowed user actions:

Review context
Create a modified request later

Forbidden UI assumption:

Do not retry automatically.
Refused

Meaning:

The kernel refused the request.

Allowed user actions:

Read refusal reason
Modify request if safe
Open audit context

Forbidden UI assumption:

Do not provide an approval button for refused actions unless the kernel emits a valid appeal/revision path.
Simulated

Meaning:

The action was evaluated or dry-run without performing the real-world change.

Allowed user actions:

Review simulated result
Approve once, if policy allows
Deny
Modify request

Forbidden UI assumption:

Do not imply simulation equals successful execution.
Executed

Meaning:

The approved and policy-valid action was executed.

Allowed user actions:

Review result
Open audit record
View affected artifacts

Forbidden UI assumption:

Do not hide partial failure or warnings.
Failed Closed

Meaning:

The system stopped rather than proceeding under uncertainty or invalid state.

Allowed user actions:

Review failure reason
Open diagnostics
Open audit context
Modify request later

Forbidden UI assumption:

Do not allow bypass from the UI.
Audited

Meaning:

An audit record exists for the approval or execution event.

Allowed user actions:

Open simple audit view
Open forensic audit view
View raw JSON

Forbidden UI assumption:

Do not claim audit completeness unless the audit record confirms it.
Available approval actions

The UI may present these actions only when supported by kernel/task state:

Approve once
Deny
Dry run
Modify request
Require stricter policy
Open audit context
View advanced details
Approval boundary

Approval is not the same as execution.

Approval means:

The user has granted consent for a specific proposed action under current policy constraints.

Approval does not mean:

policy bypass
permanent permission
filesystem authority expansion
network authority expansion
federation authority
delegated authority
executor success
Required warnings

Medium and high-risk approval cards should explain:

what will change
which files/apps/networks may be affected
why approval is required
whether the action is reversible
whether dry run is available
which policy was triggered
Raw JSON handling

Raw JSON should be available through advanced detail.

Default approval cards should prioritize:

clear summary
risk
reason
next action

Advanced detail may expose:

raw task object
approval ticket
policy block
audit record
trace metadata
UI authority limits

The approval queue UI must not:

invent approval requirements
downgrade risk
hide refusal
hide failed-closed state
auto-run after approval unless the kernel explicitly permits it
edit audit records
mark federation ready
expand allowed paths/apps/networks
Future implementation notes

Future UI should consume kernel outputs such as:

ApprovalTicket
DecisionEnvelope
PolicyBlock
TaskRecord
AuditRecord
CapabilityManifest
DiagnosticReport

The UI should display these outputs but not become their source of truth.

Final rule
The approval queue helps the user understand and consent.
The kernel decides whether the action is allowed.

