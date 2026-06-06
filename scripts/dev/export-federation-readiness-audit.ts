import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildFederationReadinessAudit,
  validateFederationReadinessAudit
} from "../../core/audit/federationReadinessAudit";

const audit = buildFederationReadinessAudit();

validateFederationReadinessAudit(audit);

const exportDir = resolve(
  process.cwd(),
  "exports",
  "federation"
);

mkdirSync(exportDir, { recursive: true });

const exportPath = resolve(
  exportDir,
  `${audit.audit_id}.json`
);

writeFileSync(
  exportPath,
  JSON.stringify(audit, null, 2),
  "utf8"
);

console.log(`Federation readiness audit written to: ${exportPath}`);
console.log(`Audit id: ${audit.audit_id}`);
console.log(`Governance status: ${audit.governance.status}`);
console.log(`Governance release safe: ${audit.governance.release_safe}`);
console.log(`Replay provenance status: ${audit.replay_provenance.status}`);
console.log(`Replay provenance admissible: ${audit.replay_provenance.admissible}`);
console.log(`Replay lineage complete: ${audit.replay_provenance.lineage_complete}`);
console.log(`Policy status: ${audit.policy.status}`);
console.log(`Diagnostics status: ${audit.diagnostics.status}`);
console.log(`Federation status: ${audit.federation.status}`);
console.log(`Federation ready: ${audit.federation.ready}`);
console.log(`Missing requirements: ${audit.federation.missing_requirements.length}`);
console.log(`Warnings: ${audit.federation.warnings.length}`);
console.log(`Critical failures: ${audit.federation.critical_failures.length}`);
console.log(`Summary status: ${audit.summary.status}`);
console.log(`Ready for federation: ${audit.summary.ready_for_federation}`);
