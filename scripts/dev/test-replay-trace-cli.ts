import { existsSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const replayScriptPath = resolve(
  process.cwd(),
  "scripts",
  "dev",
  "replay-trace.ts"
);

assert(
  existsSync(replayScriptPath),
  "Expected replay trace script to exist"
);

console.log("Replay trace CLI diagnostic passed.");
