# pw-v0.1.17 — Filesystem Search

## Purpose

Add metadata-only filesystem search so users can locate files within allowed folders without reading file contents.

## Completed Work

* Added `fsSearch.ts` capability.
* Added metadata-only search by:

  * file extension
  * filename text
  * minimum file size
* Reused existing filesystem inspection and access-policy enforcement.
* Added CLI search workflow.
* Added filesystem search test coverage.
* Added desktop Filesystem Search workflow.
* Added search result rendering in desktop UI.

## Boundary

This release remains read-only.

It does not:

* read file contents
* search file contents
* recurse through subfolders
* write files
* move files
* rename files
* copy files
* delete files
* execute files
* bypass access policy

## Verification

Validated with:

* `npm run check`
* `npm run test:user-request-planner`
* `npm run test:filesystem-inspect`
* `npm run test:filesystem-summary`
* `npm run test:filesystem-search`
* `npm run diag`
* `npm run verify:diagnostic-metadata`
* governance and report export verification
* desktop manual verification

## Known Limitations

* Search operates on immediate directory contents only.
* No recursive traversal.
* No file-content search.
* Metadata-only search.
* Some Windows junctions or shell folders may appear as files.

## Examples

Supported workflows:

* Find `.txt` files
* Find files containing `"skill"`
* Find files larger than a specified size
* Combine extension and filename filters

Example workflow:

User Request
→ Capability Plan
→ Filesystem Search
→ Results Display
