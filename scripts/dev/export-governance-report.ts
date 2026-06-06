import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildGovernanceReport,
  validateGovernanceReport
} from "../../core/audit/governanceReport";

const report = buildGovernanceReport();

validateGovernanceReport(report);

const exportDir = resolve(
  process.cwd(),
  "exports",
  "governance"
);

mkdirSync(exportDir, { recursive: true });

const exportPath = resolve(
  exportDir,
  `${report.report_id}.json`
);

writeFileSync(
  exportPath,
  JSON.stringify(report, null, 2),
  "utf8"
);

console.log(`Governance report written to: ${exportPath}`);
console.log(`Report id: ${report.report_id}`);
console.log(`Authority status: ${report.authority.status}`);
console.log(`Authority records: ${report.authority.record_count}`);
console.log(`Policy status: ${report.policy.status}`);
console.log(`Policy hashes available: ${report.policy.hashes_available}`);
console.log(`Replay status: ${report.replay.status}`);
console.log(`Diagnostics status: ${report.diagnostics.overall_status}`);
console.log(`Summary status: ${report.summary.status}`);
console.log(`Release safe: ${report.summary.release_safe}`);
