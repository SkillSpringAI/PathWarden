# PathWarden v0.1.10 Working Order

## Title

Desktop Evidence Viewer Refinement

## Status

```text
in progress
Purpose

Turn the working Evidence Overview into a cleaner, more demo-ready evidence/report viewer without adding new authority, execution behavior, or backend complexity.

The goal is to make the validated View Evidence flow easier for general users to understand while preserving raw JSON and artifact paths for power users.

Current baseline
v0.1.7 evidence UI shell is tagged
v0.1.8 desktop shell boundary is tagged
v0.1.9 approval queue UX foundation is tagged
View Evidence is the validated desktop UI slice
Task / Approval Queue remains experimental
Advanced Raw Output remains available for power users
Primary goal
Make the Evidence Overview a clearer, screenshot-able, demo-ready read-only workflow.
Scope
improve Evidence Overview card hierarchy
make general-user status language clearer
separate simple evidence posture from power-user report paths
preserve raw JSON in Advanced Raw Output
avoid report-generation behavior from UI
avoid execution behavior changes
Non-goals
no new execution behavior
no approval logic changes
no policy editing
no report generation from UI
no AI chat implementation
no React/Vite migration
no Rust/native module
no federation runtime
no signing
no network behavior
Planned slices
Slice 1 — Evidence viewer refinement contract

Create:

docs/ui/EVIDENCE_VIEWER_REFINEMENT_CONTRACT.md

Purpose:

Define the simple/advanced split for the Evidence Overview.
Slice 2 — Evidence Overview UI copy and hierarchy

Update:

apps/desktop/ui/src/renderer.js

Allowed:

clearer card names
clearer user-facing summary
dedicated Report Paths card
dedicated Boundary card
simpler status wording

Not allowed:

changing index schema
changing export scripts
changing verification logic
adding report generation from UI
Slice 3 — Light visual refinement

Update:

apps/desktop/ui/src/styles.css

Allowed:

small evidence-card styling
simple emphasis for status text
improve spacing/readability

Not allowed:

full redesign
new UI framework
mockup rebuild
Slice 4 — Final verification

Run:

npm run check
npm run diag
npm run verify:diagnostic-metadata
npm run export:governance-report
npm run export:replay-provenance-report
npm run export:federation-readiness-audit
npm run export:latest-report-index
npm run verify:latest-report-index
npm run test:report-fixture-schemas

Manual desktop check:

desktop app launches
View Evidence works
Evidence Overview is clearer
general-user summary is readable
report paths are available for power users
Advanced Raw Output still shows JSON
no new execution behavior added
Recommended tag
pw-v0.1.10-desktop-evidence-viewer-refinement

