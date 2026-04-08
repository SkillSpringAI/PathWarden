export interface UndoToken {
  undo_id: string;
  operation: string;
  source_path?: string;
  destination_path?: string;
  timestamp: string;
  plan_id?: string;
  commit_id?: string;
}
