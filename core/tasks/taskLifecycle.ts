import type { PathwardenTask, TaskStatus } from "./taskTypes";

const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  pending: ["approved", "cancelled", "running", "refused"],
  scheduled: ["approved", "cancelled", "running", "refused"],
  approved: ["running", "cancelled", "refused"],
  running: ["completed", "failed", "cancelled"],
  completed: [],
  failed: [],
  cancelled: [],
  refused: []
};

export function canTransitionTaskStatus(from: TaskStatus, to: TaskStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTaskTransition(task: PathwardenTask, nextStatus: TaskStatus): void {
  if (task.status === nextStatus) {
    return;
  }

  if (!canTransitionTaskStatus(task.status, nextStatus)) {
    throw new Error(`Illegal task status transition: ${task.status} -> ${nextStatus}`);
  }
}

export function transitionTaskStatus(task: PathwardenTask, nextStatus: TaskStatus): PathwardenTask {
  assertTaskTransition(task, nextStatus);
  task.status = nextStatus;
  return task;
}
