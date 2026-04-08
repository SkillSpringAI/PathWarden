import { renameSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { isProtectedPath } from "./pathGuards";

export function executeMove(sourcePath: string, destinationPath: string): void {
  if (!sourcePath || !destinationPath) {
    throw new Error("Move requires sourcePath and destinationPath");
  }

  if (isProtectedPath(sourcePath) || isProtectedPath(destinationPath)) {
    throw new Error("Move blocked: protected path");
  }

  if (!existsSync(sourcePath)) {
    throw new Error(`Move blocked: source does not exist: ${sourcePath}`);
  }

  const parentDir = dirname(destinationPath);
  if (!existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true });
  }

  renameSync(sourcePath, destinationPath);
}
