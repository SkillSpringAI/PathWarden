export function parseBoolean(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

export function setSimpleField(target: Record<string, unknown>, field: string, rawValue: string): void {
  switch (field) {
    case "name":
    case "description":
    case "status":
    case "scheduled_for":
      target[field] = rawValue;
      return;

    case "requires_confirmation":
    case "approved":
    case "auto_run":
      target[field] = parseBoolean(rawValue);
      return;

    default:
      throw new Error(`Unsupported editable field: ${field}`);
  }
}
