import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { replayExecutionByTraceId } from "../../core/audit/executionReplay";

const traceId = "trace_capability_1779763459935";

const authorityFile = resolve(
  process.cwd(),
  "audit",
  "authority",
  "2026-05-26.jsonl"
);

const originalContent = readFileSync(authorityFile, "utf8");

try {
  const lines = originalContent
    .split("\n")
    .filter(Boolean);

  let changed = false;

  const patchedLines = lines.map((line) => {
    const record = JSON.parse(line);

    if (
      !changed &&
      record.trace_id === traceId &&
      record.record_type === "legitimacy_artifact"
    ) {
      record.previous_authority_hash =
        "broken_previous_authority_hash_for_diagnostic";
      changed = true;
    }

    return JSON.stringify(record);
  });

  if (!changed) {
    console.error(JSON.stringify({
      ok: false,
      diagnostic: "authority-continuity-break",
      message: "No matching legitimacy artifact record found to corrupt."
    }, null, 2));

    process.exit(1);
  }

  writeFileSync(
    authorityFile,
    patchedLines.join("\n") + "\n",
    "utf8"
  );

  const replay = replayExecutionByTraceId(traceId);

  const detected =
    replay.authority_chain_continuity_breaks.length > 0;

  if (!detected) {
    console.error(JSON.stringify({
      ok: false,
      diagnostic: "authority-continuity-break",
      message: "Continuity break was NOT detected.",
      replay
    }, null, 2));

    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    diagnostic: "authority-continuity-break",
    continuity_break_detected: true,
    authority_chain_continuity_breaks:
      replay.authority_chain_continuity_breaks
  }, null, 2));
}
finally {
  writeFileSync(
    authorityFile,
    originalContent,
    "utf8"
  );
}