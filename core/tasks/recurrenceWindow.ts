import type { PathwardenTask } from "./taskTypes";

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function getTaskRunWindowKey(task: PathwardenTask, now = new Date()): string | null {
  if (!task.schedule) {
    return null;
  }

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());

  if (task.schedule.kind === "once") {
    return `once:${year}-${month}-${day}T${hour}:${minute}`;
  }

  if (task.schedule.kind === "daily") {
    return `daily:${year}-${month}-${day}:${hour}:${minute}`;
  }

  if (task.schedule.kind === "weekly") {
    const dayOfWeek = now.getDay();
    return `weekly:${year}-${month}-${day}:dow${dayOfWeek}:${hour}:${minute}`;
  }

  return null;
}
