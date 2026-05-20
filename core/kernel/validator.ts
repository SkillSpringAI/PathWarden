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
import { INVARIANTS } from "./invariants";
import { REFUSAL_CODES } from "./refusalCodes";
import { auditTriggerRegistryDrift } from "./triggerDriftAuditor";

const actionSchemaValidator = getSchemaValidator("schemas/action/action.schema.json");

export function validateAction(
  mode: PathwardenMode,
  action: unknown,
  confirmed = false
): ValidationResult {
  const timestamp = nowIso();
  const traceId = makeId("trace");

  const schemaOk = actionSchemaValidator(action);
  if (!schemaOk) {
    const refusal = buildRefusal(
      "REFUSE_SCHEMA_INVALID",
      REFUSAL_CODES.SCHEMA_INVALID,
      formatAjvErrors(actionSchemaValidator.errors),
      INVARIANTS.SCHEMA_VALIDATION,
      ["schema_invalid"]
    );

    auditTriggerRegistryDrift(traceId, timestamp, mode, refusal.trigger_hits);

    writeAuditEvent({
      trace_id: traceId,
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: refusal.decision_code,
      refusal_code: refusal.refusal_code,
      outcome: "refused",
      trigger_hits: refusal.trigger_hits,
      message: refusal.message
    });

    return { ...refusal, trace_id: traceId };
  }

  const typedAction = action as PathwardenAction;
  const triggerHits = detectTriggers(mode, typedAction, confirmed);

  auditTriggerRegistryDrift(traceId, timestamp, mode, triggerHits);

  if (!isActionAllowedInMode(mode, typedAction)) {
    const refusal = buildRefusal(
      "REFUSE_MODE_RESTRICTION",
      REFUSAL_CODES.MODE_RESTRICTION,
      "Action not allowed in current mode",
      INVARIANTS.MODE_RESTRICTION,
      triggerHits
    );

    writeAuditEvent({
      trace_id: traceId,
      event_id: makeId("audit"),
      timestamp,
      mode,
      decision_code: refusal.decision_code,
      refusal_code: refusal.refusal_code,
      outcome: "refused",
      trigger_hits: refusal.trigger_hits,
      message: refusal.message
    });

    return { ...refusal, trace_id: traceId };
  }

  const confirmationNeeded = requiresConfirmation(typedAction);
  if (confirmationNeeded && !confirmed) {
    const refusal = buildRefusal(
      "REFUSE_CONFIRMATION_REQUIRED",
      REFUSAL_CODES.CONFIRMATION_REQUIRED,
      "Commit requires explicit confirmation",
      INVARIANTS.CONFIRMATION_REQUIRED,
      triggerHits
    );

    writeAuditEvent({
      trace_id: traceId,
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

    return { ...refusal, trace_id: traceId };
  }

  if (triggerHits.includes("protected_path_access")) {
    const refusal = buildRefusal(
      "REFUSE_PROTECTED_PATH",
      REFUSAL_CODES.PROTECTED_PATH,
      "Operation targets a protected path",
      INVARIANTS.PROTECTED_PATH,
      triggerHits
    );

    writeAuditEvent({
      trace_id: traceId,
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

    return { ...refusal, trace_id: traceId };
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
    trace_id: traceId,
    event_id: makeId("audit"),
    timestamp,
    mode,
    decision_code: decision.decision_code,
    outcome: "allowed",
    trigger_hits: decision.trigger_hits,
    risk_level: decision.risk_level,
    message: "Action validated successfully"
  });

  return { ...decision, trace_id: traceId };
}

