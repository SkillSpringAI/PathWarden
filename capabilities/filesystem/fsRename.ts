import { renameSync, existsSync } from "node:fs";
import { isProtectedPath } from "./pathGuards";

export function executeRename(sourcePath: string, destinationPath: string): void {
  if (!sourcePath || !destinationPath) {
    throw new Error("Rename requires sourcePath and destinationPath");
  }

  if (isProtectedPath(sourcePath) || isProtectedPath(destinationPath)) {
    throw new Error("Rename blocked: protected path");
  }

  if (!existsSync(sourcePath)) {
    throw new Error(`Rename blocked: source does not exist: ${sourcePath}`);
  }

  renameSync(sourcePath, destinationPath);
}
