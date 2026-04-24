import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadJsonFile<T = unknown>(relativePathFromProjectRoot: string): T {
  const absolutePath = resolve(process.cwd(), relativePathFromProjectRoot);
  const raw = readFileSync(absolutePath, "utf8");
  return JSON.parse(raw) as T;
}
