import fs from "node:fs";
import path from "node:path";

export type VerificationFailure = {
  code: string;
  message: string;
};

export const SECRET_KEY_PATTERN =
  /(api[_-]?key|secret|token|password|private[_-]?key|client[_-]?secret|credential)/i;

export function readJsonFile<T>(filePath: string): T {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File does not exist: ${absolutePath}`);
  }

  const raw = fs.readFileSync(absolutePath, "utf8");
  return JSON.parse(raw) as T;
}

export function hasObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isStatusString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isIncompleteStatus(status: unknown): boolean {
  return [
    "incomplete",
    "missing",
    "failed",
    "not_ready",
    "not-ready",
    "invalid",
    "unverified"
  ].includes(String(status));
}

export function walkForSecretLikeKeys(
  value: unknown,
  failures: VerificationFailure[],
  currentPath = "$"
): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      walkForSecretLikeKeys(entry, failures, `${currentPath}[${index}]`)
    );
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, nestedValue] of Object.entries(value)) {
      const nextPath = `${currentPath}.${key}`;

      if (SECRET_KEY_PATTERN.test(key)) {
        failures.push({
          code: "SECRET_LIKE_KEY",
          message: `Secret-like key detected at ${nextPath}`
        });
      }

      walkForSecretLikeKeys(nestedValue, failures, nextPath);
    }
  }
}

export function isDeterministicArtifactRef(
  ref: unknown,
  options: {
    requireKind: boolean;
    allowNullId: boolean;
  }
): boolean {
  if (!hasObject(ref)) return false;

  const kind = ref.kind;
  const id = ref.id;
  const pathValue = ref.path;
  const required = ref.required;

  const hasKind =
    !options.requireKind ||
    (typeof kind === "string" && kind.trim().length > 0);

  const hasStableId =
    options.allowNullId
      ? id === null || (typeof id === "string" && id.trim().length > 0)
      : typeof id === "string" && id.trim().length > 0;

  const hasStablePath =
    pathValue === null ||
    (typeof pathValue === "string" && pathValue.trim().length > 0);

  const hasRequiredFlag = typeof required === "boolean";

  return hasKind && hasStableId && hasStablePath && hasRequiredFlag;
}

export function printVerificationFailuresAndExit(
  heading: string,
  failures: VerificationFailure[]
): void {
  console.error(heading);

  for (const failure of failures) {
    console.error(`- ${failure.code}: ${failure.message}`);
  }

  process.exit(1);
}