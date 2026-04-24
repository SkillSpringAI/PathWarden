import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { makeId } from "../../core/common/ids";
import { nowIso } from "../../core/common/time";
import { runTask } from "../../core/tasks/taskRunner";
import { approveTask, loadTask, saveTask } from "../../core/tasks/taskStore";
import type { PathwardenTask } from "../../core/tasks/taskTypes";
import type { PathwardenCommit, PathwardenPlan } from "../../core/kernel/types";

const userProfile = process.env.USERPROFILE ?? "C:\\Users\\Laptop";
const sandboxRoot = join(userProfile, "Documents", "PathWardenDiagSafeExec");
const inputDir = join(sandboxRoot, "in");
const outputDir = join(sandboxRoot, "out");
const sourcePath = join(inputDir, "sample.txt");
const destinationPath = join(outputDir, "sample.txt");
const expectedContent = "PathWarden safe execution diagnostic";

const queueDir = join(process.cwd(), "tasks", "queue");
const historyDir = join(process.cwd(), "tasks", "history");

function listJsonFiles(dir: string): Set<string> {
  if (!existsSync(dir)) return new Set();

  return new Set(
    readdirSync(dir)
      .filter(name => name.endsWith(".json"))
      .map(name => join(dir, name))
  );
}

const initialQueueFiles = listJsonFiles(queueDir);
const initialHistoryFiles = listJsonFiles(historyDir);

function resetSandbox(): void {
  rmSync(sandboxRoot, { recursive: true, force: true });
  mkdirSync(inputDir, { recursive: true });
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(sourcePath, expectedContent, "utf8");
}

function cleanupSandbox(): void {
  rmSync(sandboxRoot, { recursive: true, force: true });
}

function cleanupNewRuntimeFiles(): void {
  for (const file of listJsonFiles(queueDir)) {
    if (!initialQueueFiles.has(file)) {
      rmSync(file, { force: true });
    }
  }

  for (const file of listJsonFiles(historyDir)) {
    if (!initialHistoryFiles.has(file)) {
      rmSync(file, { force: true });
    }
  }
}

function buildTask(): PathwardenTask {
  const planId = makeId("plan");

  const plan: PathwardenPlan = {
    plan_id: planId,
    risk_level: "medium",
    requires_confirmation: true,
    actions: [
      {
        type: "filesystem",
        operation: "move",
        selector: {
          path: sourcePath
        },
        destination: {
          path: destinationPath
        }
      }
    ]
  };

  const commit: PathwardenCommit = {
    commit_id: makeId("commit"),
    plan_id: planId,
    confirmed: true
  };

  return {
    task_id: makeId("task"),
    name: "Diagnostic Safe Move Test",
    description: "Diagnostic proof for approval-gated execute_plan filesystem move.",
    type: "execute_plan",
    mode: "core",
    status: "pending",
    created_at: nowIso(),
    requires_confirmation: true,
    approved: false,
    auto_run: false,
    payload: {
      plan,
      commit
    }
  };
}

const results: Array<Record<string, unknown>> = [];

try {
  resetSandbox();

  const refusedTask = buildTask();
  saveTask(refusedTask);

  const refusedResult = runTask(refusedTask);
  const unapprovedRefused =
    refusedResult.status === "refused" &&
    refusedResult.message === "Task requires approval before execution" &&
    existsSync(sourcePath) &&
    !existsSync(destinationPath);

  results.push({
    step: "unapproved_run_refused",
    ok: unapprovedRefused,
    status: refusedResult.status,
    message: refusedResult.message
  });

  resetSandbox();

  const approvedTask = buildTask();
  saveTask(approvedTask);

  const approved = approveTask(approvedTask.task_id);
  const loadedApprovedTask = loadTask(approvedTask.task_id);

  if (!approved || !loadedApprovedTask) {
    results.push({
      step: "approval",
      ok: false,
      message: "Task could not be approved or loaded"
    });
  } else {
    const executionResult = runTask(loadedApprovedTask);
    const destinationExists = existsSync(destinationPath);
    const sourceGone = !existsSync(sourcePath);
    const contentPreserved =
      destinationExists &&
      readFileSync(destinationPath, "utf8") === expectedContent;

    results.push({
      step: "approved_run_executed",
      ok:
        executionResult.status === "completed" &&
        sourceGone &&
        destinationExists &&
        contentPreserved,
      status: executionResult.status,
      message: executionResult.message,
      sourceGone,
      destinationExists,
      contentPreserved
    });
  }

  const ok = results.every(result => result.ok === true);

  console.log(JSON.stringify({
    ok,
    type: "safe-execution-approval-flow-diagnostic",
    sandboxRoot,
    results
  }, null, 2));

  process.exitCode = ok ? 0 : 1;
} finally {
  cleanupSandbox();
  cleanupNewRuntimeFiles();
}