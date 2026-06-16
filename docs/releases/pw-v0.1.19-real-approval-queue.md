# pw-v0.1.19 — Real Approval Queue

## Purpose

Connect planned user requests to the existing task approval queue so requests can be queued, approved, or cancelled before execution.

## Completed Work

- Added planned request task creation.
- Reused existing task queue persistence under `tasks/queue`.
- Reused existing task approval and cancellation flow.
- Added desktop UI for creating approval-gated planned requests.
- Added automated approval queue test coverage.
- Fixed task-related desktop script paths for task queue actions.

## Boundary

This release does not execute planned-request tasks.

It supports:

- create approval request
- persist queued request
- view queue
- approve task
- cancel task

It does not:

- execute custom planned-request tasks
- write files
- move files
- rename files
- copy files
- delete files
- read file contents
- expand authority or approval policy

## Verification

Validated with:

- `npm run check`
- `npm run test:planned-request-approval-queue`
- desktop manual verification

## Known Limitations

- Planned request tasks use `type: custom`.
- Existing task runner refuses unsupported custom task execution.
- Execution of approved planned requests is deferred to v0.1.20.
