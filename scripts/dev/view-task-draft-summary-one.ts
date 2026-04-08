import { loadTaskDraft } from "../../core/tasks/taskDraftStore";

const draftId = process.argv[2];

if (!draftId) {
  console.log("Usage: view-task-draft-summary-one <draft_id>");
  process.exit(1);
}

const draft = loadTaskDraft(draftId);

if (!draft) {
  console.log(`Draft not found: ${draftId}`);
  process.exit(1);
}

console.log(`Draft: ${draft.draft_id}`);
console.log(`  Raw Input: ${draft.raw_input}`);
console.log(`  Suggested Name: ${draft.parsed.name}`);
console.log(`  Suggested Type: ${draft.parsed.type}`);
console.log(`  Confidence: ${draft.parsed.confidence}`);
console.log(`  Requires Confirmation: ${draft.parsed.requires_confirmation ? "Yes" : "No"}`);
console.log(`  Approved: ${draft.parsed.approved ? "Yes" : "No"}`);
console.log(`  Auto Run: ${draft.parsed.auto_run ? "Yes" : "No"}`);
console.log(`  Suggested Schedule: ${draft.parsed.suggested_schedule ?? "N/A"}`);
console.log(`  Notes: ${draft.parsed.notes.join(" | ") || "None"}`);
