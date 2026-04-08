import { loadTaskDraft } from "../../core/tasks/taskDraftStore";

const draftId = process.argv[2];

if (!draftId) {
  console.log("Usage: view-task-draft <draft_id>");
  process.exit(1);
}

const draft = loadTaskDraft(draftId);

if (!draft) {
  console.log(`Draft not found: ${draftId}`);
  process.exit(1);
}

console.log(JSON.stringify(draft, null, 2));
