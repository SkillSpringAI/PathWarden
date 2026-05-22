import { validateCommit } from "../kernel/commitValidator";
import type { PathwardenAction, PathwardenCommit, PathwardenMode, PathwardenPlan } from "../kernel/types";
import type { ExecutionResult } from "./executionTypes";
import { executeMove } from "../../capabilities/filesystem/fsMove";
import { executeDelete } from "../../capabilities/filesystem/fsDelete";
import { executeCopy } from "../../capabilities/filesystem/fsCopy";
import { executeRename } from "../../capabilities/filesystem/fsRename";
import { writeAuditEvent } from "../audit/auditWriter";
import { writeJournalEntry } from "../journal/journalWriter";
import { assertPathsAllowed, AccessPolicyDeniedError } from "../../capabilities/filesystem/pathGuards";
import { makeId } from "../common/ids";
import { nowIso } from "../common/time";
import { resolveRisk } from "../kernel/risk";
import type { PermissionToken } from "../kernel/permissionToken";
import { validatePermissionTokenForAction } from "../kernel/permissionTokenValidator";
import { loadExecutionPolicy } from "../kernel/executionPolicy";
import { auditTriggerRegistryDrift } from "../kernel/triggerDriftAuditor";

function auditDrift(
  traceId: string,
  timestamp: string,
  mode: PathwardenMode,
  triggerHits: string[]
): void {
  auditTriggerRegistryDrift(traceId, timestamp, mode, triggerHits);
}

