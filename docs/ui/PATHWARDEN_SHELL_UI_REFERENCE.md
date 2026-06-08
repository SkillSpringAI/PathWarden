# PathWarden Shell / UI Reference

## Purpose

This document preserves the target UI direction for PathWarden's later-stage shell.

It is a reference guide only.

The current repo remains the authority layer, governed execution engine, and source of truth. The UI is a presentation and request-submission layer.

## Current implementation status

Current desktop shell:

```text
apps/desktop

Current working view:

View Evidence

Current limitation:

Other sidebar features are present from the older shell, but View Evidence is the currently validated v0.1.7 evidence-view slice.
Reference mockup direction

The target UI should move toward a three-panel command-center layout:

left panel = navigation and system status
center panel = user-facing interaction, evidence, task cards, and approval prompts
right panel = governance trace, risk, token/model metadata, and audit context

The mockup direction includes:

local-first AI chat
visible governance active state
Ollama/model status
policy status
trace/risk/token inspection
sidebar navigation
audit/policy/capability separation
fail-closed identity
Core UI principle
The UI may display governance decisions.
The kernel must make governance decisions.

The UI must not invent or override:

risk level
decision code
approval requirement
policy result
audit status
execution permission
federation readiness
General-user versus power-user split

The general user should see simplified states:

Evidence available
Diagnostics passed
Policy verified
Replay lineage incomplete
Federation not ready
Action requires approval
Action blocked
Action completed

Power users should be able to access:

raw JSON
artifact paths
full governance report
full replay provenance report
full federation readiness audit
diagnostic metadata
audit record details
trace IDs
policy/version references

Raw JSON should be available but not be the default presentation.

Recommended navigation
Navigation
AI Chat
Evidence
Governance
Audit Log
Policies
Capabilities
Approval Queue
Tasks
Settings
Diagnostics
System status
Ollama status
selected local model
kernel mode
policy status
latest diagnostic status
latest evidence index status
Admin / advanced
Raw reports
Artifact paths
Forensic audit view
Developer diagnostics
Recommended screen model
1. AI Chat

Purpose:

User-facing request interface.

Should show:

local model status
governance active badge
request input
assistant response
policy decision summary
approval requirement if applicable

Must not:

execute actions without kernel approval
hide high-risk classification
hide refusal or escalation
2. Evidence

Purpose:

Simple overview of current local evidence posture.

Should show:

governance report status
replay provenance status
federation readiness status
release_safe
admissible
lineage_complete
ready_for_federation

General-user labels:

Release-safe: Yes / No
Replay admissible: Yes / No
Lineage complete: Yes / No
Federation ready: Yes / No

Power-user controls:

View raw governance JSON
View raw replay provenance JSON
View raw federation readiness JSON
Open artifact path
3. Governance

Purpose:

Explain why PathWarden allowed, refused, escalated, or required approval.

Should show:

decision
risk level
policy result
triggered rules
required approval
next available action
4. Audit Log

Purpose:

Review historical decisions and execution records.

Simple View:

time
request
decision
risk
capability
reason

Forensic View:

request ID
trace ID
policy version
capability version
dataset/config version
parameters
approval status
execution status
full governance trace
audit file path
5. Policies

Purpose:

Show the current operating posture and policy boundaries.

Possible profiles:

Read Only
Careful Mode
Standard Mode
Developer Mode
Emergency Lockdown

Each should explain:

allowed actions
denied actions
approval requirements
folder/app/network scope
6. Capabilities

Purpose:

Show what PathWarden can and cannot do.

Should show:

capability name
description
risk level
allowed/denied status
approval requirement
scope limits
example requests
7. Approval Queue

Purpose:

Let the user review medium/high-risk actions before execution.

Approval cards should show:

original request
parsed intent
mapped capability
confidence
risk level
policy decision
affected files/apps/networks
why approval is needed
reversibility
dry-run availability
triggered policy

Available actions:

Approve once
Deny
Dry run
Modify request
Require stricter policy
Open audit context
Request state vocabulary

Use these states consistently:

Allowed
Simulated
Escalated
Pending Approval
Approved
Denied
Refused
Failed Closed
Executed
Audited

Each state should include:

short explanation
risk level
capability
policy result
audit record link
next available user action
Layout model
Left panel
PathWarden identity
navigation
governance active indicator
model status
system mode
Center panel
chat / evidence / task content
request cards
approval prompts
summary cards
Right panel
trace
risk
tokens
policy context
artifact references
raw/forensic details
Visual hierarchy

Default view should prioritize:

plain-language outcome
risk/readiness state
next action
reason

Advanced details should be secondary:

raw JSON
trace IDs
hashes
artifact paths
schema names
Current v0.1.7 boundary

For the current build, the only validated UI expansion should remain:

read-only Evidence Overview
latest report index display
explicit federation-not-ready boundary
raw JSON available in output

Do not expand yet into:

AI chat implementation
approval queue implementation
new action capabilities
React/Vite migration
Rust/native modules
federation runtime
signing
network behavior
Future integration contract

The UI should later consume kernel outputs such as:

DecisionEnvelope
PolicyBlock
ApprovalTicket
AuditRecord
CapabilityManifest
DiagnosticReport
GovernanceReport
ReplayProvenanceReport
FederationReadinessAudit

The UI must never become authoritative.

Final rule
The visual shell makes PathWarden understandable.
The kernel makes PathWarden trustworthy.

