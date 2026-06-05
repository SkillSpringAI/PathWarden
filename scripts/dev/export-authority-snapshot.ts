import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildAuthoritySnapshot,
  validateAuthoritySnapshot
} from "../../core/audit/authoritySnapshot";

const snapshot = buildAuthoritySnapshot();

validateAuthoritySnapshot(snapshot);

const exportDir = resolve(
  process.cwd(),
  "exports",
  "authority"
);

mkdirSync(exportDir, { recursive: true });

const exportPath = resolve(
  exportDir,
  `${snapshot.snapshot_id}.json`
);

writeFileSync(
  exportPath,
  JSON.stringify(snapshot, null, 2),
  "utf8"
);

console.log(`Authority snapshot written to: ${exportPath}`);
console.log(`Authority records: ${snapshot.authority.record_count}`);
console.log(`Snapshot id: ${snapshot.snapshot_id}`);
