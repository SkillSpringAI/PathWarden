import { spawnSync } from "node:child_process";

const command = process.argv[2];

if (!command) {
  console.log([
    "",
    "Pathwarden Dashboard",
    "Commands:",
    "  startup                    Run startup workflow",
    "  startup-state              View last startup run state",
    "  diagnostics                Run diagnostics",
    "  diagnostics-latest         View latest diagnostics report",
    "  audit                      View raw audit events",
    "  audit-recent               View recent audit summary",
    "  export-audit               Export audit summary JSON",
    "  export-audit-report        Export human-readable audit report",
    "  audit-report-latest        View latest human-readable audit report",
    "  task-warnings              View task warnings",
    "  create-task                Create a queued task",
    "  create-recurring-task      Create a recurring scheduled task",
    "  create-task-draft          Create a task draft from natural language",
    "  view-task-drafts           View task drafts as JSON",
    "  view-task-draft            View one task draft as JSON",
    "  task-draft-summary         View task drafts as readable summary",
    "  task-draft-summary-one     View one task draft as readable summary",
    "  edit-task-draft            Edit a task draft field",
    "  convert-task-draft         Convert a draft into a queued task",
    "  view-tasks                 View queued tasks as JSON",
    "  view-task                  View one queued task as JSON",
    "  task-summary               View queued tasks as readable summary",
    "  task-summary-one           View one queued task as readable summary",
    "  edit-task                  Edit a queued task field",
    "  approve-task               Approve a task by task id",
    "  cancel-task                Cancel a task by task id",
    "  run-task                   Run a queued task by task id",
    "  run-due-tasks              Run due auto-runnable scheduled tasks",
    "  task-history               View completed task history",
    "  task-run-state             View recurrence run state for one task",
    "  recurrence-summary         View recurrence run summary",
    "  reset-task-run-state       Reset recurrence run state for one task",
    "  view-task-lock             View task lock for one task",
    "  lock-summary               View active task locks",
    "  reset-task-lock            Reset task lock for one task",
    "  view-global-lock           View a global runner lock",
    "  reset-global-lock          Reset a global runner lock",
    "  test-validator             Run validator test",
    "  test-plan                  Run plan validator test",
    "  test-commit                Run commit validator test",
    "  test-execution             Run end-to-end execution test",
    ""
  ].join("\n"));
  process.exit(0);
}

const mapping: Record<string, string> = {
  startup: ".\\Pathwarden\\scripts\\dev\\run-startup.ts",
  "startup-state": ".\\Pathwarden\\scripts\\dev\\view-startup-state.ts",
  diagnostics: ".\\Pathwarden\\scripts\\dev\\run-diagnostics.ts",
  "diagnostics-latest": ".\\Pathwarden\\scripts\\dev\\view-latest-diagnostics.ts",
  audit: ".\\Pathwarden\\scripts\\dev\\view-audit.ts",
  "audit-recent": ".\\Pathwarden\\scripts\\dev\\view-recent-audit.ts",
  "export-audit": ".\\Pathwarden\\scripts\\dev\\export-audit-summary.ts",
  "export-audit-report": ".\\Pathwarden\\scripts\\dev\\export-audit-report.ts",
  "audit-report-latest": ".\\Pathwarden\\scripts\\dev\\view-latest-audit-report.ts",
  "task-warnings": ".\\Pathwarden\\scripts\\dev\\check-task-warnings.ts",
  "create-task": ".\\Pathwarden\\scripts\\dev\\create-task.ts",
  "create-recurring-task": ".\\Pathwarden\\scripts\\dev\\create-recurring-task.ts",
  "create-task-draft": ".\\Pathwarden\\scripts\\dev\\create-task-draft.ts",
  "view-task-drafts": ".\\Pathwarden\\scripts\\dev\\view-task-drafts.ts",
  "view-task-draft": ".\\Pathwarden\\scripts\\dev\\view-task-draft.ts",
  "task-draft-summary": ".\\Pathwarden\\scripts\\dev\\view-task-draft-summary.ts",
  "task-draft-summary-one": ".\\Pathwarden\\scripts\\dev\\view-task-draft-summary-one.ts",
  "edit-task-draft": ".\\Pathwarden\\scripts\\dev\\edit-task-draft.ts",
  "convert-task-draft": ".\\Pathwarden\\scripts\\dev\\convert-task-draft.ts",
  "view-tasks": ".\\Pathwarden\\scripts\\dev\\view-tasks.ts",
  "view-task": ".\\Pathwarden\\scripts\\dev\\view-task.ts",
  "task-summary": ".\\Pathwarden\\scripts\\dev\\view-task-summary.ts",
  "task-summary-one": ".\\Pathwarden\\scripts\\dev\\view-task-summary-one.ts",
  "edit-task": ".\\Pathwarden\\scripts\\dev\\edit-task.ts",
  "approve-task": ".\\Pathwarden\\scripts\\dev\\approve-task.ts",
  "cancel-task": ".\\Pathwarden\\scripts\\dev\\cancel-task.ts",
  "run-task": ".\\Pathwarden\\scripts\\dev\\run-task.ts",
  "run-due-tasks": ".\\Pathwarden\\scripts\\dev\\run-due-tasks.ts",
  "task-history": ".\\Pathwarden\\scripts\\dev\\view-task-history.ts",
  "task-run-state": ".\\Pathwarden\\scripts\\dev\\view-task-run-state.ts",
  "recurrence-summary": ".\\Pathwarden\\scripts\\dev\\view-recurrence-summary.ts",
  "reset-task-run-state": ".\\Pathwarden\\scripts\\dev\\reset-task-run-state.ts",
  "view-task-lock": ".\\Pathwarden\\scripts\\dev\\view-task-lock.ts",
  "lock-summary": ".\\Pathwarden\\scripts\\dev\\view-lock-summary.ts",
  "reset-task-lock": ".\\Pathwarden\\scripts\\dev\\reset-task-lock.ts",
  "view-global-lock": ".\\Pathwarden\\scripts\\dev\\view-global-lock.ts",
  "reset-global-lock": ".\\Pathwarden\\scripts\\dev\\reset-global-lock.ts",
  "test-validator": ".\\Pathwarden\\scripts\\dev\\test-validator.ts",
  "test-plan": ".\\Pathwarden\\scripts\\dev\\test-plan-validator.ts",
  "test-commit": ".\\Pathwarden\\scripts\\dev\\test-commit-validator.ts",
  "test-execution": ".\\Pathwarden\\scripts\\dev\\test-execution.ts"
};

const target = mapping[command];

if (!target) {
  console.log(`Unknown command: ${command}`);
  process.exit(1);
}

const extraArgs = process.argv.slice(3);

const result = spawnSync("node", [".\\node_modules\\tsx\\dist\\cli.mjs", target, ...extraArgs], {
  stdio: "inherit",
  shell: true
});

process.exit(result.status ?? 0);
