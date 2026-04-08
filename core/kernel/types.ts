export type PathwardenMode = "core" | "connect" | "assistant" | "locked_down";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface FilesystemAction {
  type: "filesystem";
  operation: "list" | "search" | "move" | "copy" | "create" | "rename" | "delete" | "open" | "stat" | "write";
  selector?: {
    path?: string;
  };
  destination?: {
    path?: string;
  };
  create?: Record<string, unknown>;
}

export type PathwardenAction = FilesystemAction;

export interface PathwardenPlan {
  plan_id: string;
  actions: PathwardenAction[];
  risk_level: RiskLevel;
  requires_confirmation: boolean;
}

export interface PathwardenCommit {
  commit_id: string;
  plan_id: string;
  confirmed: true;
}

export interface ValidationSuccess {
  ok: true;
  mode: PathwardenMode;
  decision_code: string;
  risk_level: RiskLevel;
  trigger_hits: string[];
  requires_confirmation: boolean;
  action: PathwardenAction;
}

export interface ValidationRefusal {
  ok: false;
  decision_code: string;
  refusal_code: string;
  message: string;
  invariant_id: string;
  trigger_hits: string[];
  audit_required: boolean;
}

export type ValidationResult = ValidationSuccess | ValidationRefusal;
