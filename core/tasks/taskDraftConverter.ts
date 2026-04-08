import { makeId } from "../common/ids";
import type { TaskDraft } from "./taskDraftTypes";
import type { PathwardenTask } from "./taskTypes";

export function convertDraftToTask(draft: TaskDraft): PathwardenTask {
  return {
    task_id: makeId("task"),
    ...draft.suggested_task
  };
}
