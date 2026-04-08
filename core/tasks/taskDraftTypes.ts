import type { PathwardenTask, TaskType } from "./taskTypes";

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
}
