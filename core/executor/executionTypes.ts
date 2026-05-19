export interface ExecutionSuccess {
  trace_id?: string;
  ok: true;
  decision_code: string;
  message: string;
  plan_id?: string;
  commit_id?: string;
}

export interface ExecutionFailure {
  trace_id?: string;
  ok: false;
  decision_code: string;
  refusal_code: string;
  message: string;
  plan_id?: string;
  commit_id?: string;
}

export type ExecutionResult = ExecutionSuccess | ExecutionFailure;

