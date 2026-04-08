import { spawnSync } from "node:child_process";
import { loadConfigFile } from "../../core/common/configLoader";
import { writeAuditEvent } from "../../core/audit/auditWriter";
import { makeId } from "../../core/common/ids";
import { nowIso } from "../../core/common/time";
import { saveStartupState } from "../../core/tasks/startupState";
import { acquireGlobalLock, releaseGlobalLock } from "../../core/common/globalLock";

type StartupConfig = {
  version: string;
  run_diagnostics_on_startup: boolean;
  show_pending_task_summary_on_startup: boolean;
  show_high_risk_task_warnings_on_startup: boolean;
  run_due_auto_tasks_on_startup: boolean;
  write_startup_audit_event: boolean;
};

const lockAttempt = acquireGlobalLock("startup-workflow");

if (!lockAttempt.ok) {
  console.log(lockAttempt.reason);
  process.exit(1);
}

try {
  const config = loadConfigFile<StartupConfig>("config/startup.json");

  function runTsxScript(relativePath: string): void {
    spawnSync("node", [".\\node_modules\\tsx\\dist\\cli.mjs", relativePath], {
      stdio: "inherit",
      shell: true
    });
  }

  console.log("Pathwarden Startup Workflow");
  console.log("");

  if (config.write_startup_audit_event) {
    writeAuditEvent({
      event_id: makeId("audit"),
      timestamp: nowIso(),
      mode: "core",
      decision_code: "STARTUP_WORKFLOW_BEGIN",
      outcome: "allowed",
      trigger_hits: ["startup"],
      message: "Startup workflow began"
    });
  }

  if (config.run_diagnostics_on_startup) {
    console.log("Running diagnostics...");
    runTsxScript(".\\Pathwarden\\scripts\\dev\\run-diagnostics.ts");
    console.log("");
  }

  if (config.show_pending_task_summary_on_startup) {
    console.log("Showing task summary...");
    runTsxScript(".\\Pathwarden\\scripts\\dev\\view-task-summary.ts");
    console.log("");
  }

  if (config.show_high_risk_task_warnings_on_startup) {
    console.log("Checking task warnings...");
    runTsxScript(".\\Pathwarden\\scripts\\dev\\check-task-warnings.ts");
    console.log("");
  }

  if (config.run_due_auto_tasks_on_startup) {
    console.log("Running due auto-tasks...");
    runTsxScript(".\\Pathwarden\\scripts\\dev\\run-due-tasks.ts");
    console.log("");
  }

  saveStartupState();

  if (config.write_startup_audit_event) {
    writeAuditEvent({
      event_id: makeId("audit"),
      timestamp: nowIso(),
      mode: "core",
      decision_code: "STARTUP_WORKFLOW_COMPLETE",
      outcome: "executed",
      trigger_hits: ["startup"],
      message: "Startup workflow completed"
    });
  }

  console.log("Startup workflow complete.");
} finally {
  releaseGlobalLock("startup-workflow");
}
