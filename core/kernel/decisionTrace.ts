import type { InvariantId } from "./invariants";

export interface DecisionTrace {
  trace_id: string;
  timestamp: string;
  invariant_checks: InvariantId[];
  trigger_hits: string[];
  decision_code: string;
  approved: boolean;
  audit_required: boolean;
  refusal_code?: string;
  message?: string;
}
