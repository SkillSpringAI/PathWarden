import { existsSync, rmSync } from "node:fs";
import { isProtectedPath } from "./pathGuards";

export function executeDelete(targetPath: string): void {
  if (!targetPath) {
    throw new Error("Delete requires targetPath");
  }

  if (isProtectedPath(targetPath)) {
    throw new Error("Delete blocked: protected path");
  }

  if (!existsSync(targetPath)) {
    throw new Error(`Delete blocked: target does not exist: ${targetPath}`);
  }

  rmSync(targetPath, { recursive: true, force: false });
}
