import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { makeId } from "../../core/common/ids";
import { nowIso } from "../../core/common/time";
import { approveTask, cancelTask, loadTask, saveTask } from "../../core/tasks/taskStore";
import type { PathwardenTask } from "../../core/tasks/taskTypes";

const queueDir = join(process.cwd(), "tasks", "queue");

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function listQueueFiles(): Set<string> {
  if (!existsSync(queueDir)) return new Set();

  return new Set(
    readdirSync(queueDir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => join(queueDir, name))
  );
}

function buildPlannedRequestTask(requestText: string): PathwardenTask {
  return {
    task_id: makeId("planned-request-test"),
    name: "Planned Request Approval Test",
    description: "Approval queue test task for planned user request.",
    type: "custom",
    mode: "core",
    status: "pending",
    created_at: nowIso(),
    requires_confirmation: true,
    approved: false,
    auto_run: false,
    payload: {
      notes: requestText
    }
  };
}

function cleanupCreatedFiles(initialFiles: Set<string>): void {
  for (const file of listQueueFiles()) {
    if (!initialFiles.has(file)) {
      rmSync(file, { force: true });
    }
  }
}

const initialFiles = listQueueFiles();

try {
  const approveCandidate = buildPlannedRequestTask("Find txt files in Documents");
  saveTask(approveCandidate);

  const loadedPending = loadTask(approveCandidate.task_id);

  if (!loadedPending) fail("Pending planned request task could not be loaded.");
  if (loadedPending.status !== "pending") fail(`Expected pending status, got ${loadedPending.status}.`);
  if (loadedPending.approved !== false) fail("New planned request task should not be approved.");
  if (loadedPending.requires_confirmation !== true) fail("New planned request task should require confirmation.");
  if (loadedPending.payload?.notes !== "Find txt files in Documents") {
    fail("Planned request notes were not preserved.");
  }

  const approved = approveTask(approveCandidate.task_id);

  if (!approved) fail("Approval returned null.");
  if (approved.approved !== true) fail("Approved task did not set approved=true.");
  if (approved.status !== "approved") fail(`Approved task status was ${approved.status}.`);

  const loadedApproved = loadTask(approveCandidate.task_id);

  if (!loadedApproved) fail("Approved task could not be reloaded.");
  if (loadedApproved.approved !== true) fail("Reloaded approved task did not preserve approved=true.");
  if (loadedApproved.status !== "approved") fail("Reloaded approved task did not preserve approved status.");

  const cancelCandidate = buildPlannedRequestTask("Summarize Documents");
  saveTask(cancelCandidate);

  const cancelled = cancelTask(cancelCandidate.task_id);

  if (!cancelled) fail("Cancel returned null.");
  if (cancelled.status !== "cancelled") fail(`Cancelled task status was ${cancelled.status}.`);

  const loadedCancelled = loadTask(cancelCandidate.task_id);

  if (!loadedCancelled) fail("Cancelled task could not be reloaded.");
  if (loadedCancelled.status !== "cancelled") fail("Reloaded cancelled task did not preserve cancelled status.");

  console.log(JSON.stringify({
    ok: true,
    type: "planned-request-approval-queue-test",
    message: "Planned request approval queue checks passed.",
    checked: {
      approvedTaskId: approveCandidate.task_id,
      cancelledTaskId: cancelCandidate.task_id
    }
  }, null, 2));
} finally {
  cleanupCreatedFiles(initialFiles);
}
