import { validateCommit } from "../kernel/commitValidator";
import type { PathwardenAction, PathwardenCommit, PathwardenMode, PathwardenPlan } from "../kernel/types";
import type { ExecutionResult } from "./executionTypes";
import { executeMove } from "../../capabilities/filesystem/fsMove";
import { executeDelete } from "../../capabilities/filesystem/fsDelete";
import { executeCopy } from "../../capabilities/filesystem/fsCopy";
import { executeRename } from "../../capabilities/filesystem/fsRename";
import { writeAuditEvent } from "../audit/auditWriter";
import { writeJournalEntry } from "../journal/journalWriter";
import { makeId } from "../common/ids";
import { nowIso } from "../common/time";
import { resolveRisk } from "../kernel/risk";

export function executeCommittedPlan(
  mode: PathwardenMode,
  plan: PathwardenPlan,
  commitInput: unknown
): ExecutionResult {
  const commitCheck = validateCommit(commitInput);
  if (!commitCheck.ok) {
    writeAuditEvent({
      event_id: makeId("audit"),
      timestamp: nowIso(),
      mode,
      decision_code: commitCheck.refusal.decision_code,
      refusal_code: commitCheck.refusal.refusal_code,
      outcome: "refused",
      trigger_hits: commitCheck.refusal.trigger_hits,
      message: commitCheck.refusal.message,
      plan_id: plan.plan_id
    });

    return {
      ok: false,
      decision_code: commitCheck.refusal.decision_code,
      refusal_code: commitCheck.refusal.refusal_code,
      message: commitCheck.refusal.message,
      plan_id: plan.plan_id
    };
  }

  const commit = commitCheck.commit;

  if (commit.plan_id !== plan.plan_id) {
    writeAuditEvent({
      event_id: makeId("audit"),
      timestamp: nowIso(),
      mode,
      decision_code: "REFUSE_PLAN_COMMIT_MISMATCH",
      refusal_code: "PW-PLAN-001",
      outcome: "refused",
      trigger_hits: ["plan_commit_mismatch"],
      message: "Commit plan_id does not match plan",
      plan_id: plan.plan_id,
      commit_id: commit.commit_id
    });

    return {
      ok: false,
      decision_code: "REFUSE_PLAN_COMMIT_MISMATCH",
      refusal_code: "PW-PLAN-001",
      message: "Commit plan_id does not match plan",
      plan_id: plan.plan_id,
      commit_id: commit.commit_id
    };
  }

  for (const action of plan.actions) {
    const result = executeSingleAction(mode, plan, commit, action);
    if (!result.ok) {
      return result;
    }
  }

  return {
    ok: true,
    decision_code: "EXECUTE_PLAN_SUCCESS",
    message: "Committed plan executed successfully",
    plan_id: plan.plan_id,
    commit_id: commit.commit_id
  };
}

function executeSingleAction(
  mode: PathwardenMode,
  plan: PathwardenPlan,
  commit: PathwardenCommit,
  action: PathwardenAction
): ExecutionResult {
  const timestamp = nowIso();
  const riskLevel = resolveRisk(action);

  try {
    if (action.operation === "move") {
      const sourcePath = action.selector?.path ?? "";
      const destinationPath = action.destination?.path ?? "";
      executeMove(sourcePath, destinationPath);
      return successWithJournalAndAudit("move", "EXECUTE_FILESYSTEM_MOVE", mode, plan, commit, timestamp, riskLevel, sourcePath, destinationPath);
    }

    if (action.operation === "copy") {
      const sourcePath = action.selector?.path ?? "";
      const destinationPath = action.destination?.path ?? "";
      executeCopy(sourcePath, destinationPath);
      return successWithJournalAndAudit("copy", "EXECUTE_FILESYSTEM_COPY", mode, plan, commit, timestamp, riskLevel, sourcePath, destinationPath);
    }

    if (action.operation === "rename") {
      const sourcePath = action.selector?.path ?? "";
      const destinationPath = action.destination?.path ?? "";
      executeRename(sourcePath, destinationPath);
      return successWithJournalAndAudit("rename", "EXECUTE_FILESYSTEM_RENAME", mode, plan, commit, timestamp, riskLevel, sourcePath, destinationPath);
    }

    if (action.operation === "delete") {
      const targetPath = action.selector?.path ?? "";
      executeDelete(targetPath);
      return successWithJournalAndAudit("delete", "EXECUTE_FILESYSTEM_DELETE", mode, plan, commit, timestamp, riskLevel, targetPath);
    }

    writeAuditEvent({
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: "REFUSE_UNIMPLEMENTED_ACTION",
      refusal_code: "PW-MODE-001",
      outcome: "refused",
      trigger_hits: ["unimplemented_action"],
      risk_level: riskLevel,
      message: `Operation not implemented in phase 1: ${action.operation}`,
      plan_id: plan.plan_id,
      commit_id: commit.commit_id
    });

    return {
      ok: false,
      decision_code: "REFUSE_UNIMPLEMENTED_ACTION",
      refusal_code: "PW-MODE-001",
      message: `Operation not implemented in phase 1: ${action.operation}`,
      plan_id: plan.plan_id,
      commit_id: commit.commit_id
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    writeAuditEvent({
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: "EXECUTE_ACTION_FAILED",
      refusal_code: "PW-AUDIT-001",
      outcome: "failed",
      trigger_hits: ["execution_failure"],
      risk_level: riskLevel,
      message,
      plan_id: plan.plan_id,
      commit_id: commit.commit_id
    });

    return {
      ok: false,
      decision_code: "EXECUTE_ACTION_FAILED",
      refusal_code: "PW-AUDIT-001",
      message,
      plan_id: plan.plan_id,
      commit_id: commit.commit_id
    };
  }
}

function successWithJournalAndAudit(
  operation: string,
  decisionCode: string,
  mode: PathwardenMode,
  plan: PathwardenPlan,
  commit: PathwardenCommit,
  timestamp: string,
  riskLevel: ReturnType<typeof resolveRisk>,
  targetPath?: string,
  destinationPath?: string
): ExecutionResult {
  writeJournalEntry({
    entry_id: makeId("journal"),
    timestamp,
    operation,
    target_path: targetPath,
    destination_path: destinationPath,
    plan_id: plan.plan_id,
    commit_id: commit.commit_id
  });

  writeAuditEvent({
    event_id: makeId("audit"),
    timestamp,
    mode,
    decision_code: decisionCode,
    outcome: "executed",
    trigger_hits: ["mutation_requested"],
    risk_level: riskLevel,
    message: `${operation} executed successfully`,
    plan_id: plan.plan_id,
    commit_id: commit.commit_id
  });

  return {
    ok: true,
    decision_code: decisionCode,
    message: `${operation} executed successfully`,
    plan_id: plan.plan_id,
    commit_id: commit.commit_id
  };
}
