import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type CommandResult = {
  status: number | null;
  stdout: string;
  stderr: string;
};

function runNpmScript(script: string, args: string[] = []): CommandResult {
  const result = spawnSync(
    "npm",
    ["run", script, "--", ...args],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      shell: process.platform === "win32"
    }
  );

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

function fail(message: string, result?: CommandResult): never {
  console.error(message);

  if (result) {
    console.error(`status: ${result.status}`);
    console.error(`stdout: ${result.stdout.trim()}`);
    console.error(`stderr: ${result.stderr.trim()}`);
  }

  process.exit(1);
}

function extractPath(output: string, prefix: string): string {
  const line = output
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(prefix));

  if (!line) {
    fail(`Could not find output line starting with: ${prefix}`);
  }

  const filePath = line.slice(prefix.length).trim();

  if (!existsSync(filePath)) {
    fail(`Expected exported file to exist: ${filePath}`);
  }

  return filePath;
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

const baselinePath = resolve(
  process.cwd(),
  "tests/fixtures/replay-inputs/replay-baseline.valid.json"
);

const diffPath = resolve(
  process.cwd(),
  "tests/fixtures/replay-inputs/replay-diff.valid.json"
);

const invalidBaselinePath = resolve(
  process.cwd(),
  "tests/fixtures/replay-inputs/replay-baseline.invalid-schema.json"
);

const governanceResult = runNpmScript("export:governance-report", [
  baselinePath,
  diffPath
]);

if (governanceResult.status !== 0) {
  fail("Governance report export with replay inputs should pass.", governanceResult);
}

const governancePath = extractPath(
  governanceResult.stdout,
  "Governance report written to:"
);

const governanceReport = readJson<{
  replay?: {
    baseline_id?: unknown;
    diff_id?: unknown;
    status?: unknown;
  };
}>(governancePath);

if (governanceReport.replay?.baseline_id !== "replaybase_fixture_valid") {
  fail("Governance report did not include expected replay baseline id.", governanceResult);
}

if (governanceReport.replay?.diff_id !== "replaydiff_fixture_valid") {
  fail("Governance report did not include expected replay diff id.", governanceResult);
}

if (governanceReport.replay?.status !== "verified") {
  fail("Governance report replay status should be verified with valid replay inputs.", governanceResult);
}

const federationResult = runNpmScript("export:federation-readiness-audit", [
  baselinePath,
  diffPath
]);

if (federationResult.status !== 0) {
  fail("Federation readiness audit export with replay inputs should pass.", federationResult);
}

const federationPath = extractPath(
  federationResult.stdout,
  "Federation readiness audit written to:"
);

const federationAudit = readJson<{
  replay_provenance?: {
    status?: unknown;
    admissible?: unknown;
    lineage_complete?: unknown;
  };
  federation?: {
    ready?: unknown;
  };
  summary?: {
    ready_for_federation?: unknown;
  };
}>(federationPath);

if (federationAudit.replay_provenance?.lineage_complete !== true) {
  fail("Federation readiness audit should show complete replay lineage with valid replay inputs.", federationResult);
}

if (federationAudit.replay_provenance?.admissible !== true) {
  fail("Federation readiness audit should show admissible replay provenance with valid replay inputs.", federationResult);
}

if (federationAudit.federation?.ready !== false) {
  fail("Federation should remain not ready because runtime federation is intentionally not implemented.", federationResult);
}

if (federationAudit.summary?.ready_for_federation !== false) {
  fail("Summary ready_for_federation should remain false.", federationResult);
}

const oneArgGovernanceResult = runNpmScript("export:governance-report", [
  baselinePath
]);

if (oneArgGovernanceResult.status === 0) {
  fail("Governance report export with one replay input should fail closed.", oneArgGovernanceResult);
}

const badSchemaGovernanceResult = runNpmScript("export:governance-report", [
  invalidBaselinePath,
  diffPath
]);

if (badSchemaGovernanceResult.status === 0) {
  fail("Governance report export with invalid baseline schema should fail closed.", badSchemaGovernanceResult);
}

const oneArgFederationResult = runNpmScript("export:federation-readiness-audit", [
  baselinePath
]);

if (oneArgFederationResult.status === 0) {
  fail("Federation readiness export with one replay input should fail closed.", oneArgFederationResult);
}

const badSchemaFederationResult = runNpmScript("export:federation-readiness-audit", [
  invalidBaselinePath,
  diffPath
]);

if (badSchemaFederationResult.status === 0) {
  fail("Federation readiness export with invalid baseline schema should fail closed.", badSchemaFederationResult);
}

console.log(JSON.stringify({
  ok: true,
  diagnostic: "report-input-support-fixtures",
  governance_input_supported: true,
  federation_input_supported: true,
  fail_closed_one_arg: true,
  fail_closed_bad_schema: true
}, null, 2));