# PathWarden v0.1.8 Working Order

## Title

Desktop Shell Stabilization and Navigation Boundary

## Status

```text
implementation complete
pending final verification and tag
Purpose

Stabilize the current Electron shell so it clearly communicates what is validated, what is legacy, and what is future-facing.

v0.1.8 should reduce user confusion without expanding backend capability.

Current baseline
v0.1.7 evidence UI shell is tagged
View Evidence is the validated UI slice
Raw Output exposes JSON for power users
current shell still contains older sidebar controls
end-state UI direction is documented in PATHWARDEN_SHELL_UI_REFERENCE.md
Primary goal
Make the desktop shell honest and less overwhelming.
Scope
add desktop shell status/boundary documentation
label View Evidence as validated
label other sidebar controls as experimental or legacy
label Raw Output as Advanced Raw Output
add simple explanatory copy for general users
avoid backend expansion
Non-goals
no React/Vite migration
no AI chat implementation
no approval queue implementation
no policy editing
no new execution capability
no report generation from UI
no diagnostic runner replacement
no Rust/native module
no federation runtime
no signing
no network behavior
Planned slices
Slice 1 � Documentation boundary

Create:

docs/ui/DESKTOP_SHELL_STATUS_BOUNDARY.md

Purpose:

Explain current shell state, validated areas, legacy areas, future target, and UI authority limits.
Slice 2 � UI copy boundary

Update current desktop shell labels so the interface distinguishes:

Validated
Experimental
Advanced
Legacy
Future
Slice 3 � Raw Output clarification

Rename or visually mark Raw Output as:

Advanced Raw Output

Add copy:

For power users. General users can rely on the summary cards above.
Slice 4 � Final verification

Run:

npm run check
npm run diag
npm run verify:diagnostic-metadata
npm run export:latest-report-index
npm run verify:latest-report-index

Manual desktop check:

View Evidence works
sidebar no longer implies all buttons are equally validated
raw JSON is still visible
no new execution controls added

## Completed implementation

```text
docs/roadmap/PW_V0_1_8_WORKING_ORDER.md
docs/ui/DESKTOP_SHELL_STATUS_BOUNDARY.md
apps/desktop/ui/src/index.html navigation boundary labels
apps/desktop/ui/src/index.html Advanced Raw Output label
apps/desktop/ui/src/index.html general-user evidence boundary note
apps/desktop/ui/src/styles.css section label styling

Current desktop shell posture
View Evidence is the validated UI slice.
Older sidebar controls are labelled Experimental / Advanced.
Raw JSON is labelled Advanced Raw Output.
General users are directed toward summary cards.
Power users retain raw JSON visibility.
No new execution capability was added.

Final verification target
npm run check
npm run diag
npm run verify:diagnostic-metadata
npm run export:governance-report
npm run export:replay-provenance-report
npm run export:federation-readiness-audit
npm run export:latest-report-index
npm run verify:latest-report-index
npm run test:report-fixture-schemas
git status --short

Manual desktop check
desktop app launches
View Evidence still works
Validated / Experimental grouping is visible
Advanced Raw Output label is visible
general-user boundary note is visible
no new execution controls added
```

Recommended tag
pw-v0.1.8-desktop-shell-boundary

