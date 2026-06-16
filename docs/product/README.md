# PathWarden Product Surface

## Purpose

This document is the shortest map of what a person can actually do with the project today.

## Current User-Facing Surfaces

### Desktop shell

Location: `apps/desktop/`

Current validated views:

- `View Evidence`
- `View Capabilities`

Current experimental or advanced views:

- diagnostics
- audit
- tasks and approval queue
- user-request planning
- read-only path inspection
- directory summary
- metadata-only filesystem search
- planned-request execution
- planned-request approval creation
- access-policy settings

### CLI and developer workflows

Location: root `package.json` and `scripts/dev/`

Current practical workflows:

- run regression and diagnostics
- export and verify evidence
- replay traces
- inspect, summarize, and search allowed folders
- plan a bounded read-only request
- queue a planned request for approval

## Current Boundaries

The project is currently strongest as:

- a governed local execution core
- a replay and evidence engine
- a developer or operator tool

It is not yet:

- a polished consumer desktop app
- a broad natural-language automation agent
- a federated runtime

## Recommended Reading

- [README](C:/Users/Laptop/Desktop/Pathwarden/README.md)
- [Architecture](C:/Users/Laptop/Desktop/Pathwarden/docs/architecture/README.md)
- [Capabilities](C:/Users/Laptop/Desktop/Pathwarden/docs/capabilities/CAPABILITY_INVENTORY.md)
- [Governance](C:/Users/Laptop/Desktop/Pathwarden/docs/governance/README.md)
- [Replay](C:/Users/Laptop/Desktop/Pathwarden/docs/replay/README.md)
