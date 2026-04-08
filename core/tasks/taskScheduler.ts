import type { PathwardenTask } from "./taskTypes";
import { isTaskTypeAllowedForAutoRun } from "./taskPolicy";
import { loadTaskRunState } from "./recurrenceState";
import { getTaskRunWindowKey } from "./recurrenceWindow";

export function isTaskDue(task: PathwardenTask, now = new Date()): boolean {
  if (task.status === "cancelled" || task.status === "completed" || task.status === "failed" || task.status === "refused") {
    return false;
  }

  if (task.scheduled_for) {
    const scheduled = new Date(task.scheduled_for);
    return scheduled.getTime() <= now.getTime();
  }

  if (!task.schedule) {
    return false;
  }

  if (task.schedule.kind === "once" && task.schedule.run_at) {
    return new Date(task.schedule.run_at).getTime() <= now.getTime();
  }

  if (task.schedule.kind === "daily") {
    return now.getHours() === (task.schedule.hour ?? 0) &&
           now.getMinutes() === (task.schedule.minute ?? 0);
  }

  if (task.schedule.kind === "weekly") {
    return now.getDay() === (task.schedule.day_of_week ?? 0) &&
           now.getHours() === (task.schedule.hour ?? 0) &&
           now.getMinutes() === (task.schedule.minute ?? 0);
  }

  return false;
}

export function canAutoRun(task: PathwardenTask): boolean {
  if (!task.auto_run) {
    return false;
  }

  if (task.requires_confirmation) {
    return false;
  }

  if (!task.approved) {
    return false;
  }

  if (!isTaskTypeAllowedForAutoRun(task)) {
    return false;
  }

  return true;
}

export function hasAlreadyRunInCurrentWindow(task: PathwardenTask, now = new Date()): boolean {
  if (!task.schedule) {
    return false;
  }

  const state = loadTaskRunState(task.task_id);
  const currentKey = getTaskRunWindowKey(task, now);

  if (!currentKey) {
    return false;
  }

  return state.last_run_key === currentKey;
}
