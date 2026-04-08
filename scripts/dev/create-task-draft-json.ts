import { parseTaskDraft } from "../../core/tasks/taskDraftParser";
import { saveTaskDraft } from "../../core/tasks/taskDraftStore";

const rawInput = process.argv.slice(2).join(" ").trim();

if (!rawInput) {
  console.log(JSON.stringify({
    ok: false,
    type: "task-draft-create",
    message: "Missing natural language input."
  }, null, 2));
  process.exit(0);
}

const draft = parseTaskDraft(rawInput);
saveTaskDraft(draft);

console.log(JSON.stringify({
  ok: true,
  type: "task-draft-create",
  message: "Task draft created.",
  draft
}, null, 2));
