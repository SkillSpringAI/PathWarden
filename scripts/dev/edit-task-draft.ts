import { loadTaskDraft, updateTaskDraft } from "../../core/tasks/taskDraftStore";
import { editDraftField } from "../../core/tasks/taskDraftEditor";

const draftId = process.argv[2];
const field = process.argv[3];
const value = process.argv.slice(4).join(" ");

if (!draftId || !field || !value) {
  console.log('Usage: edit-task-draft <draft_id> <field> <value>');
  process.exit(1);
}

const draft = loadTaskDraft(draftId);

if (!draft) {
  console.log(`Draft not found: ${draftId}`);
  process.exit(1);
}

try {
  const updated = editDraftField(draft, field, value);
  updateTaskDraft(updated);
  console.log(JSON.stringify(updated, null, 2));
} catch (error) {
  console.log(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
