import { buildDecision } from "./decision";
import { buildRefusal } from "./refusal";
import { resolveRisk, requiresConfirmation } from "./risk";
import { detectTriggers } from "./triggers";
import { isActionAllowedInMode } from "./modePolicy";
import type { PathwardenAction, PathwardenMode, ValidationResult } from "./types";
import { getSchemaValidator, formatAjvErrors } from "../common/schemaValidator";
import { writeAuditEvent } from "../audit/auditWriter";
import { makeId } from "../common/ids";
import { nowIso } from "../common/time";

const actionSchemaValidator = getSchemaValidator("schemas/action/action.schema.json");

export function validateAction(
  mode: PathwardenMode,
  action: unknown,
  confirmed = false
): ValidationResult {
  const timestamp = nowIso();

  const schemaOk = actionSchemaValidator(action);
  if (!schemaOk) {
    const refusal = buildRefusal(
      "REFUSE_SCHEMA_INVALID",
      "PW-SCHEMA-001",
      formatAjvErrors(actionSchemaValidator.errors),
      "INV-004",
      ["schema_invalid"]
    );

    writeAuditEvent({
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: refusal.decision_code,
      refusal_code: refusal.refusal_code,
      outcome: "refused",
      trigger_hits: refusal.trigger_hits,
      message: refusal.message
    });

    return refusal;
  }

  const typedAction = action as PathwardenAction;
  const triggerHits = detectTriggers(mode, typedAction, confirmed);

  if (!isActionAllowedInMode(mode, typedAction)) {
    const refusal = buildRefusal(
      "REFUSE_MODE_RESTRICTION",
      "PW-MODE-001",
      "Action not allowed in current mode",
      "INV-001",
      triggerHits
    );

    writeAuditEvent({
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: refusal.decision_code,
      refusal_code: refusal.refusal_code,
      outcome: "refused",
      trigger_hits: refusal.trigger_hits,
      message: refusal.message
    });

    return refusal;
  }

  const confirmationNeeded = requiresConfirmation(typedAction);
  if (confirmationNeeded && !confirmed) {
    const refusal = buildRefusal(
      "REFUSE_CONFIRMATION_REQUIRED",
      "PW-CONFIRM-001",
      "Commit requires explicit confirmation",
      "INV-003",
      triggerHits
    );

    writeAuditEvent({
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: refusal.decision_code,
      refusal_code: refusal.refusal_code,
      outcome: "refused",
      trigger_hits: refusal.trigger_hits,
      risk_level: resolveRisk(typedAction),
      message: refusal.message
    });

    return refusal;
  }

  if (triggerHits.includes("protected_path_access")) {
    const refusal = buildRefusal(
      "REFUSE_PROTECTED_PATH",
      "PW-PATH-001",
      "Operation targets a protected path",
      "INV-005",
      triggerHits
    );

    writeAuditEvent({
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: refusal.decision_code,
      refusal_code: refusal.refusal_code,
      outcome: "refused",
      trigger_hits: refusal.trigger_hits,
      risk_level: resolveRisk(typedAction),
      message: refusal.message
    });

    return refusal;
  }

  const risk = resolveRisk(typedAction);
  const decision = buildDecision(
    mode,
    typedAction,
    risk,
    triggerHits,
    confirmationNeeded
  );

  writeAuditEvent({
    event_id: makeId("audit"),
    timestamp,
    mode,
    decision_code: decision.decision_code,
    outcome: "allowed",
    trigger_hits: decision.trigger_hits,
    risk_level: decision.risk_level,
    message: "Action validated successfully"
  });

  return decision;
}
