# PathWarden v0.1.8 Session Handoff

## Tag

```text
pw-v0.1.8-desktop-shell-boundary
Status
pushed and tagged
working tree clean
Purpose

v0.1.8 stabilized the current Electron desktop shell by making the UI boundary clearer.

The goal was not to build the final PathWarden interface. The goal was to make the existing shell honest about what is validated, what is experimental/advanced, and what is intended for power users.

Completed
docs/roadmap/PW_V0_1_8_WORKING_ORDER.md
docs/ui/DESKTOP_SHELL_STATUS_BOUNDARY.md
apps/desktop/ui/src/index.html navigation boundary labels
apps/desktop/ui/src/index.html Advanced Raw Output label
apps/desktop/ui/src/index.html general-user evidence boundary note
apps/desktop/ui/src/styles.css section label styling
docs/roadmap/PW_V0_1_8_WORKING_ORDER.md completion update
Current desktop shell posture
View Evidence is the validated UI slice.
Older sidebar controls are labelled Experimental / Advanced.
Raw JSON is labelled Advanced Raw Output.
General users are directed toward summary cards.
Power users retain raw JSON visibility.
No new execution capability was added.
Current validated UI behavior
desktop app launches
View Evidence works
Evidence Overview shows simplified cards
Validated / Experimental grouping is visible
Advanced Raw Output label is visible
general-user boundary note is visible
raw JSON remains visible for power users
Important boundary

The desktop shell is still a functional bridge prototype.

It should not yet be treated as the final PathWarden shell.

Current UI authority rule:

The UI may clarify PathWarden.
The UI must not become PathWarden's authority.

The UI must not invent or override:

risk level
decision code
approval requirement
policy result
audit status
execution permission
federation readiness
Verification completed

Final verification target for v0.1.8:

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

Manual desktop check:

desktop app launches
View Evidence still works
Validated / Experimental grouping is visible
Advanced Raw Output label is visible
general-user boundary note is visible
no new execution controls added
Recommended next version
v0.1.9 Approval Queue UX Foundation
v0.1.9 recommended purpose

Begin shaping the approval queue as a user-visible workflow without expanding execution capability.

The aim is to make pending/approved/denied task states understandable before adding any stronger action execution behavior.

v0.1.9 recommended scope
document approval queue UX contract
define approval card fields
define simple/advanced approval views
separate approval display from execution authority
mark current task controls as experimental
improve task card language if safe
avoid adding new execution capability
v0.1.9 non-goals
no new executor behavior
no broader filesystem authority
no policy editing
no automatic execution
no AI chat implementation
no React/Vite migration
no Rust/native module
no federation runtime
no signing
no network behavior
Recommended v0.1.9 tag
pw-v0.1.9-approval-queue-ux-foundation

