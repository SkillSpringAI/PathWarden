import { loadConfigFile } from "../common/configLoader";
import type { PathwardenTask } from "./taskTypes";

type SchedulePolicy = {
  version: string;
  allow_auto_run_for: string[];
  deny_auto_run_for: string[];
  startup_reserved_task_types: string[];
  high_risk_requires_manual_review: boolean;
};

export function loadSchedulePolicy(): SchedulePolicy {
  return loadConfigFile<SchedulePolicy>("config/schedule-policy.json");
}

export function isTaskTypeAllowedForAutoRun(task: PathwardenTask): boolean {
  const policy = loadSchedulePolicy();

  if (policy.deny_auto_run_for.includes(task.type)) {
    return false;
  }

  return policy.allow_auto_run_for.includes(task.type);
}

export function isStartupTaskType(task: PathwardenTask): boolean {
  const policy = loadSchedulePolicy();
  return policy.startup_reserved_task_types.includes(task.type);
}
