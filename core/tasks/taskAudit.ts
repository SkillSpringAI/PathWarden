import { writeAuditEvent } from "../audit/auditWriter";
import { makeId } from "../common/ids";
import { nowIso } from "../common/time";
import type { PathwardenTask } from "./taskTypes";

export function auditTaskEvent(
  task: PathwardenTask,
  outcome: "allowed" | "refused" | "executed" | "failed",
  message: string,
  decisionCode: string,
  refusalCode?: string
): string {
  const eventId = makeId("audit");

  writeAuditEvent({
    event_id: eventId,
    timestamp: nowIso(),
    mode: task.mode,
    decision_code: decisionCode,
    refusal_code: refusalCode,
    outcome,
    trigger_hits: ["task_event"],
    message
  });

  return eventId;
}
