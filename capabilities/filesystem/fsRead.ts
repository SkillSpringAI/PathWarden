import { readFileSync } from "node:fs";

export function executeRead(path: string): string {
  if (!path) {
    throw new Error("Read requires path");
  }

  return readFileSync(path, "utf8");
}
