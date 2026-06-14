# pw-v0.1.15 — Controlled Read-Only Filesystem Inspection

## Purpose

Add the first directly useful PathWarden user workflow: controlled read-only filesystem inspection.

## Completed work

- Added `filesystem.inspect` capability for immediate directory inspection.
- Added access-policy enforcement through existing path guards.
- Added CLI wrapper for inspecting allowed folders.
- Added filesystem inspection test coverage.
- Added desktop UI path inspection workflow.
- Updated request planner to avoid advertising unimplemented filesystem search.
- Displayed inspection results in desktop cards.

## Boundary

This release is read-only.

It does not:

- read file contents
- write files
- move files
- rename files
- copy files
- delete files
- execute files
- bypass access policy

## Verification

Validated with:

- `npm run check`
- `npm run test:user-request-planner`
- `npm run test:filesystem-inspect`
- `npm run diag`
- `npm run verify:diagnostic-metadata`
- evidence export and report-index verification

## Known limitations

- Filesystem search is not implemented yet.
- Inspection lists immediate directory contents only.
- Some Windows shell folders or junctions may appear as files.
