# PathWarden Capability Inventory

## Purpose

This document records the current observable capability surface of PathWarden. It documents posture only. It does not grant authority, expand policy, or replace the kernel registries.

## Status Meanings

- Validated: present and treated as a current supported slice
- Experimental: implemented but still rough, partial, or not yet final UX
- Advanced: mainly developer or operator facing
- Not implemented: placeholder, intentionally blocked, or missing

## Validated

### Evidence Overview

Description:

Displays the latest generated evidence posture in the desktop shell.

Current UI exposure:

`View Evidence`

Scope limits:

- reads the latest report index
- does not generate reports
- does not approve or execute tasks
- does not mutate policy or authority

### Capability Inventory View

Description:

Displays a simplified capability posture summary in the desktop shell.

Current UI exposure:

`View Capabilities`

Scope limits:

- reads a display-focused inventory file
- does not grant or expand capability authority

### Latest Report Index

Description:

Indexes the latest governance, replay-provenance, and federation-readiness outputs used by the evidence view.

Current workflow:

- `npm run export:latest-report-index`
- `npm run verify:latest-report-index`

## Advanced Reporting

### Governance Report Export

- CLI-driven export under `exports/`
- displayed indirectly through the evidence view

### Replay Provenance Report Export

- CLI-driven export under `exports/`
- used to assess admissibility and lineage completeness

### Federation Readiness Audit

- advisory only
- does not enable federation runtime
- does not create delegated authority

### Replay Baseline and Replay Diff

- source-backed under `core/audit/`
- exportable and schema-validated through developer workflows
- useful for replay comparison and provenance hardening

## Experimental and Advanced Operator Flows

### Diagnostics

Current surfaces:

- `npm run diag`
- desktop `Run Diagnostics`
- desktop `View Diagnostics`

Notes:

- the package diagnostic chain is the main regression entry point
- the desktop shell also exposes report-oriented diagnostic helpers

### Tasks and Approval Queue

Current surfaces:

- `View Tasks / Approval Queue`
- approve once
- deny or cancel
- run approved task
- create planned-request approval tasks

Notes:

- approval does not bypass policy or executor checks
- current UI is operator-oriented and still experimental

### User Request Planner

Description:

Plans simple user requests into bounded read-only capabilities.

Current surfaces:

- `npm run plan:user-request -- "<request>"`
- desktop `Plan Request`

Current scope:

- inspection-style requests
- directory summary requests
- metadata-only search requests
- planning only, no execution

### Planned Request Execution Bridge

Description:

Plans and runs a small set of supported read-only filesystem flows.

Current surfaces:

- `npm run execute:planned-request -- "<request>"`
- desktop `Plan and Run`

Current scope:

- inspect
- summarize
- search

Current limits:

- read-only only
- narrow path inference
- not a general natural-language executor

### Read-Only Path Inspection

Description:

Lists immediate directory contents for an allowed path.

Source references:

- `capabilities/filesystem/fsInspect.ts`
- `scripts/dev/inspect-path-json.ts`

Limits:

- immediate directory only
- metadata only
- no file-content reads

### Directory Summary

Description:

Summarizes immediate directory metadata including counts, visible sizes, extensions, large files, and recent files.

Source references:

- `capabilities/filesystem/fsSummarize.ts`
- `scripts/dev/summarize-path-json.ts`

### Filesystem Search

Description:

Searches immediate files in an allowed directory by extension, name fragment, or minimum size.

Source references:

- `capabilities/filesystem/fsSearch.ts`
- `scripts/dev/search-path-json.ts`
- desktop `Filesystem Search`

Limits:

- metadata only
- immediate directory only
- no content search
- no recursive traversal

### Access Policy Settings

Description:

Displays or edits access-policy-related device folders and applications through the experimental shell.

Notes:

- safety-sensitive
- should be treated as advanced configuration, not casual end-user UI

## Governed Execution Paths Present in Source

These paths exist in the codebase but should still be treated as advanced and tightly bounded:

- filesystem read
- filesystem move
- filesystem copy
- filesystem rename
- filesystem delete

They remain subject to path guards, access policy, execution policy, approval requirements, and permission-token rules.

## Not Implemented

### Filesystem Write

`capabilities/filesystem/fsWrite.ts` is still not implemented and should not be presented as available.

## Authority Mechanisms

These are core governance mechanisms, not convenience features:

- capability grant validation
- permission tokens
- legitimacy artifacts
- execution policy
- access policy
- trigger registry
- revocation handling

## Final Rule

This inventory documents current posture. It does not grant, enable, or expand capability authority.
