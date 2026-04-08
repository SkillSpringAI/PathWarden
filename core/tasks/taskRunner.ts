import { nowIso } from "../common/time";
import { validatePlan } from "../kernel/planValidator";
import { executeCommittedPlan } from "../executor/commitExecutor";
import { auditTaskEvent } from "./taskAudit";
import { archiveTaskResult, updateTask } from "./taskStore";
import { acquireTaskLock, releaseTaskLock } from "./taskLockManager";
import { transitionTaskStatus } from "./taskLifecycle";
import type { PathwardenTask, TaskResult } from "./taskTypes";

export function runTask(task: PathwardenTask): TaskResult {
  if (task.status === "cancelled") {
    return {
      task_id: task.task_id,
      status: "cancelled",
      timestamp: nowIso(),
      message: "Task is cancelled"
    };
  }

  if (task.requires_confirmation && !task.approved) {
    const auditRef = auditTaskEvent(
      task,
      "refused",
      "Task requires approval before execution",
      "TASK_APPROVAL_REQUIRED",
      "PW-CONFIRM-001"
    );

    transitionTaskStatus(task, "refused");

    const result: TaskResult = {
      task_id: task.task_id,
      status: "refused",
      timestamp: nowIso(),
      message: "Task requires approval before execution",
      audit_refs: [auditRef]
    };

    archiveTaskResult(task, result);
    return result;
  }

  const lockAttempt = acquireTaskLock(task.task_id);
  if (!lockAttempt.ok) {
    const auditRef = auditTaskEvent(
      task,
      "refused",
      lockAttempt.reason,
      "TASK_LOCKED",
      "PW-AUDIT-001"
    );

    return {
      task_id: task.task_id,
      status: "refused",
      timestamp: nowIso(),
      message: lockAttempt.reason,
      audit_refs: [auditRef]
    };
  }

  transitionTaskStatus(task, "running");
  updateTask(task);

  try {
    if (task.type === "run_diagnostics") {
      const auditRef = auditTaskEvent(task, "executed", "Diagnostics task recorded", "TASK_RUN_DIAGNOSTICS");
      transitionTaskStatus(task, "completed");

      const result: TaskResult = {
        task_id: task.task_id,
        status: "completed",
        timestamp: nowIso(),
        message: "Diagnostics task completed",
        audit_refs: [auditRef]
      };

      archiveTaskResult(task, result);
      return result;
    }

    if (task.type === "export_audit") {
      const auditRef = auditTaskEvent(task, "executed", "Audit export task recorded", "TASK_EXPORT_AUDIT");
      transitionTaskStatus(task, "completed");

      const result: TaskResult = {
        task_id: task.task_id,
        status: "completed",
        timestamp: nowIso(),
        message: "Audit export task completed",
        audit_refs: [auditRef]
      };

      archiveTaskResult(task, result);
      return result;
    }

    if (task.type === "validate_plan") {
      const plan = task.payload?.plan;
      if (!plan) {
        const auditRef = auditTaskEvent(task, "refused", "Task missing plan payload", "TASK_VALIDATE_PLAN_REFUSED", "PW-PLAN-001");
        transitionTaskStatus(task, "refused");

        const result: TaskResult = {
          task_id: task.task_id,
          status: "refused",
          timestamp: nowIso(),
          message: "Task missing plan payload",
          audit_refs: [auditRef]
        };

        archiveTaskResult(task, result);
        return result;
      }

      const validation = validatePlan(task.mode, plan);
      if (!validation.ok) {
        const auditRef = auditTaskEvent(
          task,
          "refused",
          validation.refusal.message,
          validation.refusal.decision_code,
          validation.refusal.refusal_code
        );

        transitionTaskStatus(task, "refused");

        const result: TaskResult = {
          task_id: task.task_id,
          status: "refused",
          timestamp: nowIso(),
          message: validation.refusal.message,
          audit_refs: [auditRef]
        };

        archiveTaskResult(task, result);
        return result;
      }

      const auditRef = auditTaskEvent(task, "allowed", "Plan validated successfully", "TASK_VALIDATE_PLAN_ALLOWED");
      transitionTaskStatus(task, "completed");

      const result: TaskResult = {
        task_id: task.task_id,
        status: "completed",
        timestamp: nowIso(),
        message: "Plan validated successfully",
        audit_refs: [auditRef]
      };

      archiveTaskResult(task, result);
      return result;
    }

    if (task.type === "execute_plan") {
      const plan = task.payload?.plan;
      const commit = task.payload?.commit;

      if (!plan || !commit) {
        const auditRef = auditTaskEvent(task, "refused", "Task missing plan or commit payload", "TASK_EXECUTE_PLAN_REFUSED", "PW-PLAN-001");
        transitionTaskStatus(task, "refused");

        const result: TaskResult = {
          task_id: task.task_id,
          status: "refused",
          timestamp: nowIso(),
          message: "Task missing plan or commit payload",
          audit_refs: [auditRef]
        };

        archiveTaskResult(task, result);
        return result;
      }

      const execution = executeCommittedPlan(task.mode, plan, commit);
      const auditRef = auditTaskEvent(
        task,
        execution.ok ? "executed" : "failed",
        execution.message,
        execution.decision_code,
        execution.ok ? undefined : execution.refusal_code
      );

      transitionTaskStatus(task, execution.ok ? "completed" : "failed");

      const result: TaskResult = {
        task_id: task.task_id,
        status: execution.ok ? "completed" : "failed",
        timestamp: nowIso(),
        message: execution.message,
        audit_refs: [auditRef]
      };

      archiveTaskResult(task, result);
      return result;
    }

    const auditRef = auditTaskEvent(task, "refused", `Unsupported task type: ${task.type}`, "TASK_UNSUPPORTED", "PW-MODE-001");
    transitionTaskStatus(task, "refused");

    const result: TaskResult = {
      task_id: task.task_id,
      status: "refused",
      timestamp: nowIso(),
      message: `Unsupported task type: ${task.type}`,
      audit_refs: [auditRef]
    };

    archiveTaskResult(task, result);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const auditRef = auditTaskEvent(task, "failed", message, "TASK_RUN_FAILED", "PW-AUDIT-001");
    transitionTaskStatus(task, "failed");

    const result: TaskResult = {
      task_id: task.task_id,
      status: "failed",
      timestamp: nowIso(),
      message,
      audit_refs: [auditRef]
    };

    archiveTaskResult(task, result);
    return result;
  } finally {
    releaseTaskLock(task.task_id);
  }
}
