import fs from "fs";
import path from "path";

type AccessPolicy = {
  version: number;
  defaultMode: "allow" | "deny";
  allowedPaths: string[];
  blockedPaths: string[];
};

const POLICY_PATH = path.resolve(process.cwd(), "config/access-policy.json");

export class AccessPolicyDeniedError extends Error {
  targetPath: string;

  constructor(targetPath: string) {
    super(`Access denied for path: ${targetPath}`);
    this.name = "AccessPolicyDeniedError";
    this.targetPath = targetPath;
  }
}

function normalizePath(input: string): string {
  return path.resolve(input).replace(/[\\/]+$/, "").toLowerCase();
}

function loadAccessPolicy(): AccessPolicy {
  if (!fs.existsSync(POLICY_PATH)) {
    throw new Error(`Access policy missing: ${POLICY_PATH}`);
  }

  const raw = fs.readFileSync(POLICY_PATH, "utf-8");
  const parsed = JSON.parse(raw) as AccessPolicy;

  if (!parsed || !Array.isArray(parsed.allowedPaths) || !Array.isArray(parsed.blockedPaths)) {
    throw new Error("Invalid access-policy.json");
  }

  return parsed;
}

function isWithin(basePath: string, targetPath: string): boolean {
  const base = normalizePath(basePath);
  const target = normalizePath(targetPath);
  return target === base || target.startsWith(base + path.sep.toLowerCase());
}

export function isPathBlocked(targetPath: string): boolean {
  const policy = loadAccessPolicy();
  return policy.blockedPaths.some((blocked) => isWithin(blocked, targetPath));
}

export function isProtectedPath(targetPath: string): boolean {
  return isPathBlocked(targetPath);
}

export function isPathAllowed(targetPath: string): boolean {
  const policy = loadAccessPolicy();

  if (isPathBlocked(targetPath)) {
    return false;
  }

  if (policy.defaultMode === "allow") {
    return true;
  }

  return policy.allowedPaths.some((allowed) => isWithin(allowed, targetPath));
}

export function assertPathAllowed(targetPath: string): void {
  if (!isPathAllowed(targetPath)) {
    throw new AccessPolicyDeniedError(targetPath);
  }
}

export function assertPathsAllowed(pathsToCheck: string[]): void {
  for (const targetPath of pathsToCheck) {
    assertPathAllowed(targetPath);
  }
}
