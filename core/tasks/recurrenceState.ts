import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

export interface TaskRunState {
  task_id: string;
  last_run_at: string | null;
  last_run_key: string | null;
}

function statePath(taskId: string): string {
  return resolve(process.cwd(), "Pathwarden", "runtime", "recurrence", `${taskId}.json`);
}

export function loadTaskRunState(taskId: string): TaskRunState {
  const path = statePath(taskId);

  if (!existsSync(path)) {
    return {
      task_id: taskId,
      last_run_at: null,
      last_run_key: null
    };
  }

  return JSON.parse(readFileSync(path, "utf8")) as TaskRunState;
}

export function saveTaskRunState(state: TaskRunState): void {
  const path = statePath(state.task_id);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(state, null, 2), "utf8");
}
