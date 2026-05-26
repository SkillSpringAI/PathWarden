import { copyFileSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { readAuthorityRecordsByTraceId } from "../../core/audit/authorityReader";

const sourceFile = resolve(
  process.cwd(),
  "audit",
  "authority",
  "2026-05-26.jsonl"
);

const corruptedFile = resolve(
  process.cwd(),
  "audit",
  "authority",
  "2026-05-26.corrupted.jsonl"
);

copyFileSync(sourceFile, corruptedFile);

const lines = readFileSync(corruptedFile, "utf8")
  .split("\n")
  .filter(Boolean);

const first = JSON.parse(lines[0]);

if (first.record_type === "permission_token") {
  delete first.token.token_id;
}

lines[0] = JSON.stringify(first);

writeFileSync(
  corruptedFile,
  lines.join("\n") + "\n",
  "utf8"
);

let corruptionDetected = false;

try {
  readAuthorityRecordsByTraceId(
    "trace_capability_1779758646071"
  );
}
catch {
  corruptionDetected = true;
}

unlinkSync(corruptedFile);

if (!corruptionDetected) {
  console.error(JSON.stringify({
    ok: false,
    diagnostic: "authority-record-corruption",
    message: "Corruption was NOT detected."
  }, null, 2));

  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  diagnostic: "authority-record-corruption",
  corruption_detected: true
}, null, 2));