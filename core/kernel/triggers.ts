import type { PathwardenAction, PathwardenMode } from "./types";
import { requiresConfirmation } from "./risk";
import { isActionAllowedInMode } from "./modePolicy";

const PROTECTED_PATH_PREFIXES = [
  "C:/Windows",
  "C:/Program Files",
  "C:/Program Files (x86)",
  "C:/Users/Public",
  "/System",
  "/Applications",
  "/usr",
  "/bin",
  "/etc"
];

export function detectTriggers(
  mode: PathwardenMode,
  action: PathwardenAction,
  confirmed = false
): string[] {
  const hits: string[] = [];

  if (!isActionAllowedInMode(mode, action)) {
    hits.push("mode_restriction");
  }

  if (requiresConfirmation(action) && !confirmed) {
    hits.push("missing_confirmation");
  }

  const path = action.selector?.path ?? "";
  const destination = action.destination?.path ?? "";

  if (isProtectedPath(path) || isProtectedPath(destination)) {
    hits.push("protected_path_access");
  }

  if (["move", "copy", "create", "rename", "delete", "write"].includes(action.operation)) {
    hits.push("mutation_requested");
  }

  return hits;
}

function isProtectedPath(value: string): boolean {
  if (!value) return false;
  return PROTECTED_PATH_PREFIXES.some(prefix =>
    value.toLowerCase().startsWith(prefix.toLowerCase())
  );
}
