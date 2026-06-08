# PathWarden Evidence Overview Demo

## Purpose

This walkthrough explains how to run the current validated PathWarden desktop demo.

The validated demo path is:

```text
generate evidence reports
export latest report index
verify latest report index
launch desktop shell
open View Evidence
review summary cards and Advanced Raw Output
Current demo boundary

This demo shows the read-only Evidence Overview workflow.

It does not demonstrate:

new task execution
approval queue production workflow
AI chat
policy editing
report generation from UI
federation runtime
signing
network behavior
Rust/native modules
Validated UI path
View Evidence
Experimental / advanced UI paths

The desktop shell may also show:

Run Startup
Run Diagnostics
View Diagnostics
View Tasks / Approval Queue
View Audit
task draft controls
default task templates
settings panels

These are not the primary demo path for v0.1.11.

Prerequisites

From repo root:

cd C:\Users\Laptop\Desktop\PathWarden

Install dependencies if needed:

npm install
Step 1 — Run baseline checks
npm run check
npm run diag
npm run verify:diagnostic-metadata

Expected result:

all checks pass
Step 2 — Generate evidence reports
npm run export:governance-report
npm run export:replay-provenance-report
npm run export:federation-readiness-audit

Expected result:

governance report generated
replay provenance report generated
federation readiness audit generated
Step 3 — Export latest report index
npm run export:latest-report-index
npm run verify:latest-report-index

Expected result:

exports/report-index/latest-report-index.json exists
latest report index verifies successfully
Step 4 — Launch desktop shell

Stop any stale Electron process first:

Get-Process electron -ErrorAction SilentlyContinue | Stop-Process -Force

Launch the desktop app:

cd apps/desktop
npm start
Step 5 — Open the validated evidence view

In the sidebar, click:

View Evidence

Expected cards:

Evidence Summary
What This Means
Governance Evidence
Replay Provenance
Federation Readiness
Report Paths
Read-Only Boundary
Step 6 — Explain the cards
Evidence Summary

Shows the high-level evidence posture.

Expected fields:

Governance evidence
Release-safe
Replay lineage
Replay admissibility
Federation readiness
What This Means

Translates evidence flags into plain English.

This is the main general-user explanation card.

Governance Evidence

Shows governance report status and whether the evidence is release-safe.

Replay Provenance

Shows whether replay provenance is admissible and whether lineage is complete.

Federation Readiness

Shows whether federation is ready.

Important boundary:

Federation readiness is advisory. This UI does not enable federation runtime.
Report Paths

Shows report artifact paths for power users.

Read-Only Boundary

Explains that the evidence viewer does not:

generate reports
approve tasks
execute tasks
mutate policy
mutate authority
start federation
Step 7 — Advanced Raw Output

The lower raw output panel shows JSON for power users.

General users can rely on the summary cards.

Power users can inspect:

latest report index JSON
report IDs
paths
status flags
readiness flags
Demo script

Use this short explanation when showing the app:

PathWarden is a local-first governed desktop assistant framework.

The current validated workflow is the Evidence Overview. Before the desktop app opens, reports are generated and verified through command-line diagnostics. The desktop shell then displays the latest evidence index in a simpler form.

The top cards are for general users. They explain whether governance evidence is release-safe, whether replay provenance is complete and admissible, and whether federation is ready.

The report paths and Advanced Raw Output remain available for power users.

This view is read-only. It does not approve actions, execute tasks, mutate policy, or start federation.
Demo success criteria
baseline checks pass
latest report index verifies
desktop app launches
View Evidence opens
Evidence Summary appears first
What This Means appears second
Report Paths are visible
Read-Only Boundary is visible
Advanced Raw Output shows JSON
no new execution behavior is demonstrated
Troubleshooting
View Evidence shows missing index

Run:

cd C:\Users\Laptop\Desktop\PathWarden

npm run export:governance-report
npm run export:replay-provenance-report
npm run export:federation-readiness-audit
npm run export:latest-report-index
npm run verify:latest-report-index

Then restart the desktop app.

Desktop app shows old UI

Stop Electron and restart:

Get-Process electron -ErrorAction SilentlyContinue | Stop-Process -Force

cd C:\Users\Laptop\Desktop\PathWarden\apps\desktop
npm start
Checks fail

Do not continue the demo.

Run:

npm run check
npm run diag

Fix the failing check before presenting the desktop workflow.

Final rule
Demo the validated evidence workflow.
Do not imply unfinished controls are production-ready.

