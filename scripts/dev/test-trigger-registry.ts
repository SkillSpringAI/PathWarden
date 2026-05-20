import {
  loadTriggerRegistry,
  getTriggerDefinition
} from "../../core/kernel/triggerRegistry";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const registry = loadTriggerRegistry();

assert(
  registry.schema_version === "trigger-registry.v1",
  "Expected trigger registry schema version"
);

assert(
  registry.triggers.length >= 1,
  "Expected trigger registry entries"
);

const protectedPath = getTriggerDefinition("protected_path_access");

assert(
  protectedPath !== undefined,
  "Expected protected_path_access trigger definition"
);

assert(
  protectedPath?.severity === "block",
  "Expected protected_path_access severity to be block"
);

assert(
  protectedPath?.plane === "policy",
  "Expected protected_path_access plane to be policy"
);

const severities = registry.triggers.map((trigger) => trigger.severity);

const firstFatal = severities.indexOf("fatal");
const firstBlock = severities.indexOf("block");
const firstWarn = severities.indexOf("warn");
const firstInfo = severities.indexOf("info");

if (firstFatal !== -1 && firstBlock !== -1) {
  assert(firstFatal <= firstBlock, "Expected fatal triggers before block triggers");
}

if (firstBlock !== -1 && firstWarn !== -1) {
  assert(firstBlock <= firstWarn, "Expected block triggers before warn triggers");
}

if (firstWarn !== -1 && firstInfo !== -1) {
  assert(firstWarn <= firstInfo, "Expected warn triggers before info triggers");
}

console.log("Trigger registry diagnostic passed.");
