# PathWarden v0.1.11 Working Order

## Title

Demo Readiness and Public-Facing Walkthrough

## Status

```text
in progress
Purpose

Make the current PathWarden state explainable to another person through a short demo flow, README guidance, screenshots, and a clear release narrative.

The goal is not to add new capability. The goal is to make the validated evidence workflow easy to run, explain, and show.

Current baseline
v0.1.7 evidence UI shell is tagged
v0.1.8 desktop shell boundary is tagged
v0.1.9 approval queue UX foundation is tagged
v0.1.10 desktop evidence viewer refinement is tagged
View Evidence is the strongest demo-ready workflow
Task / Approval Queue remains experimental / advanced
Advanced Raw Output remains available for power users
Primary goal
Create a clear demo path for the validated read-only Evidence Overview workflow.
Scope
add demo walkthrough doc
add current desktop demo script
add README section for Evidence Overview
add screenshot capture checklist
document validated versus experimental UI paths
document commands needed before launching desktop
avoid backend behavior changes
Non-goals
no new execution behavior
no approval logic changes
no policy editing
no AI chat implementation
no report generation from UI
no React/Vite migration
no Rust/native module
no federation runtime
no signing
no network behavior
Planned slices
Slice 1 — Demo walkthrough

Create:

docs/demo/PATHWARDEN_EVIDENCE_OVERVIEW_DEMO.md

Purpose:

Explain how to run the validated evidence workflow from clean checkout to desktop view.
Slice 2 — Screenshot checklist

Create:

docs/demo/SCREENSHOT_CAPTURE_CHECKLIST.md

Purpose:

Define screenshots needed for README, release notes, and public-facing explanation.
Slice 3 — README evidence overview section

Update:

README.md

Purpose:

Add a short current-state demo section without overselling unfinished capabilities.
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
Evidence Overview is demo-ready
README/demo docs match current behavior
no new execution behavior added
Recommended tag
pw-v0.1.11-demo-readiness-and-walkthrough

