import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { isProtectedPath } from "./pathGuards";

export function executeCopy(sourcePath: string, destinationPath: string): void {
  if (!sourcePath || !destinationPath) {
    throw new Error("Copy requires sourcePath and destinationPath");
  }

  if (isProtectedPath(sourcePath) || isProtectedPath(destinationPath)) {
    throw new Error("Copy blocked: protected path");
  }

  if (!existsSync(sourcePath)) {
    throw new Error(`Copy blocked: source does not exist: ${sourcePath}`);
  }

  const parentDir = dirname(destinationPath);
  if (!existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true });
  }

  copyFileSync(sourcePath, destinationPath);
}
