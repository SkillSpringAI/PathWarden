# PathWarden v0.1.12 Working Order

## Title

Read-Only Capability Browser Foundation

## Status

```text
in progress
Purpose

Create a read-only capability browser foundation so users can understand what PathWarden can and cannot do before requesting actions.

The goal is to improve transparency without expanding execution authority.

Current baseline
v0.1.7 evidence UI shell is tagged
v0.1.8 desktop shell boundary is tagged
v0.1.9 approval queue UX foundation is tagged
v0.1.10 desktop evidence viewer refinement is tagged
v0.1.11 demo readiness and walkthrough is tagged
View Evidence is the strongest demo-ready workflow
Task / Approval Queue remains experimental / advanced
Primary goal
Make PathWarden capabilities understandable in a read-only way.
Scope
document capability browser UX contract
define capability display fields
inspect existing capability/config files
avoid inventing authority that does not exist
add a read-only capability inventory only if low-risk
prepare for a future Capabilities desktop view
Non-goals
no new execution behavior
no broader filesystem authority
no controlled write execution
no policy editing
no AI chat implementation
no report generation from UI
no React/Vite migration
no Rust/native module
no federation runtime
no signing
no network behavior
Planned slices
Slice 1 — Capability Browser UX Contract

Create:

docs/ui/CAPABILITY_BROWSER_UX_CONTRACT.md

Purpose:

Define how capabilities should be shown to users without implying they are all executable or production-ready.
Slice 2 — Existing capability source inspection

Inspect existing repo files for capability/config sources.

Potential areas:

capabilities
config
core
docs

Purpose:

Avoid inventing a capability registry if one already exists.
Slice 3 — Read-only capability inventory

Create only if inspection supports it:

docs/capabilities/CAPABILITY_INVENTORY.md

or a small JSON fixture if the repo already has an appropriate pattern.

Required fields:

capability name
description
status
risk level
approval requirement
scope limits
current UI exposure
source file/reference
Slice 4 — Optional desktop view contract only

Only document the future desktop view unless the existing bridge makes implementation trivial.

Allowed:

document Capabilities view
show validated / experimental / future states

Not allowed:

new action execution
new IPC execution path
new filesystem authority
Slice 5 — Final verification

Run:

npm run check
npm run diag
npm run verify:diagnostic-metadata
npm run export:latest-report-index
npm run verify:latest-report-index
npm run test:report-fixture-schemas

Manual desktop check:

View Evidence still works
Task / Approval Queue remains experimental
no new execution behavior added
Recommended tag
pw-v0.1.12-read-only-capability-browser-foundation

