import { listTaskDrafts } from "../../core/tasks/taskDraftStore";

const drafts = listTaskDrafts();

if (drafts.length === 0) {
  console.log("No task drafts found.");
  process.exit(0);
}

console.log(JSON.stringify(drafts, null, 2));
