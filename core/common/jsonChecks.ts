export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasString(value: Record<string, unknown>, key: string): boolean {
  return typeof value[key] === "string" && String(value[key]).length > 0;
}

export function hasBoolean(value: Record<string, unknown>, key: string): boolean {
  return typeof value[key] === "boolean";
}
