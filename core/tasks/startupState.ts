import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { nowIso } from "../common/time";

type StartupState = {
  last_startup_run_at: string | null;
};

function statePath(): string {
  return resolve(process.cwd(), "Pathwarden", "runtime", "state", "last-startup-run.json");
}

export function loadStartupState(): StartupState {
  const path = statePath();
  if (!existsSync(path)) {
    return { last_startup_run_at: null };
  }

  return JSON.parse(readFileSync(path, "utf8")) as StartupState;
}

export function saveStartupState(): void {
  const path = statePath();
  mkdirSync(dirname(path), { recursive: true });
  const state: StartupState = {
    last_startup_run_at: nowIso()
  };
  writeFileSync(path, JSON.stringify(state, null, 2), "utf8");
}
