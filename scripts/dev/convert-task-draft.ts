import { loadTaskDraft, archiveTaskDraft } from "../../core/tasks/taskDraftStore";
import { convertDraftToTask } from "../../core/tasks/taskDraftConverter";
import { saveTask } from "../../core/tasks/taskStore";

const draftId = process.argv[2];

if (!draftId) {
  console.error("Usage: npx tsx scripts/dev/convert-task-draft.ts <draft_id>");
  process.exit(1);
}

const draft = loadTaskDraft(draftId);

if (!draft) {
  console.log(JSON.stringify({
    ok: false,
    decision_code: "REFUSE_DRAFT_NOT_FOUND",
    message: `No task draft found for draft_id: ${draftId}`,
    draft_id: draftId
  }, null, 2));
  process.exit(1);
}

const result = convertDraftToTask(draft);

if (!result.ok || !result.task) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}

saveTask(result.task);
archiveTaskDraft(draftId);

console.log(JSON.stringify({
  ok: true,
  type: "task-draft-convert",
  decision_code: result.decision_code,
  message: result.message,
  draft_id: result.draft_id,
  task: result.task
}, null, 2));