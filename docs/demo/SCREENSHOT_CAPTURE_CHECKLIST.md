# Screenshot Capture Checklist

## Purpose

This checklist defines the screenshots needed to explain the current PathWarden desktop demo clearly.

The screenshots should show the validated Evidence Overview workflow without implying that experimental controls are production-ready.

## Current validated screenshot path

```text
View Evidence
Screenshot boundaries

Screenshots should not imply that PathWarden currently has:

production approval queue
AI chat implementation
policy editing UI
federation runtime
new execution behavior
network behavior
Rust/native modules
Required screenshots
1. Desktop shell overview

Purpose:

Show the desktop shell with the sidebar and validated View Evidence path visible.

Must show:

Validated section
View Evidence button
Experimental / Advanced section
Advanced Raw Output label if visible

Avoid emphasizing:

experimental task controls
unfinished settings panels
2. Evidence Summary card

Purpose:

Show the high-level evidence posture.

Must show:

Evidence Summary
Governance evidence
Release-safe
Replay lineage
Replay admissibility
Federation readiness
3. What This Means card

Purpose:

Show plain-language explanation for general users.

Must show:

What This Means
release-safe explanation
replay provenance explanation
federation readiness explanation
4. Report Paths card

Purpose:

Show power-user artifact access without making raw JSON the main interface.

Must show:

Report Paths
latest index path
governance report path
replay provenance report path
federation readiness audit path
5. Read-Only Boundary card

Purpose:

Show that the Evidence Overview is non-executing.

Must show:

This view is read-only
does not generate reports
does not approve or execute tasks
does not mutate policy or authority
does not start federation
6. Advanced Raw Output

Purpose:

Show that raw JSON remains available for power users.

Must show:

Advanced Raw Output
JSON evidence data
summary cards above if possible
Optional screenshots
7. Experimental / Advanced sidebar

Purpose:

Show that older controls are clearly separated from the validated evidence path.

Must show:

Experimental / Advanced label
Run Startup
Run Diagnostics
View Diagnostics
View Tasks / Approval Queue
View Audit
8. Tasks / Approval Queue experimental state

Purpose:

Show that the task area is not being presented as the final approval queue.

Only include if needed.

Must show:

experimental wording
approval boundary card
safer button labels
Suggested screenshot filenames

Save screenshots under:

docs/demo/assets

Suggested names:

pathwarden-desktop-overview.png
pathwarden-evidence-summary.png
pathwarden-what-this-means.png
pathwarden-report-paths.png
pathwarden-read-only-boundary.png
pathwarden-advanced-raw-output.png
pathwarden-experimental-sidebar.png
pathwarden-approval-queue-experimental.png
Capture preparation

Before taking screenshots, run:

cd C:\Users\Laptop\Desktop\PathWarden

npm run check
npm run diag
npm run verify:diagnostic-metadata

npm run export:governance-report
npm run export:replay-provenance-report
npm run export:federation-readiness-audit
npm run export:latest-report-index
npm run verify:latest-report-index

Then launch:

Get-Process electron -ErrorAction SilentlyContinue | Stop-Process -Force

cd apps/desktop
npm start
Screenshot quality rules
use the current validated UI
avoid showing unrelated desktop clutter
avoid showing private files or personal folders where possible
do not crop out the boundary language
do not hide Advanced / Experimental labels
do not imply raw JSON is the primary UX
README usage

Recommended README screenshots:

pathwarden-desktop-overview.png
pathwarden-evidence-summary.png
pathwarden-what-this-means.png
pathwarden-read-only-boundary.png

Optional README screenshot:

pathwarden-advanced-raw-output.png
Release note usage

Recommended release note screenshots:

pathwarden-evidence-summary.png
pathwarden-report-paths.png
pathwarden-read-only-boundary.png
Final rule
Screenshots should make the validated evidence workflow clear without overselling unfinished controls.

