import type { UndoToken } from "../journal/undoToken";
import type { ExecutionResult } from "./executionTypes";

export function executeUndo(_token: UndoToken): ExecutionResult {
  return {
    ok: false,
    decision_code: "REFUSE_UNDO_NOT_IMPLEMENTED",
    refusal_code: "PW-MODE-001",
    message: "Undo is not implemented yet"
  };
}
