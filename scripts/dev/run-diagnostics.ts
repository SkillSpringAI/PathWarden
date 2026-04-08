import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { validateAction } from "../../core/kernel/validator";
import { buildRefusal } from "../../core/kernel/refusal";
import { getSchemaValidator } from "../../core/common/schemaValidator";
import { writeAuditEvent } from "../../core/audit/auditWriter";
import { writeJournalEntry } from "../../core/journal/journalWriter";
import { executeCopy } from "../../capabilities/filesystem/fsCopy";
import { executeRename } from "../../capabilities/filesystem/fsRename";
import { ensureCleanDir, seedTextFile } from "../../core/common/diagHelpers";
import { makeId } from "../../core/common/ids";
import { nowIso } from "../../core/common/time";
import type { DiagnosticReport, DiagnosticResult } from "../../core/common/diagnosticTypes";

function makeResult(
  id: string,
  name: string,
  severity: "fatal" | "warn" | "info",
  status: "pass" | "fail" | "warn",
  detail: string
): DiagnosticResult {
  return { id, name, severity, status, detail };
}

const results: DiagnosticResult[] = [];

const projectRoot = resolve(process.cwd(), "Pathwarden");
const requiredPaths = [
  "Pathwarden/policy/invariants/invariants.json",
  "Pathwarden/policy/refusals/refusal-codes.json",
  "Pathwarden/policy/risk/risk-rules.json",
  "Pathwarden/schemas/action/action.schema.json",
  "Pathwarden/schemas/plan/plan.schema.json",
  "Pathwarden/schemas/commit/commit.schema.json",
  "Pathwarden/schemas/refusal/refusal.schema.json"
];

const missing = requiredPaths.filter(p => !existsSync(resolve(process.cwd(), p)));
if (missing.length > 0) {
  results.push(makeResult("DIAG-001", "Folder Structure Check", "fatal", "fail", `Missing required paths: ${missing.join(", ")}`));
} else {
  results.push(makeResult("DIAG-001", "Folder Structure Check", "fatal", "pass", "All required paths are present"));
}

try {
  JSON.parse(readFileSync(resolve(process.cwd(), "Pathwarden/policy/invariants/invariants.json"), "utf8"));
  JSON.parse(readFileSync(resolve(process.cwd(), "Pathwarden/policy/refusals/refusal-codes.json"), "utf8"));
  JSON.parse(readFileSync(resolve(process.cwd(), "Pathwarden/policy/risk/risk-rules.json"), "utf8"));
  results.push(makeResult("DIAG-002", "Policy File Load Check", "fatal", "pass", "Policy files loaded successfully"));
} catch (error) {
  results.push(makeResult("DIAG-002", "Policy File Load Check", "fatal", "fail", `Policy load failed: ${String(error)}`));
}

try {
  JSON.parse(readFileSync(resolve(process.cwd(), "Pathwarden/schemas/action/action.schema.json"), "utf8"));
  JSON.parse(readFileSync(resolve(process.cwd(), "Pathwarden/schemas/plan/plan.schema.json"), "utf8"));
  JSON.parse(readFileSync(resolve(process.cwd(), "Pathwarden/schemas/commit/commit.schema.json"), "utf8"));
  JSON.parse(readFileSync(resolve(process.cwd(), "Pathwarden/schemas/refusal/refusal.schema.json"), "utf8"));
  results.push(makeResult("DIAG-003", "Schema File Load Check", "fatal", "pass", "Schema files loaded successfully"));
} catch (error) {
  results.push(makeResult("DIAG-003", "Schema File Load Check", "fatal", "fail", `Schema load failed: ${String(error)}`));
}

try {
  getSchemaValidator("schemas/action/action.schema.json");
  getSchemaValidator("schemas/plan/plan.schema.json");
  getSchemaValidator("schemas/commit/commit.schema.json");
  getSchemaValidator("schemas/refusal/refusal.schema.json");
  results.push(makeResult("DIAG-004", "Ajv Compile Check", "fatal", "pass", "Schemas compiled successfully"));
} catch (error) {
  results.push(makeResult("DIAG-004", "Ajv Compile Check", "fatal", "fail", `Ajv schema compile failed: ${String(error)}`));
}

try {
  const refusal = buildRefusal("REFUSE_TEST", "PW-SCHEMA-001", "Test refusal", "INV-004", ["schema_invalid"]);
  if (refusal.ok === false && refusal.refusal_code === "PW-SCHEMA-001") {
    results.push(makeResult("DIAG-005", "Refusal Construction Check", "fatal", "pass", "Canonical refusal creation works"));
  } else {
    results.push(makeResult("DIAG-005", "Refusal Construction Check", "fatal", "fail", "Refusal structure invalid"));
  }
} catch (error) {
  results.push(makeResult("DIAG-005", "Refusal Construction Check", "fatal", "fail", `Refusal construction failed: ${String(error)}`));
}

try {
  const result = validateAction("core", {
    type: "filesystem",
    operation: "move",
    selector: { path: "Pathwarden/temp/source/file.txt" },
    destination: { path: "Pathwarden/temp/archive/file.txt" }
  }, false);

  if (!result.ok && result.refusal_code === "PW-CONFIRM-001") {
    results.push(makeResult("DIAG-006", "Validator Refusal Path Check", "fatal", "pass", "Validator returned governed refusal as expected"));
  } else {
    results.push(makeResult("DIAG-006", "Validator Refusal Path Check", "fatal", "fail", "Validator did not return expected governed refusal"));
  }
} catch (error) {
  results.push(makeResult("DIAG-006", "Validator Refusal Path Check", "fatal", "fail", `Validator refusal-path check failed: ${String(error)}`));
}

