import type { PathwardenTask } from "./taskTypes";
import { setSimpleField } from "./taskEditHelpers";

export function editTaskField(task: PathwardenTask, field: string, value: string): PathwardenTask {
  switch (field) {
    case "name":
    case "description":
    case "status":
    case "scheduled_for":
    case "requires_confirmation":
    case "approved":
    case "auto_run":
      setSimpleField(task as unknown as Record<string, unknown>, field, value);
      return task;

    default:
      throw new Error(`Unsupported editable task field: ${field}`);
  }
}
