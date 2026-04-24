import { makeId } from "../common/ids";
import { nowIso } from "../common/time";
import type { TaskDraft, DraftDetectedIntent, DraftRiskLevel } from "./taskDraftTypes";
import type { PathwardenTask, TaskType } from "./taskTypes";


function detectDraftIntent(input: string): DraftDetectedIntent {
  const value = input.toLowerCase();

  if (value.includes("delete") || value.includes("remove")) return "filesystem_delete";
  if (value.includes("move")) return "filesystem_move";
  if (value.includes("copy")) return "filesystem_copy";
  if (value.includes("rename")) return "filesystem_rename";
  if (value.includes("open")) return "filesystem_open";
  if (value.includes("search") || value.includes("find")) return "filesystem_search";
  if (value.includes("remind") || value.includes("check")) return "reminder";

  return "custom";
}

function resolveDraftRisk(intent: DraftDetectedIntent, input: string): DraftRiskLevel {
  const value = input.toLowerCase();

  if (
    intent === "filesystem_delete" ||
    value.includes("system32") ||
    value.includes("windows\\") ||
    value.includes("appdata") ||
    value.includes("drivers\\etc\\hosts")
  ) {
    return "critical";
  }

  if (
    intent === "filesystem_move" ||
    intent === "filesystem_rename" ||
    intent === "filesystem_copy"
  ) {
    return "medium";
  }

  if (intent === "filesystem_open" || intent === "filesystem_search") {
    return "low";
  }

  return "low";
}

function buildDraftPolicy(input: string) {
  const detected_intent = detectDraftIntent(input);
  const risk_level = resolveDraftRisk(detected_intent, input);
  const isFilesystemIntent = detected_intent.startsWith("filesystem_");

  return {
    execution_state: "draft_only" as const,
    requires_approval_before_execution: isFilesystemIntent || risk_level === "critical",
    policy_status: "not_checked" as const,
    detected_intent,
    risk_level,
    safe_to_autorun: false,
    notes: [
      "Draft only. No filesystem action has been executed.",
      "Policy must be checked again before execution.",
      "Explicit approval is required before any filesystem operation."
    ]
  };
}

export function parseTaskDraft(rawInput: string): TaskDraft {
  const normalized = rawInput.trim().toLowerCase();

  let type: TaskType = "custom";
  let name = "Custom Task";
  let requiresConfirmation = false;
  let autoRun = false;
  let approved = false;
  let confidence: "low" | "medium" | "high" = "low";
  const notes: string[] = [];
  let scheduledFor: string | undefined;

  if (normalized.includes("diagnostic")) {
    type = "run_diagnostics";
    name = "Run Diagnostics";
    autoRun = true;
    approved = true;
    confidence = "high";
    notes.push("Mapped from diagnostics keyword");
  } else if (normalized.includes("audit")) {
    type = "export_audit";
    name = "Export Audit";
    autoRun = true;
    approved = true;
    confidence = "medium";
    notes.push("Mapped from audit keyword");
  } else if (normalized.includes("validate plan")) {
    type = "validate_plan";
    name = "Validate Plan";
    confidence = "medium";
    notes.push("Mapped from validate plan phrase");
  } else if (normalized.includes("execute plan") || normalized.includes("run plan")) {
    type = "execute_plan";
    name = "Execute Plan";
    requiresConfirmation = true;
    autoRun = false;
    approved = false;
    confidence = "medium";
    notes.push("Mapped from execute plan phrase");
    notes.push("Mutating tasks default to approval required");
  } else {
    notes.push("Could not confidently map to known task type");
  }

  if (normalized.includes("tomorrow")) {
    const dt = new Date();
    dt.setDate(dt.getDate() + 1);
    dt.setHours(9, 0, 0, 0);
    scheduledFor = dt.toISOString();
    notes.push("Interpreted 'tomorrow' as 9:00 AM local equivalent");
  }

  if (normalized.includes("tonight")) {
    const dt = new Date();
    dt.setHours(21, 0, 0, 0);
    scheduledFor = dt.toISOString();
    notes.push("Interpreted 'tonight' as 9:00 PM local equivalent");
  }

  if (normalized.includes("startup") || normalized.includes("start up") || normalized.includes("on launch")) {
    notes.push("Startup scheduling requested but not yet formalized");
  }

  const suggestedTask: Omit<PathwardenTask, "task_id"> = {
    name,
    description: rawInput,
    type,
    mode: "core",
    status: scheduledFor ? "scheduled" : "pending",
    created_at: nowIso(),
    scheduled_for: scheduledFor,
    requires_confirmation: requiresConfirmation,
    approved,
    auto_run: autoRun
  };

  return {
    draft_id: makeId("draft"),
    raw_input: rawInput,
    created_at: nowIso(),
    parsed: {
      name,
      type,
      mode: "core",
      suggested_schedule: scheduledFor,
      requires_confirmation: requiresConfirmation,
      auto_run: autoRun,
      approved,
      confidence,
      notes
    },
    suggested_task: suggestedTask
  ,
    draft_policy: buildDraftPolicy(rawInput)};
}
