# PathWarden v0.1.9 Working Order

## Title

Approval Queue UX Foundation

## Status

```text
implementation complete
pending final verification and tag
Purpose

Begin shaping the approval queue as a clear user-visible workflow without expanding execution capability.

The goal is to make pending, approved, denied, refused, and executed task states understandable before adding stronger action behavior.

Current baseline
v0.1.7 evidence UI shell is tagged
v0.1.8 desktop shell boundary is tagged
View Evidence is the validated desktop UI slice
older sidebar controls are labelled Experimental / Advanced
raw JSON is labelled Advanced Raw Output
Primary goal
Make approval review understandable without increasing authority.
Scope
document approval queue UX contract
define approval card fields
define approval state vocabulary
define simple view versus advanced view
separate approval display from execution authority
clarify that UI approval does not create authority by itself
prepare current task cards for later UX cleanup
Non-goals
no new executor behavior
no broader filesystem authority
no automatic execution
no policy editing
no AI chat implementation
no React/Vite migration
no Rust/native module
no federation runtime
no signing
no network behavior
Planned slices
Slice 1 � Approval Queue UX Contract

Create:

docs/ui/APPROVAL_QUEUE_UX_CONTRACT.md

Purpose:

Define what approval cards show, what states exist, and what the UI may or may not do.
Slice 2 � Approval State Display Model

Create or update documentation for canonical display states:

Pending Approval
Approved
Denied
Refused
Simulated
Executed
Failed Closed
Audited

Each state should include:

plain-language meaning
kernel/source-of-truth field
allowed user action
forbidden UI assumption
advanced detail available
Slice 3 � Current Task UI Copy Review

Update current desktop task-card language only if safe.

Allowed:

rename unclear headings
add Experimental / Advanced copy
add approval-boundary copy
make task cards easier to read

Not allowed:

change approval behavior
change execution behavior
change task state machine
change policy logic
Slice 4 � Final Verification

Run:

npm run check
npm run diag
npm run verify:diagnostic-metadata
npm run export:latest-report-index
npm run verify:latest-report-index
npm run test:report-fixture-schemas

Manual desktop check:

View Evidence still works
Experimental / Advanced labels remain visible
task controls still behave as before
no new execution controls added
approval language is clearer

## Completed implementation

```text
docs/roadmap/PW_V0_1_9_WORKING_ORDER.md
docs/ui/APPROVAL_QUEUE_UX_CONTRACT.md
docs/ui/APPROVAL_STATE_DISPLAY_MODEL.md
apps/desktop/ui/src/index.html task/approval queue labels
apps/desktop/ui/src/renderer.js approval boundary card
apps/desktop/ui/src/renderer.js safer approval action labels
Current approval queue posture
Task / Approval Queue remains experimental.
Approval display is clearer.
Approval does not imply policy bypass.
Run is labelled as Run approved task.
Cancel is labelled as Deny / Cancel.
Task draft creation is labelled experimental.
No task behavior changed.
No execution authority was expanded.

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
View Tasks / Approval Queue opens
task controls are clearly experimental
approval boundary card is visible
buttons use safer labels
no new execution behavior was added
```

Recommended tag
pw-v0.1.9-approval-queue-ux-foundation

