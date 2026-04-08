import { parseTaskDraft } from "../../core/tasks/taskDraftParser";
import { saveTaskDraft } from "../../core/tasks/taskDraftStore";

const input = process.argv.slice(2).join(" ").trim();

if (!input) {
  console.log('Usage: create-task-draft "<natural language instruction>"');
  process.exit(1);
}

const draft = parseTaskDraft(input);
const path = saveTaskDraft(draft);

console.log(JSON.stringify(draft, null, 2));
console.log(`Draft written to: ${path}`);
