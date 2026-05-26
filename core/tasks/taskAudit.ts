import { writeAuditEvent } from "../audit/auditWriter";
import { makeId } from "../common/ids";
import { nowIso } from "../common/time";
import { hashAuthorityChain } from "../common/hash";
import type { PathwardenTask } from "./taskTypes";

export function auditTaskEvent(
  task: PathwardenTask,
  outcome: "allowed" | "refused" | "executed" | "failed",
  message: string,
  decisionCode: string,
  refusalCode?: string
): string {
  const eventId = makeId("audit");
  const authorityChain = task.payload?.permission_token
    ? [
        "task",
        task.task_id,
        task.payload.permission_token.token_id
      ]
    : undefined;

  writeAuditEvent({
    trace_id: task.trace_id,
    event_id: eventId,
    timestamp: nowIso(),
    mode: task.mode,
    decision_code: decisionCode,
    refusal_code: refusalCode,
    outcome,
    trigger_hits: ["task_event"],
    message,
    plan_id: task.payload?.plan?.plan_id,
    commit_id: task.payload?.commit?.commit_id,
    permission_token_id: task.payload?.permission_token?.token_id,
    authority_chain: authorityChain,
    authority_chain_hash: authorityChain ? hashAuthorityChain(authorityChain) : undefined,
    authority_chain_hash_algorithm: authorityChain ? "sha256" : undefined
  });

  return eventId;
}


