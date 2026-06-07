import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ReplayBaseline } from "../../core/audit/replayBaseline";
import type { ReplayDiff } from "../../core/audit/replayDiff";
import {
  buildFederationReadinessAudit,
  validateFederationReadinessAudit,
  type FederationReadinessReplayInput
} from "../../core/audit/federationReadinessAudit";

type ReplayBaselineLike = ReplayBaseline & {
  schema_version?: unknown;
  baseline_id?: unknown;
};

type ReplayDiffLike = ReplayDiff & {
  schema_version?: unknown;
  diff_id?: unknown;
};

function readJsonFile<T>(filePath: string): T {
  const absolutePath = resolve(process.cwd(), filePath);

  if (!existsSync(absolutePath)) {
    throw new Error(`Input artifact not found: ${absolutePath}`);
  }

  return JSON.parse(readFileSync(absolutePath, "utf8")) as T;
}

function parseReplayInput(args: string[]): FederationReadinessReplayInput | undefined {
  if (args.length === 0) {
    return undefined;
  }

  if (args.length !== 2) {
    throw new Error(
      "Federation readiness replay input requires both replay baseline and replay diff paths."
    );
  }

  const [baselinePath, diffPath] = args;

  const baseline = readJsonFile<ReplayBaselineLike>(baselinePath);
  const diff = readJsonFile<ReplayDiffLike>(diffPath);

  if (baseline.schema_version !== "replay-baseline.v1") {
    throw new Error("Invalid replay baseline: expected schema_version replay-baseline.v1.");
  }

  if (diff.schema_version !== "replay-diff.v1") {
    throw new Error("Invalid replay diff: expected schema_version replay-diff.v1.");
  }

  if (typeof baseline.baseline_id !== "string" || baseline.baseline_id.length === 0) {
    throw new Error("Invalid replay baseline: missing baseline_id string.");
  }

  if (typeof diff.diff_id !== "string" || diff.diff_id.length === 0) {
    throw new Error("Invalid replay diff: missing diff_id string.");
  }

  return {
    baseline,
    diff,
    baseline_path: resolve(process.cwd(), baselinePath),
    diff_path: resolve(process.cwd(), diffPath)
  };
}

const replayInput = parseReplayInput(process.argv.slice(2));

const audit = buildFederationReadinessAudit({
  replay: replayInput
});

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