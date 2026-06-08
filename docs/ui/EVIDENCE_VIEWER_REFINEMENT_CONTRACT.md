# Evidence Viewer Refinement Contract

## Purpose

This document defines how the PathWarden Evidence Overview should present evidence to general users and power users.

The Evidence Overview is the currently validated desktop UI slice. It should be clear, read-only, demo-ready, and honest about system limits.

## Core rule

```text
The Evidence Viewer displays evidence.
It does not generate reports, mutate authority, approve actions, execute tasks, or start federation.
Current v0.1.10 boundary

Allowed:

improve card hierarchy
improve plain-language evidence status
separate general-user summary from power-user details
show report paths clearly
preserve raw JSON in Advanced Raw Output
improve spacing and readability

Not allowed:

change latest report index schema
change export scripts
change verifier logic
generate reports from UI
add execution behavior
add approval behavior
add federation runtime
add policy editing
User groups
General users

General users should see:

overall evidence posture
simple status labels
plain-language meaning
whether anything needs attention
whether federation is advisory or unavailable

General users should not need to read:

raw JSON
trace IDs
schema internals
artifact paths
report IDs
hashes
diagnostic metadata
Power users

Power users may need:

report IDs
artifact paths
raw JSON
advanced report status
admissibility flags
release-safe flags
readiness flags

These should remain available, but not as the default reading path.

Evidence Overview card hierarchy

Recommended order:

1. Evidence Summary
2. What This Means
3. Governance Evidence
4. Replay Provenance
5. Federation Readiness
6. Report Paths
7. Read-Only Boundary
Evidence Summary card

Purpose:

Give the user a quick high-level posture.

Should show:

Governance evidence status
Replay lineage status
Replay admissibility status
Federation readiness status

Avoid:

long report IDs
raw JSON
schema terms without explanation
What This Means card

Purpose:

Translate evidence flags into plain English.

Should explain:

whether governance evidence is release-safe
whether replay provenance can be trusted
whether federation is ready or still advisory
what the user should inspect next
Governance Evidence card

Purpose:

Show governance report status and release-safe posture.

Should show:

status
release-safe yes/no/unknown
report ID

Power-user paths should be moved to the Report Paths card.

Replay Provenance card

Purpose:

Show whether replay lineage is complete and admissible.

Should show:

status
admissible yes/no/unknown
lineage complete yes/no/unknown
report ID

Power-user paths should be moved to the Report Paths card.

Federation Readiness card

Purpose:

Show federation readiness without implying federation runtime exists.

Should show:

status
ready for federation yes/no/unknown
audit ID
plain-language warning if not ready

Must always preserve this boundary:

Federation readiness is advisory. This UI does not enable federation runtime.
Report Paths card

Purpose:

Give power users direct artifact references without overwhelming general users.

Should show:

governance report path
replay provenance report path
federation readiness audit path
latest report index path
Read-Only Boundary card

Purpose:

Make it explicit that the Evidence Viewer is non-executing.

Should state:

This view is read-only.
It does not generate reports.
It does not approve or execute tasks.
It does not mutate policy or authority.
It does not start federation.
Raw JSON remains available in Advanced Raw Output.
Status wording

Prefer simple labels:

Verified
Verified with warnings
Incomplete
Failed
Not checked
Missing
Unknown

Avoid implying more confidence than the report provides.

Raw JSON handling

Raw JSON should remain visible in:

Advanced Raw Output

The UI should not remove or hide raw JSON completely.

General users can rely on summary cards. Power users can inspect raw output and report paths.

Final rule
The Evidence Viewer should make evidence understandable without making the UI authoritative.