export function executeCommittedPlan(
  mode: PathwardenMode,
  plan: PathwardenPlan,
  commitInput: unknown,
  traceId?: string,
  permissionToken?: PermissionToken
): ExecutionResult {

  const executionTraceId = traceId ?? makeId("trace");
  const executionPolicy = loadExecutionPolicy();

  if (!permissionToken && executionPolicy.mandatory_permission_tokens) {
    const timestamp = nowIso();
    const triggerHits = ["permission_token_missing", "mandatory_permission_tokens"];

    auditDrift(executionTraceId, timestamp, mode, triggerHits);

    writeAuditEvent({
      trace_id: executionTraceId,
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: "REFUSE_PERMISSION_TOKEN_MISSING",
      refusal_code: "PW-TOKEN-001",
      outcome: "refused",
      trigger_hits: triggerHits,
      message: "Execution policy requires a permission token",
      plan_id: plan.plan_id
    });

    return {
      trace_id: executionTraceId,
      ok: false,
      decision_code: "REFUSE_PERMISSION_TOKEN_MISSING",
      refusal_code: "PW-TOKEN-001",
      message: "Execution policy requires a permission token",
      plan_id: plan.plan_id
    };
  }

  if (!permissionToken && !executionPolicy.allow_legacy_execution) {
    const timestamp = nowIso();
    const triggerHits = ["legacy_execution_disabled"];

    auditDrift(executionTraceId, timestamp, mode, triggerHits);

    writeAuditEvent({
      trace_id: executionTraceId,
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: "REFUSE_LEGACY_EXECUTION_DISABLED",
      refusal_code: "PW-TOKEN-001",
      outcome: "refused",
      trigger_hits: triggerHits,
      message: "Execution policy disables legacy execution without a permission token",
      plan_id: plan.plan_id
    });

    return {
      trace_id: executionTraceId,
      ok: false,
      decision_code: "REFUSE_LEGACY_EXECUTION_DISABLED",
      refusal_code: "PW-TOKEN-001",
      message: "Execution policy disables legacy execution without a permission token",
      plan_id: plan.plan_id
    };
  }

  const commitCheck = validateCommit(commitInput);

  if (!commitCheck.ok) {
    const timestamp = nowIso();

    auditDrift(executionTraceId, timestamp, mode, commitCheck.refusal.trigger_hits);

    writeAuditEvent({
      trace_id: executionTraceId,
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: commitCheck.refusal.decision_code,
      refusal_code: commitCheck.refusal.refusal_code,
      outcome: "refused",
      trigger_hits: commitCheck.refusal.trigger_hits,
      message: commitCheck.refusal.message,
      plan_id: plan.plan_id
    });

    return {
      trace_id: executionTraceId,
      ok: false,
      decision_code: commitCheck.refusal.decision_code,
      refusal_code: commitCheck.refusal.refusal_code,
      message: commitCheck.refusal.message,
      plan_id: plan.plan_id
    };
  }

  const commit = commitCheck.commit;

  if (commit.plan_id !== plan.plan_id) {
    const timestamp = nowIso();
    const triggerHits = ["plan_commit_mismatch"];

    auditDrift(executionTraceId, timestamp, mode, triggerHits);

    writeAuditEvent({
      trace_id: executionTraceId,
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: "REFUSE_PLAN_COMMIT_MISMATCH",
      refusal_code: "PW-PLAN-001",
      outcome: "refused",
      trigger_hits: triggerHits,
      message: "Commit plan_id does not match plan",
      plan_id: plan.plan_id,
      commit_id: commit.commit_id
    });

    return {
      trace_id: executionTraceId,
      ok: false,
      decision_code: "REFUSE_PLAN_COMMIT_MISMATCH",
      refusal_code: "PW-PLAN-001",
      message: "Commit plan_id does not match plan",
      plan_id: plan.plan_id,
      commit_id: commit.commit_id
    };
  }

  for (const action of plan.actions) {
    const result = executeSingleAction(
      mode,
      plan,
      commit,
      action,
      executionTraceId,
      permissionToken
    );

    if (!result.ok) {
      return result;
    }
  }

  return {
    trace_id: executionTraceId,
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
  action: PathwardenAction,
  traceId: string,
  permissionToken?: PermissionToken
): ExecutionResult {

  const timestamp = nowIso();
  const riskLevel = resolveRisk(action);

  if (permissionToken) {

    const tokenCheck = validatePermissionTokenForAction(
      permissionToken,
      action,
      traceId
    );

    if (!tokenCheck.ok) {

      auditDrift(traceId, timestamp, mode, tokenCheck.trigger_hits);

      writeAuditEvent({
        trace_id: traceId,
        event_id: makeId("audit"),
        timestamp,
        mode,
        decision_code: tokenCheck.decision_code,
        refusal_code: tokenCheck.refusal_code,
        outcome: "refused",
        trigger_hits: tokenCheck.trigger_hits,
        risk_level: riskLevel,
        message: tokenCheck.message,
        plan_id: plan.plan_id,
        commit_id: commit.commit_id
      });

      return {
        trace_id: traceId,
        ok: false,
        decision_code: tokenCheck.decision_code,
        refusal_code: tokenCheck.refusal_code,
        message: tokenCheck.message,
        plan_id: plan.plan_id,
        commit_id: commit.commit_id
      };
    }
  }

  try {

    if (action.operation === "move") {
      const sourcePath = action.selector?.path ?? "";
      const destinationPath = action.destination?.path ?? "";

      assertPathsAllowed([sourcePath, destinationPath]);

      executeMove(sourcePath, destinationPath);

      return successWithJournalAndAudit(
        "move",
        "EXECUTE_FILESYSTEM_MOVE",
        mode,
        plan,
        commit,
        timestamp,
        riskLevel,
        traceId,
        sourcePath,
        destinationPath
      );
    }

    if (action.operation === "copy") {
      const sourcePath = action.selector?.path ?? "";
      const destinationPath = action.destination?.path ?? "";

      assertPathsAllowed([sourcePath, destinationPath]);

      executeCopy(sourcePath, destinationPath);

      return successWithJournalAndAudit(
        "copy",
        "EXECUTE_FILESYSTEM_COPY",
        mode,
        plan,
        commit,
        timestamp,
        riskLevel,
        traceId,
        sourcePath,
        destinationPath
      );
    }

    if (action.operation === "rename") {
      const sourcePath = action.selector?.path ?? "";
      const destinationPath = action.destination?.path ?? "";

      assertPathsAllowed([sourcePath, destinationPath]);

      executeRename(sourcePath, destinationPath);

      return successWithJournalAndAudit(
        "rename",
        "EXECUTE_FILESYSTEM_RENAME",
        mode,
        plan,
        commit,
        timestamp,
        riskLevel,
        traceId,
        sourcePath,
        destinationPath
      );
    }

    if (action.operation === "delete") {
      const targetPath = action.selector?.path ?? "";

      assertPathsAllowed([targetPath]);

      executeDelete(targetPath);

      return successWithJournalAndAudit(
        "delete",
        "EXECUTE_FILESYSTEM_DELETE",
        mode,
        plan,
        commit,
        timestamp,
        riskLevel,
        traceId,
        targetPath
      );
    }

    const triggerHits = ["unimplemented_action"];

    auditDrift(traceId, timestamp, mode, triggerHits);

    writeAuditEvent({
      trace_id: traceId,
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: "REFUSE_UNIMPLEMENTED_ACTION",
      refusal_code: "PW-MODE-001",
      outcome: "refused",
      trigger_hits: triggerHits,
      risk_level: riskLevel,
      message: `Operation not implemented in phase 1: ${action.operation}`,
      plan_id: plan.plan_id,
      commit_id: commit.commit_id
    });

    return {
      trace_id: traceId,
      ok: false,
      decision_code: "REFUSE_UNIMPLEMENTED_ACTION",
      refusal_code: "PW-MODE-001",
      message: `Operation not implemented in phase 1: ${action.operation}`,
      plan_id: plan.plan_id,
      commit_id: commit.commit_id
    };
  }
  catch (error) {

    const rawMessage = error instanceof Error ? error.message : String(error);

    const isPolicyDenied = error instanceof AccessPolicyDeniedError;

    const decisionCode =
      isPolicyDenied
        ? "REFUSE_ACCESS_POLICY_DENIED"
        : "EXECUTE_ACTION_FAILED";

    const refusalCode =
      isPolicyDenied
        ? "PW-POL-001"
        : "PW-AUDIT-001";

    const triggerHits =
      isPolicyDenied
        ? ["access_policy_denied"]
        : ["execution_failure"];

    const message =
      isPolicyDenied
        ? `Access policy denied this action. ${rawMessage}`
        : rawMessage;

    auditDrift(traceId, timestamp, mode, triggerHits);

    writeAuditEvent({
      trace_id: traceId,
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: decisionCode,
      refusal_code: refusalCode,
      outcome: "failed",
      trigger_hits: triggerHits,
      risk_level: riskLevel,
      message,
      plan_id: plan.plan_id,
      commit_id: commit.commit_id
    });

    return {
      trace_id: traceId,
      ok: false,
      decision_code: decisionCode,
      refusal_code: refusalCode,
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
  traceId: string,
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

  const triggerHits = ["mutation_requested"];

  auditDrift(traceId, timestamp, mode, triggerHits);

  writeAuditEvent({
    trace_id: traceId,
    event_id: makeId("audit"),
    timestamp,
    mode,
    decision_code: decisionCode,
    outcome: "executed",
    trigger_hits: triggerHits,
    risk_level: riskLevel,
    message: `${operation} executed successfully`,
    plan_id: plan.plan_id,
    commit_id: commit.commit_id
  });

  return {
    trace_id: traceId,
    ok: true,
    decision_code: decisionCode,
    message: `${operation} executed successfully`,
    plan_id: plan.plan_id,
    commit_id: commit.commit_id
  };
}


