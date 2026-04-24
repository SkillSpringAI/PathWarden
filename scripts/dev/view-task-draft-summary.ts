import { listTaskDrafts } from "../../core/tasks/taskDraftStore";

const drafts = listTaskDrafts();

const summary = drafts.map(draft => ({
  draft_id: draft.draft_id,
  raw_input: draft.raw_input,
  created_at: draft.created_at,
  detected_intent: draft.draft_policy?.detected_intent ?? "unknown",
  risk_level: draft.draft_policy?.risk_level ?? "unknown",
  policy_status: draft.draft_policy?.policy_status ?? "unknown",
  execution_state: draft.draft_policy?.execution_state ?? "unknown",
  requires_approval_before_execution:
    draft.draft_policy?.requires_approval_before_execution ?? true,
  safe_to_autorun: draft.draft_policy?.safe_to_autorun ?? false,
  task_type: draft.parsed.type,
  confidence: draft.parsed.confidence,
  scheduled_for: draft.suggested_task.scheduled_for ?? null,
  approved: draft.suggested_task.approved,
  auto_run: draft.suggested_task.auto_run
}));

console.log(JSON.stringify(summary, null, 2));