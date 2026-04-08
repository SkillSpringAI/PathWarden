import type { PathwardenMode, PathwardenPlan } from "../kernel/types";

export type TaskStatus =
  | "pending"
  | "scheduled"
  | "approved"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "refused";

export type TaskType =
  | "run_diagnostics"
  | "export_audit"
  | "validate_plan"
  | "execute_plan"
  | "custom";

export interface TaskSchedule {
  kind: "once" | "daily" | "weekly";
  run_at?: string;
  day_of_week?: number;
  hour?: number;
  minute?: number;
}

export interface PathwardenTask {
  task_id: string;
  name: string;
  description?: string;
  type: TaskType;
  mode: PathwardenMode;
  status: TaskStatus;
  created_at: string;
  scheduled_for?: string;
  schedule?: TaskSchedule;
  requires_confirmation: boolean;
  approved: boolean;
  auto_run: boolean;
  payload?: {
    plan?: PathwardenPlan;
    commit?: Record<string, unknown>;
    notes?: string;
  };
}

export interface TaskResult {
  task_id: string;
  status: Exclude<TaskStatus, "pending" | "scheduled" | "approved" | "running">;
  timestamp: string;
  message: string;
  audit_refs?: string[];
}
