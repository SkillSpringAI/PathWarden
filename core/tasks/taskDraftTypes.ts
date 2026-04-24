import type { PathwardenTask, TaskType } from "./taskTypes";


export type DraftExecutionState = "draft_only";
export type DraftPolicyStatus = "not_checked" | "allowed" | "denied" | "needs_more_detail";
export type DraftDetectedIntent =
  | "reminder"
  | "filesystem_move"
  | "filesystem_copy"
  | "filesystem_delete"
  | "filesystem_rename"
  | "filesystem_open"
  | "filesystem_search"
  | "custom";

export type DraftRiskLevel = "low" | "medium" | "high" | "critical";

export interface DraftPolicyMetadata {
  execution_state: DraftExecutionState;
  requires_approval_before_execution: boolean;
  policy_status: DraftPolicyStatus;
  detected_intent: DraftDetectedIntent;
  risk_level: DraftRiskLevel;
  safe_to_autorun: boolean;
  notes: string[];
}
export interface TaskDraft {
  draft_id: string;
  raw_input: string;
  created_at: string;
  parsed: {
    name: string;
    type: TaskType;
    mode: "core";
    suggested_schedule?: string;
    requires_confirmation: boolean;
    auto_run: boolean;
    approved: boolean;
    confidence: "low" | "medium" | "high";
    notes: string[];
  };
  suggested_task: Omit<PathwardenTask, "task_id">;
  draft_policy?: DraftPolicyMetadata;
}
