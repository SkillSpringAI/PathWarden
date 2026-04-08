import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadConfigFile<T = unknown>(relativePathFromPathwardenRoot: string): T {
  const absolutePath = resolve(process.cwd(), "Pathwarden", relativePathFromPathwardenRoot);

  if (!existsSync(absolutePath)) {
    throw new Error(`Config file not found: ${absolutePath}`);
  }

  const raw = readFileSync(absolutePath, "utf8");
  return JSON.parse(raw) as T;
}
