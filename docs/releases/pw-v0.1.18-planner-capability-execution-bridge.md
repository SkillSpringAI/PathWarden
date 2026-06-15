# pw-v0.1.18 — Planner to Capability Execution Bridge

## Purpose

Connect user request planning to supported read-only capability execution.

## Completed Work

- Updated planner routing for implemented capabilities.
- Added planned request execution bridge.
- Added support for:
  - `filesystem.inspect`
  - `filesystem.summary`
  - `filesystem.search`
- Added automated bridge test coverage.
- Added desktop Plan and Run workflow.
- Unsupported requests refuse without execution.

## Boundary

This release only executes supported read-only workflows.

It does not:

- write files
- move files
- rename files
- copy files
- delete files
- execute files
- read file contents
- perform recursive traversal
- expand approval queue authority
- use an LLM or agent loop

## Verification

Validated with:

- `npm run check`
- `npm run test:user-request-planner`
- `npm run test:planner-execution-bridge`
- `npm run test:filesystem-inspect`
- `npm run test:filesystem-summary`
- `npm run test:filesystem-search`
- `npm run diag`
- `npm run verify:diagnostic-metadata`
- evidence export and latest report index verification
- desktop manual verification

## User Workflow

User request  
? Planner  
? Capability selection  
? Read-only execution  
? Result display

Example requests:

- Find txt files in Documents
- Summarize Documents
- Inspect Documents

## Known Limitations

- Request parsing is deterministic and limited.
- Supported target folders are currently simple mapped names such as Documents and Downloads.
- Search remains metadata-only and immediate-directory only.
- No approval-backed write actions are enabled.
