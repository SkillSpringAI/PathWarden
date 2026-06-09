# PathWarden v0.1.11 Session Handoff

## Tag

```text
pw-v0.1.11-demo-readiness-and-walkthrough
Status
pushed and tagged
working tree clean
Purpose

v0.1.11 made the current PathWarden desktop state easier to explain and demonstrate.

The focus was documentation and demo readiness, not new backend capability.

Completed
docs/roadmap/PW_V0_1_11_WORKING_ORDER.md
docs/demo/PATHWARDEN_EVIDENCE_OVERVIEW_DEMO.md
docs/demo/SCREENSHOT_CAPTURE_CHECKLIST.md
README.md Evidence Overview demo section
docs/roadmap/PW_V0_1_11_WORKING_ORDER.md completion update
apps/desktop/ui/src/index.html task approval queue label correction
apps/desktop/ui/src/renderer.js task approval queue label/status correction
Current validated demo path
View Evidence

The validated demo workflow is:

run checks
generate evidence reports
export latest report index
verify latest report index
launch desktop shell
click View Evidence
review Evidence Summary, What This Means, Report Paths, Read-Only Boundary, and Advanced Raw Output
Current UI posture
View Evidence is the strongest demo-ready workflow.
Task / Approval Queue remains experimental / advanced.
Advanced Raw Output remains available for power users.
Experimental controls are labelled more honestly.
The desktop shell is still a functional bridge prototype, not the final PathWarden UI.
What the demo shows
governance report status
release-safe posture
replay provenance status
replay lineage completeness
federation readiness status
report artifact paths
read-only evidence boundary
advanced raw JSON output
What the demo does not show
production approval queue
AI chat implementation
policy editing UI
federation runtime
new execution behavior
network behavior
Rust/native modules
Verification completed
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
Evidence Overview matches README/demo docs
Advanced Raw Output remains visible
Experimental / Advanced labels remain visible
Tasks / Approval Queue labels are aligned
no new execution controls added
Recommended next version
v0.1.12 Read-Only Capability Browser Foundation
Why this should be next

The evidence viewer is now demo-ready enough for the current stage.

The next useful feature should help users understand what PathWarden can and cannot do before they request actions.

This is safer than moving straight into controlled write execution.

v0.1.12 recommended purpose

Create a read-only capability browser foundation that lists available capabilities, their risk level, current status, scope limits, and whether they are validated, experimental, or future-facing.

v0.1.12 recommended scope
document capability browser UX contract
define capability display fields
create or expose a simple local capability inventory if already present
add a read-only Capabilities view if low-risk
show capability name, description, risk, status, approval requirement, and scope limits
avoid execution changes
v0.1.12 non-goals
no new execution behavior
no broader filesystem authority
no controlled write execution
no policy editing
no AI chat implementation
no React/Vite migration
no Rust/native module
no federation runtime
no signing
no network behavior
Recommended v0.1.12 tag
pw-v0.1.12-read-only-capability-browser-foundation

