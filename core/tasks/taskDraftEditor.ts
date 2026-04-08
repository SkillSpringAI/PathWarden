import type { TaskDraft } from "./taskDraftTypes";
import { setSimpleField } from "./taskEditHelpers";

export function editDraftField(draft: TaskDraft, field: string, value: string): TaskDraft {
  if (field.startsWith("parsed.")) {
    const innerField = field.slice("parsed.".length);

    switch (innerField) {
      case "name":
      case "type":
      case "suggested_schedule":
      case "confidence":
        (draft.parsed as Record<string, unknown>)[innerField] = value;
        return draft;

      case "requires_confirmation":
      case "auto_run":
      case "approved":
        (draft.parsed as Record<string, unknown>)[innerField] =
          value.trim().toLowerCase() === "true" ||
          value.trim().toLowerCase() === "yes" ||
          value.trim() === "1";
        return draft;

      default:
        throw new Error(`Unsupported editable parsed field: ${innerField}`);
    }
  }

  if (field.startsWith("suggested_task.")) {
    const innerField = field.slice("suggested_task.".length);
    setSimpleField(draft.suggested_task as unknown as Record<string, unknown>, innerField, value);
    return draft;
  }

  switch (field) {
    case "raw_input":
      draft.raw_input = value;
      return draft;

    default:
      throw new Error(`Unsupported editable draft field: ${field}`);
  }
}
