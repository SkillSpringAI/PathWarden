import type { PathwardenTask } from "./taskTypes";
import { nowIso } from "../common/time";
import { loadTaskRunState, saveTaskRunState } from "./recurrenceState";
import { getTaskRunWindowKey } from "./recurrenceWindow";

export function recordTaskRun(task: PathwardenTask, now = new Date()): void {
  const state = loadTaskRunState(task.task_id);
  state.last_run_at = nowIso();
  state.last_run_key = getTaskRunWindowKey(task, now);
  saveTaskRunState(state);
}
