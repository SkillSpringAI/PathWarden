import type { PathwardenAction, RiskLevel } from "./types";

export function resolveRisk(action: PathwardenAction): RiskLevel {
  switch (action.operation) {
    case "list":
    case "search":
    case "stat":
    case "open":
      return "low";

    case "copy":
    case "create":
    case "rename":
      return "medium";

    case "move":
    case "write":
      return "high";

    case "delete":
      return "critical";

    default:
      return "critical";
  }
}

export function requiresConfirmation(action: PathwardenAction): boolean {
  return !["list", "search", "stat", "open"].includes(action.operation);
}
