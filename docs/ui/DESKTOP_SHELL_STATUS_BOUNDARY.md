# Desktop Shell Status Boundary

## Purpose

This document defines the current status boundary for the PathWarden desktop shell.

The goal is to prevent the current UI from implying that every visible control is equally validated, production-ready, or part of the current release scope.

## Current status

```text
PathWarden desktop shell exists.
View Evidence is the validated v0.1.7 UI slice.
Other shell controls may exist from earlier prototype work.
The final target shell is documented separately in PATHWARDEN_SHELL_UI_REFERENCE.md.
Current validated area
View Evidence

Status:

validated

Purpose:

Display the latest local evidence index in simplified user-facing cards.

Current behavior:

shows governance report status
shows replay provenance status
shows federation readiness status
shows simplified evidence posture
keeps raw JSON available for power users
does not execute actions
does not mutate authority
does not generate reports
does not start federation
Current non-validated or legacy areas

The following areas may exist in the current shell but should not be treated as final UX:

Run Startup
Run Diagnostics
View Diagnostics
View Tasks
View Audit
task approval controls
settings panels
folder/app policy controls

These may be technically wired from earlier work, but v0.1.8 does not promote them as final user-facing flows.

They should be labelled or treated as:

experimental
legacy shell controls
advanced/developer controls
not part of the validated v0.1.7 evidence UI slice
General-user boundary

General users should see:

simple status labels
clear explanations
next action guidance
high-level evidence posture
whether something is safe, incomplete, blocked, or advisory

General users should not be required to interpret:

raw JSON blobs
trace IDs
schema internals
hashes
artifact paths
diagnostic metadata
Power-user boundary

Power users may access:

raw JSON
artifact paths
diagnostic metadata
audit context
schema-backed evidence
report IDs
trace IDs

This should be exposed as advanced detail, not the default reading path.

UI authority boundary

The UI may:

display kernel decisions
display evidence reports
submit user requests
display approval requirements
display audit references
display policy status

The UI must not:

invent governance decisions
override kernel refusals
change risk levels
change policy results
change approval requirements
mark federation ready
create authority
mutate audit history
silently execute actions
Navigation label policy

Current shell navigation should distinguish between:

Validated
Experimental
Advanced
Legacy
Future

Recommended meanings:

Validated
Current release-tested UI path.
Experimental
Technically present but not yet hardened as final UX.
Advanced
Useful for developers or power users.
Legacy
Older prototype control retained temporarily.
Future
Target direction documented but not implemented.
v0.1.8 goal

v0.1.8 should make the shell more honest by:

marking View Evidence as validated
marking other visible controls as experimental or advanced
renaming Raw Output to Advanced Raw Output
adding clear explanatory copy
avoiding new backend behavior
avoiding broad UI rebuild
Explicit non-goals
no React/Vite migration
no AI chat implementation
no approval queue implementation
no new execution capability
no policy editing
no federation runtime
no signing
no network behavior
no Rust/native module
Final rule
The shell may clarify PathWarden.
The shell must not become PathWarden's authority.

