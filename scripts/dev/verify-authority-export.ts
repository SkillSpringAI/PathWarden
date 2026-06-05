import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  validateAuthorityExportVerification,
  verifyAuthoritySnapshotExport
} from "../../core/audit/authorityExportVerifier";
import type { AuthoritySnapshot } from "../../core/audit/authoritySnapshot";

const snapshotPathArg = process.argv[2];

if (!snapshotPathArg) {
  console.error("Usage: npm run verify:authority-export -- <authority_snapshot_json_path>");
  process.exit(1);
}

const snapshotPath = resolve(process.cwd(), snapshotPathArg);

if (!existsSync(snapshotPath)) {
  console.error(`Authority snapshot not found: ${snapshotPath}`);
  process.exit(1);
}

const snapshot = JSON.parse(
  readFileSync(snapshotPath, "utf8")
) as AuthoritySnapshot;

const verification = verifyAuthoritySnapshotExport(
  snapshot,
  snapshotPathArg
);

validateAuthorityExportVerification(verification);

console.log(JSON.stringify({
  ok: verification.summary.admissible,
  diagnostic: "authority-export-verification",
  verification_id: verification.verification_id,
  target: verification.target,
  checks: verification.checks,
  summary: verification.summary
}, null, 2));

if (!verification.summary.admissible) {
  process.exit(1);
}
