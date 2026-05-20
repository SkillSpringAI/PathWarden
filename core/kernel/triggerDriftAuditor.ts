import { writeAuditEvent } from "../audit/auditWriter";
import { makeId } from "../common/ids";
import { validateTriggerHits } from "./triggerHitValidator";
import type { PathwardenMode } from "./types";

export function auditTriggerRegistryDrift(
  traceId: string,
  timestamp: string,
  mode: PathwardenMode,
  triggerHits: string[]
): void {

  const validation = validateTriggerHits(triggerHits);

  if (validation.ok) {
    return;
  }

  writeAuditEvent({
    trace_id: traceId,
    event_id: makeId("audit"),
    timestamp,
    mode,
    decision_code: "WARN_TRIGGER_REGISTRY_DRIFT",
    outcome: "allowed",
    trigger_hits: [
      "trigger_registry_drift",
      ...validation.unknown_triggers,
      ...validation.disabled_triggers
    ],
    message:
      `Trigger registry drift detected. ` +
      `Unknown: ${validation.unknown_triggers.join(", ") || "none"}. ` +
      `Disabled: ${validation.disabled_triggers.join(", ") || "none"}.`
  });
}
