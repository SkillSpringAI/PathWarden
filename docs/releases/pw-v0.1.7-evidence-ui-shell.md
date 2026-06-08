# PathWarden v0.1.7 Session Handoff

## Tag

```text
pw-v0.1.7-evidence-ui-shell
Status
pushed and tagged
working tree clean
Purpose

v0.1.7 made PathWarden's evidence/reporting layer visible through a minimal read-only desktop UI slice.

The goal was not to build the final UI. The goal was to prove that the existing Electron shell can display release evidence in a simplified user-facing way while preserving raw JSON access for power users.

Completed
docs/ui/PATHWARDEN_EVIDENCE_UI_SHELL_DESIGN.md
docs/ui/REPORT_VIEWER_DATA_CONTRACT.md
docs/ui/MINIMAL_EVIDENCE_UI_IMPLEMENTATION_PLAN.md
docs/ui/PATHWARDEN_SHELL_UI_REFERENCE.md
scripts/dev/export-latest-report-index.ts
scripts/dev/verify-latest-report-index.ts
apps/desktop/main/main.cjs evidence index IPC handler
apps/desktop/preload/preload.cjs evidence bridge method
apps/desktop/ui/src/index.html View Evidence button
apps/desktop/ui/src/renderer.js Evidence Overview renderer
docs/roadmap/PATHWARDEN_BUILD_ORDER.md updated
Package scripts added
npm run export:latest-report-index
npm run verify:latest-report-index
Current validated UI behavior
View Evidence works
Evidence Overview displays simplified user-facing cards
Raw Output still exposes JSON for power users
governance report status is visible
replay provenance status is visible
federation readiness status is visible
federation remains advisory and non-executable
Important UI correction

The current desktop shell is not the final PathWarden UI.

Current state:

functional Electron bridge prototype
View Evidence is the validated v0.1.7 slice
other older sidebar buttons may exist but are not the focus of v0.1.7

Future target:

three-panel command-center layout
simple governance states for general users
raw JSON and artifact paths for advanced users
approval and audit context visible without overwhelming the user
Design principle
The visual shell makes PathWarden understandable.
The kernel makes PathWarden trustworthy.

The UI must not invent or override:

risk level
decision code
approval requirement
policy result
audit status
execution permission
federation readiness
Verification completed

Final verification passed before tag:

npm run check
npm run diag
npm run verify:diagnostic-metadata
npm run export:governance-report
npm run export:replay-provenance-report
npm run export:federation-readiness-audit
npm run export:latest-report-index
npm run verify:latest-report-index
npm run test:governance-report-verifier
npm run test:replay-provenance-verifier
npm run test:federation-readiness-verifier
npm run test:report-input-support
npm run test:report-fixture-schemas

Manual desktop check passed:

desktop app launches
View Evidence works
Evidence Overview shows simplified cards
Raw Output exposes JSON
Recommended next version
v0.1.8 Desktop Shell Stabilization and Navigation Boundary
v0.1.8 recommended goal

Make the existing desktop shell honest and less confusing before adding more UI capability.

Recommended scope:

document current shell state
mark validated versus placeholder UI areas
make View Evidence clearly the validated active slice
label Raw Output as advanced detail
avoid broad UI rebuild
avoid backend expansion
v0.1.8 non-goals
no React/Vite migration
no AI chat implementation
no approval queue implementation
no new action execution
no policy editing
no Rust/native module
no federation runtime
no signing
no network behavior

