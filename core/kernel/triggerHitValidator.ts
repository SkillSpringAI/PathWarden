import { loadTriggerRegistry } from "./triggerRegistry";

export interface TriggerHitValidationResult {
  ok: boolean;
  unknown_triggers: string[];
  disabled_triggers: string[];
}

export function validateTriggerHits(
  triggerHits: string[]
): TriggerHitValidationResult {

  const registry = loadTriggerRegistry();
  const triggerMap = new Map(
    registry.triggers.map((trigger) => [trigger.trigger_id, trigger])
  );

  const unknown_triggers: string[] = [];
  const disabled_triggers: string[] = [];

  for (const triggerHit of triggerHits) {
    const definition = triggerMap.get(triggerHit);

    if (!definition) {
      unknown_triggers.push(triggerHit);
      continue;
    }

    if (!definition.enabled) {
      disabled_triggers.push(triggerHit);
    }
  }

  return {
    ok: unknown_triggers.length === 0 && disabled_triggers.length === 0,
    unknown_triggers,
    disabled_triggers
  };
}
