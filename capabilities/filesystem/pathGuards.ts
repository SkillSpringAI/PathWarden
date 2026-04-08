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

export function isProtectedPath(value: string): boolean {
  if (!value) return false;

  const normalized = normalizePath(value);
  return PROTECTED_PATH_PREFIXES.some(prefix =>
    normalized.startsWith(normalizePath(prefix))
  );
}

export function normalizePath(value: string): string {
  return value.replace(/\\/g, "/").trim().toLowerCase();
}
