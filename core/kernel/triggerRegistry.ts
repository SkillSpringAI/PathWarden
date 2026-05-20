import { getSchemaValidator, formatAjvErrors } from "../common/schemaValidator";
import { loadConfigFile } from "../common/configLoader";

export type TriggerSeverity =
  | "info"
  | "warn"
  | "block"
  | "fatal";

export type TriggerPlane =
  | "kernel"
  | "policy"
  | "execution"
  | "audit"
  | "authority";

export interface TriggerDefinition {
  trigger_id: string;
  name: string;
  severity: TriggerSeverity;
  plane: TriggerPlane;
  enabled: boolean;
  description: string;
}

export interface TriggerRegistry {
  schema_version: "trigger-registry.v1";
  triggers: TriggerDefinition[];
}

const validator = getSchemaValidator(
  "schemas/triggers/trigger-registry.schema.json"
);

const severityRank: Record<TriggerSeverity, number> = {
  info: 1,
  warn: 2,
  block: 3,
  fatal: 4
};

export function loadTriggerRegistry(): TriggerRegistry {

  const registry = loadConfigFile<TriggerRegistry>(
    "policy/triggers/trigger-registry.json"
  );

  const valid = validator(registry);

  if (!valid) {
    throw new Error(
      `Invalid trigger registry configuration: ${formatAjvErrors(validator.errors)}`
    );
  }

  registry.triggers.sort((a, b) => {
    const severityDelta =
      severityRank[b.severity] - severityRank[a.severity];

    if (severityDelta !== 0) {
      return severityDelta;
    }

    return a.trigger_id.localeCompare(b.trigger_id);
  });

  return registry;
}

export function getTriggerDefinition(
  triggerId: string
): TriggerDefinition | undefined {

  return loadTriggerRegistry()
    .triggers
    .find((trigger) => trigger.trigger_id === triggerId);
}
