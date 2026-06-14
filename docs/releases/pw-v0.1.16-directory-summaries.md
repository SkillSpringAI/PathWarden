# pw-v0.1.16 — Directory Summaries

## Purpose

Add metadata-only directory summaries so users can understand an allowed folder without reading file contents.

## Completed work

- Added `filesystem.summary` behavior through `fsSummarize.ts`.
- Reused read-only filesystem inspection.
- Added CLI wrapper for folder summaries.
- Added filesystem summary test coverage.
- Added desktop Directory Summary workflow.
- Displayed file count, folder count, visible file size, extension breakdown, largest files, and recent files.

## Boundary

This release is metadata-only.

It does not:

- read file contents
- recurse through subfolders
- search
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
- `npm run test:filesystem-summary`
- `npm run diag`
- `npm run verify:diagnostic-metadata`
- evidence export and latest report index verification

## Known limitations

- Summary uses immediate directory contents only.
- Some Windows junction/shell folders may appear as files.
- Filesystem search is still not implemented.
