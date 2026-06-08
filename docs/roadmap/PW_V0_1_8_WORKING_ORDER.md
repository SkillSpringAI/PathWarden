# PathWarden v0.1.8 Working Order

## Title

Desktop Shell Stabilization and Navigation Boundary

## Status

```text
in progress
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
Slice 1 — Documentation boundary

Create:

docs/ui/DESKTOP_SHELL_STATUS_BOUNDARY.md

Purpose:

Explain current shell state, validated areas, legacy areas, future target, and UI authority limits.
Slice 2 — UI copy boundary

Update current desktop shell labels so the interface distinguishes:

Validated
Experimental
Advanced
Legacy
Future
Slice 3 — Raw Output clarification

Rename or visually mark Raw Output as:

Advanced Raw Output

Add copy:

For power users. General users can rely on the summary cards above.
Slice 4 — Final verification

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
Recommended tag
pw-v0.1.8-desktop-shell-boundary

