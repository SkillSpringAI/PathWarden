export interface ExecutionSuccess {
  ok: true;
  decision_code: string;
  message: string;
  plan_id?: string;
  commit_id?: string;
}

export interface ExecutionFailure {
  ok: false;
  decision_code: string;
  refusal_code: string;
  message: string;
  plan_id?: string;
  commit_id?: string;
}

export type ExecutionResult = ExecutionSuccess | ExecutionFailure;
