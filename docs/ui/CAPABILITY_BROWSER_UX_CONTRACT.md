# Capability Browser UX Contract

## Purpose

This document defines how PathWarden should present capabilities to users in a read-only way.

The capability browser helps users understand what PathWarden can do, cannot do, may do later, or can only do under approval.

It must not create or expand execution authority.

## Core rule

```text
The capability browser displays capability boundaries.
It does not grant capability authority.
Current v0.1.12 boundary

Allowed:

document capability display model
define capability fields
separate validated, experimental, disabled, and future capabilities
show risk and approval requirements
show scope limits
show source references
prepare for a future desktop Capabilities view

Not allowed:

add new execution behavior
expand filesystem authority
enable controlled write execution
edit policy from UI
generate reports from UI
add AI chat
add federation runtime
add signing
add network behavior
User questions the browser should answer

The capability browser should help a user answer:

What can PathWarden currently do?
What is only experimental?
What is disabled?
What is planned but not implemented?
What requires approval?
What is read-only?
What can affect files, apps, network, or policy?
Where is this capability defined?
Capability status vocabulary

Use these statuses consistently:

Validated
Experimental
Advanced
Disabled
Future
Not implemented
Status meanings
Validated
Current release-tested capability or UI path.

Example:

View Evidence
Experimental
Technically present or partially wired, but not final UX or production posture.

Example:

Tasks / Approval Queue
Advanced
Useful for developers or power users, but not intended as the general-user path.

Example:

Advanced Raw Output
Disabled
Known capability intentionally unavailable.
Future
Planned direction, documented but not currently implemented.
Not implemented
Mentioned conceptually but no current working implementation exists.
Required capability fields

Each capability entry should include:

capability name
short description
status
risk level
approval requirement
execution mode
scope limits
current UI exposure
source file or document reference
notes
Risk levels

Use simple risk levels:

None
Low
Medium
High
Blocked
Unknown
None
Purely informational or read-only with no meaningful state mutation.
Low
Read-only inspection or display where failure is low impact.
Medium
May affect local tasks, files, settings, or workflow state.
High
Could affect sensitive files, authority, policy, execution, network, or cross-system behavior.
Blocked
Capability should not run under current policy or current implementation state.
Unknown
Insufficient information. UI must not assume safety.
Approval requirement values

Use these values:

None
Required
Conditional
Blocked
Unknown
None
No user approval required because the capability is read-only or informational.
Required
User approval is required before the action can continue.
Conditional
Approval depends on policy, scope, request parameters, or risk classification.
Blocked
Approval is not sufficient because the capability is unavailable or refused.
Unknown
The UI cannot determine approval requirements from available data.
Execution mode values

Use these values:

Read-only
Dry-run
Approval-gated
Controlled write
Disabled
Future
Unknown
Scope limit fields

Where relevant, show:

file scope
folder scope
application scope
network scope
policy scope
audit scope
federation scope

If scope is not known, show:

Unknown

Do not guess.

General-user view

The general-user view should show:

capability name
plain-language description
status
risk
whether approval is required
short limitation note

Example:

Evidence Overview
Status: Validated
Risk: Low
Approval: None
Mode: Read-only
Limit: Displays existing local evidence only. Does not generate reports or execute actions.
Advanced view

The advanced view may show:

source files
schema references
policy references
capability IDs
execution mode
scope limits
raw manifest or JSON
diagnostic references

Advanced details should not be the default reading path.

Display grouping

Recommended grouping:

Validated
Experimental / Advanced
Disabled / Blocked
Future / Not implemented
Initial capability categories

The browser may eventually include:

Evidence and Reporting
Diagnostics
Tasks and Approval
Audit
Policy and Access
Filesystem
Application Access
Federation
AI Chat / Local Model

Do not force categories that are not supported by the repo.

UI authority limits

The capability browser must not:

enable hidden capabilities
grant permissions
modify policy
expand allowed folders or apps
run tasks
approve tasks
execute actions
mark federation ready
claim a capability is validated without evidence
Empty or uncertain state

If capability data is missing or incomplete, the UI should say:

Capability status unavailable.

It should not invent a capability map.

Future desktop view

A future Capabilities view should show cards like:

Capability
Status
Risk
Approval
Mode
Scope
Source

It should include a clear note:

This view is read-only. It explains available capabilities but does not grant authority.
Final rule
Capabilities should be discoverable before they are executable.

