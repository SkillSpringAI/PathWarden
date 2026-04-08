import { listTaskDrafts } from "../../core/tasks/taskDraftStore";

const drafts = listTaskDrafts();

if (drafts.length === 0) {
  console.log("No task drafts found.");
  process.exit(0);
}

console.log("Pathwarden Task Draft Summary");
console.log("");

for (const draft of drafts) {
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
  console.log("");
}
