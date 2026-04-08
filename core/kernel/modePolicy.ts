import type { PathwardenAction, PathwardenMode } from "./types";

export function isActionAllowedInMode(mode: PathwardenMode, action: PathwardenAction): boolean {
  if (mode === "locked_down") {
    return false;
  }

  if (mode === "core") {
    return action.type === "filesystem";
  }

  if (mode === "connect") {
    return action.type === "filesystem";
  }

  if (mode === "assistant") {
    return action.type === "filesystem";
  }

  return false;
}
