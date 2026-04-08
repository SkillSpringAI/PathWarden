import { loadTaskDraft, archiveTaskDraft } from "../../core/tasks/taskDraftStore";
import { convertDraftToTask } from "../../core/tasks/taskDraftConverter";
import { saveTask } from "../../core/tasks/taskStore";

const draftId = process.argv[2];

if (!draftId) {
  console.log("Usage: convert-task-draft <draft_id>");
  process.exit(1);
}

const draft = loadTaskDraft(draftId);

if (!draft) {
  console.log(`Draft not found: ${draftId}`);
  process.exit(1);
}

const task = convertDraftToTask(draft);
const path = saveTask(task);
archiveTaskDraft(draftId);

console.log(JSON.stringify(task, null, 2));
console.log(`Task written to: ${path}`);
console.log(`Draft archived: ${draftId}`);