try {
  const result = validateAction("core", {
    type: "filesystem",
    operation: "copy",
    selector: { path: "Pathwarden/temp/source/file.txt" },
    destination: { path: "Pathwarden/temp/archive/file-copy.txt" }
  }, true);

  if (result.ok && result.decision_code === "ALLOW_FILESYSTEM_COPY") {
    results.push(makeResult("DIAG-007", "Validator Allow Path Check", "fatal", "pass", "Validator returned governed allow decision"));
  } else {
    results.push(makeResult("DIAG-007", "Validator Allow Path Check", "fatal", "fail", "Validator did not return expected allow decision"));
  }
} catch (error) {
  results.push(makeResult("DIAG-007", "Validator Allow Path Check", "fatal", "fail", `Validator allow-path check failed: ${String(error)}`));
}

try {
  const result = validateAction("core", {
    type: "filesystem",
    operation: "delete",
    selector: { path: "C:/Windows/System32/test.txt" }
  }, true);

  if (!result.ok && result.refusal_code === "PW-PATH-001") {
    results.push(makeResult("DIAG-008", "Protected Path Detection Check", "fatal", "pass", "Protected path refusal triggered correctly"));
  } else {
    results.push(makeResult("DIAG-008", "Protected Path Detection Check", "fatal", "fail", "Protected path detection did not fire correctly"));
  }
} catch (error) {
  results.push(makeResult("DIAG-008", "Protected Path Detection Check", "fatal", "fail", `Protected path check failed: ${String(error)}`));
}

try {
  const timestamp = nowIso();
  writeAuditEvent({
    event_id: makeId("audit"),
    timestamp,
    mode: "core",
    decision_code: "DIAG_AUDIT_WRITE_TEST",
    outcome: "allowed",
    trigger_hits: ["diag_test"],
    message: "Audit write test"
  });
  results.push(makeResult("DIAG-009", "Audit Write Check", "fatal", "pass", "Audit write succeeded"));
} catch (error) {
  results.push(makeResult("DIAG-009", "Audit Write Check", "fatal", "fail", `Audit write failed: ${String(error)}`));
}

try {
  const timestamp = nowIso();
  writeJournalEntry({
    entry_id: makeId("journal"),
    timestamp,
    operation: "diag_test"
  });
  results.push(makeResult("DIAG-010", "Journal Write Check", "fatal", "pass", "Journal write succeeded"));
} catch (error) {
  results.push(makeResult("DIAG-010", "Journal Write Check", "fatal", "fail", `Journal write failed: ${String(error)}`));
}

try {
  const sourceDir = resolve(projectRoot, "temp", "diag", "source");
  const targetDir = resolve(projectRoot, "temp", "diag", "target");
  ensureCleanDir(sourceDir);
  ensureCleanDir(targetDir);

  const sourceFile = resolve(sourceDir, "copy-source.txt");
  const targetFile = resolve(targetDir, "copy-target.txt");

  seedTextFile(sourceFile, "copy test");

  executeCopy(sourceFile, targetFile);

  if (existsSync(targetFile)) {
    results.push(makeResult("DIAG-011", "Copy Sandbox Check", "fatal", "pass", "Copy executed successfully in sandbox"));
  } else {
    results.push(makeResult("DIAG-011", "Copy Sandbox Check", "fatal", "fail", "Copy did not create target file"));
  }
} catch (error) {
  results.push(makeResult("DIAG-011", "Copy Sandbox Check", "fatal", "fail", `Copy sandbox check failed: ${String(error)}`));
}

try {
  const sourceDir = resolve(projectRoot, "temp", "diag", "rename");
  ensureCleanDir(sourceDir);

  const sourceFile = resolve(sourceDir, "rename-source.txt");
  const targetFile = resolve(sourceDir, "rename-target.txt");

  seedTextFile(sourceFile, "rename test");

  executeRename(sourceFile, targetFile);

  if (!existsSync(sourceFile) && existsSync(targetFile)) {
    results.push(makeResult("DIAG-012", "Rename Sandbox Check", "fatal", "pass", "Rename executed successfully in sandbox"));
  } else {
    results.push(makeResult("DIAG-012", "Rename Sandbox Check", "fatal", "fail", "Rename did not produce expected file state"));
  }
} catch (error) {
  results.push(makeResult("DIAG-012", "Rename Sandbox Check", "fatal", "fail", `Rename sandbox check failed: ${String(error)}`));
}

try {
  const diagRoot = resolve(projectRoot, "temp", "diag");
  if (existsSync(diagRoot)) {
    rmSync(diagRoot, { recursive: true, force: true });
  }
  results.push(makeResult("DIAG-013", "Sandbox Cleanup Check", "warn", "pass", "Sandbox cleanup completed"));
} catch (error) {
  results.push(makeResult("DIAG-013", "Sandbox Cleanup Check", "warn", "warn", `Sandbox cleanup had issues: ${String(error)}`));
}

const fatalFail = results.some(r => r.severity === "fatal" && r.status === "fail");
const warnOnly = !fatalFail && results.some(r => r.status === "warn");

const report: DiagnosticReport = {
  run_id: `diag_${Date.now()}`,
  timestamp: nowIso(),
  overall_status: fatalFail ? "fail" : warnOnly ? "warn" : "pass",
  results
};

const reportsDir = resolve(process.cwd(), "Pathwarden", "diagnostics", "reports");
if (!existsSync(reportsDir)) {
  mkdirSync(reportsDir, { recursive: true });
}

const outPath = resolve(reportsDir, `diagnostic-report-${report.timestamp.replace(/[:.]/g, "-")}.json`);
writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify(report, null, 2));
console.log(`Report written to: ${outPath}`);
