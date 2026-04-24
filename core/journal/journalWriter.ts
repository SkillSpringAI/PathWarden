import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export interface JournalEntry {
  entry_id: string;
  timestamp: string;
  operation: string;
  target_path?: string;
  destination_path?: string;
  plan_id?: string;
  commit_id?: string;
}

export function writeJournalEntry(entry: JournalEntry): void {
  const dir = resolve(process.cwd(), "journal", "events");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const date = entry.timestamp.slice(0, 10);
  const filePath = resolve(dir, `journal-${date}.jsonl`);
  appendFileSync(filePath, JSON.stringify(entry) + "\n", "utf8");
}
