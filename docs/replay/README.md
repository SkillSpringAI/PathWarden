# PathWarden Replay

## Purpose

PathWarden replay reconstructs governance evidence from persisted authority records and audit events.

Replay is not only a debugging utility. It is the mechanism used to prove:

```text
what happened
which authority existed
which governance decision applied
which artifacts were created
whether authority was later revoked
whether persisted evidence remained intact
Current Replay Entrypoint

The current execution replay entrypoint is:

core/audit/executionReplay.ts

The main exported function is:

replayExecutionByTraceId(traceId)
Current Replay Inputs

Replay currently reads:

audit/events/*.jsonl
audit/authority/*.jsonl
policy/authority/permission-token-revocations.json

These inputs allow replay to reconstruct operational events, authority artifacts, and revocation state.

Current Replay Output

Replay currently returns:

trace_id
authority
audit_events
reconstructed_chain
revoked_token_ids
authority_chain_hash_mismatches
authority_record_hash_mismatches
authority_chain_continuity_breaks

These fields form the current replay evidence envelope.

Authority Replay

Authority replay is loaded through:

core/audit/authorityReader.ts

It groups authority records into:

raw authority records
permission token records
legitimacy artifact records

Authority records are treated as persisted governance evidence. They are not trusted blindly.

Audit Replay

Audit replay loads persisted audit events for the requested trace.

Audit events contribute:

decision codes
permission token references
legitimacy artifact references
authority-chain references

These records help connect runtime decisions to governance authority.

Replay Integrity Validation

The replay system currently performs several integrity checks.

Authority Chain Hash Mismatches
authority_chain_hash_mismatches

These indicate that a legitimacy artifact authority chain no longer matches its stored hash.

This may signal:

tampering
corruption
schema drift
replay inconsistency
Authority Record Hash Mismatches
authority_record_hash_mismatches

These indicate that a persisted authority record no longer matches its stored record hash.

This may signal:

post-write mutation
corrupted JSONL records
manual editing
invalid replay evidence
Authority Chain Continuity Breaks
authority_chain_continuity_breaks

These indicate that per-trace authority records no longer form a valid hash-linked sequence.

This may signal:

missing records
reordered records
altered previous hashes
broken replay lineage
Revoked Token IDs
revoked_token_ids

These identify permission tokens that existed in the replay record but were later revoked.

Revocation state is surfaced explicitly so downstream diagnostics can distinguish:

valid historical authority
revoked present authority
execution under invalidated authority
Reconstructed Chain
reconstructed_chain

The reconstructed chain is a deterministic replay summary.

It currently includes:

authority chain hash mismatches
authority record hash mismatches
authority continuity breaks
revoked permission tokens
permission tokens
legitimacy artifacts
authority steps
audit events
audit-linked permission tokens
audit-linked legitimacy artifacts
audit-linked authority steps

This chain is used by diagnostics and export tooling to inspect replay provenance.

Current Replay Status

Current status:

Replay reconstruction: implemented
Authority hash validation: implemented
Record hash validation: implemented
Continuity break detection: implemented
Revocation replay awareness: implemented
Replay baselines: implemented
Replay diffing: implemented
Replay provenance reporting: implemented
Replay snapshots: not implemented
Replay drift detection: not implemented
Future Replay Features

Future replay hardening may include:

replaySnapshot.ts
replayDriftDetector.ts
replayExportVerifier.ts

Expected refinements:

deterministic replay comparison
replay divergence detection
replay baseline snapshots
replay provenance verification
export consistency validation
historical replay trust snapshots
policy-version-aware replay
federation-compatible replay bundles
Pacing Rule

Do not introduce a full replay framework too early.

The current replay system should remain simple while replay remains trace-focused and locally bounded.

Introduce replay snapshots, diffing, or drift detection only when one or more of the following becomes true:

replay becomes a primary governance artifact
multiple replay outputs must be compared
federation requires portable replay bundles
policy versions affect replay interpretation
external audit requires replay baselines
Required Validation

After changing replay code:

npm run check
npm run diag

After changing replay documentation only:

npm run check
