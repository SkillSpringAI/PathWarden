# PathWarden

PathWarden is a local-first governed execution runtime for filesystem and task automation. It is the layer that decides whether local work should be allowed, records why, and preserves replayable evidence after the fact.

PathWarden is not an unrestricted autonomous agent. The project is centered on bounded authority, explicit policy, auditability, and replay.

## What Exists Today

Current implemented areas include:

- Governance kernel validation for capability grants, permission tokens, legitimacy artifacts, triggers, refusals, risk, and execution policy
- Local task storage, approval gating, task execution, and task history
- Replayable audit and authority persistence
- Evidence export and verification for governance, replay provenance, federation readiness, policy manifests, and authority snapshots
- Read-only filesystem inspection, directory summary, and metadata-only search
- A desktop shell with a validated evidence view and additional experimental or advanced controls

## Current Product Surface

The repo currently exposes two main ways to work with PathWarden.

### CLI and developer scripts

The root `package.json` is the main developer entry point. It includes scripts for:

- type-checking
- diagnostics and regression coverage
- evidence export and verification
- replay and trace export
- read-only filesystem inspection, summary, and search
- user-request planning and approval-queue task creation

### Desktop shell

The Electron shell lives under `apps/desktop/`.

Current desktop status:

- Validated: `View Evidence`, `View Capabilities`
- Experimental or advanced: diagnostics, audit viewing, task queue controls, user-request planning, read-only folder inspection, directory summary, metadata-only search, planned-request execution, and approval-request creation

The desktop shell is still a thin bridge over local scripts and governance logic. It is not yet a polished end-user product.

## Current Boundaries

PathWarden currently supports:

- local execution only
- explicit authority artifacts
- policy-checked filesystem and task workflows
- replay and evidence generation
- advisory federation-readiness reporting

PathWarden does not currently provide:

- unrestricted natural-language automation
- networked execution
- delegated cross-runtime authority
- federation runtime
- remote trust negotiation
- production-ready policy administration UX

`capabilities/filesystem/fsWrite.ts` remains unimplemented, and write-like desktop workflows should still be treated as incomplete unless a specific governed path is documented in code and tests.

## Key Commands

Install dependencies:

```bash
npm install
cd apps/desktop && npm install
```

Type-check:

```bash
npm run check
```

Run the main regression and diagnostic chain:

```bash
npm run diag
```

Plan a read-only user request:

```bash
npm run plan:user-request -- "Find txt files in Documents"
```

Execute a supported read-only planned request:

```bash
npm run execute:planned-request -- "Find txt files in Documents"
```

Export current evidence artifacts:

```bash
npm run export:governance-report
npm run export:replay-provenance-report
npm run export:federation-readiness-audit
npm run export:latest-report-index
```

Launch the desktop shell:

```bash
cd apps/desktop
npm start
```

## Repository Map

- `core/` - governance, audit, execution, trust, and task runtime logic
- `capabilities/` - filesystem capability implementations
- `policy/` - execution policy, triggers, grants, trust, refusals, and revocations
- `schemas/` - JSON schemas for runtime artifacts
- `scripts/dev/` - developer-facing commands and regression scripts
- `apps/desktop/` - Electron shell
- `docs/` - architecture, governance, replay, diagnostics, capability, and release notes

## Suggested Reading

- [Architecture Overview](C:/Users/Laptop/Desktop/Pathwarden/docs/architecture/README.md)
- [Capability Inventory](C:/Users/Laptop/Desktop/Pathwarden/docs/capabilities/CAPABILITY_INVENTORY.md)
- [Governance Overview](C:/Users/Laptop/Desktop/Pathwarden/docs/governance/README.md)
- [Replay Overview](C:/Users/Laptop/Desktop/Pathwarden/docs/replay/README.md)
- [Diagnostics Overview](C:/Users/Laptop/Desktop/Pathwarden/docs/diagnostics/README.md)

Historical release notes under `docs/releases/` and roadmap notes under `docs/roadmap/` are useful context, but they should be read as milestone snapshots rather than the single source of truth for current capability posture.
