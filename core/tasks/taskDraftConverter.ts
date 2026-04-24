import { makeId } from "../common/ids";
import type { TaskDraft } from "./taskDraftTypes";
import type { PathwardenTask } from "./taskTypes";

export interface DraftConversionResult {
  ok: boolean;
  decision_code: string;
  message: string;
  task?: PathwardenTask;
  draft_id: string;
}

function isFilesystemIntent(intent: string | undefined): boolean {
  return typeof intent === "string" && intent.startsWith("filesystem_");
}

export function convertDraftToTask(draft: TaskDraft): DraftConversionResult {
  const policy = draft.draft_policy;

  if (!policy) {
    return {
      ok: false,
      decision_code: "REFUSE_DRAFT_POLICY_MISSING",
      message: "Draft cannot be converted because draft_policy metadata is missing.",
      draft_id: draft.draft_id
    };
  }

  if (policy.execution_state !== "draft_only") {
    return {
      ok: false,
      decision_code: "REFUSE_INVALID_DRAFT_EXECUTION_STATE",
      message: "Draft cannot be converted because execution_state is not draft_only.",
      draft_id: draft.draft_id
    };
  }

  if (policy.safe_to_autorun !== false) {
    return {
      ok: false,
      decision_code: "REFUSE_UNSAFE_AUTORUN_FLAG",
      message: "Draft cannot be converted because safe_to_autorun must remain false at draft stage.",
      draft_id: draft.draft_id
    };
  }

  const filesystemIntent = isFilesystemIntent(policy.detected_intent);
  const criticalRisk = policy.risk_level === "critical";

  const task: PathwardenTask = {
    task_id: makeId("task"),
    ...draft.suggested_task,
    approved: false,
    auto_run: false,
    requires_confirmation:
      draft.suggested_task.requires_confirmation ||
      policy.requires_approval_before_execution ||
      filesystemIntent ||
      criticalRisk
  };

  return {
    ok: true,
    decision_code: filesystemIntent
      ? "ALLOW_CONVERT_FILESYSTEM_DRAFT_REQUIRES_APPROVAL"
      : "ALLOW_CONVERT_DRAFT_TO_TASK",
    message: filesystemIntent
      ? "Draft converted to task. Filesystem task requires explicit approval before execution."
      : "Draft converted to task.",
    task,
    draft_id: draft.draft_id
  };
}