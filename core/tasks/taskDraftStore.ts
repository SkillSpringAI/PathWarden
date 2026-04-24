import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { TaskDraft } from "./taskDraftTypes";

function draftsDir(): string {
  return resolve(process.cwd(), "tasks", "drafts");
}

function reviewedDir(): string {
  return resolve(process.cwd(), "tasks", "drafts", "reviewed");
}

function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

export function saveTaskDraft(draft: TaskDraft): string {
  ensureDir(draftsDir());
  const path = resolve(draftsDir(), `${draft.draft_id}.json`);
  writeFileSync(path, JSON.stringify(draft, null, 2), "utf8");
  return path;
}

export function updateTaskDraft(draft: TaskDraft): string {
  return saveTaskDraft(draft);
}

export function loadTaskDraft(draftId: string): TaskDraft | null {
  const path = resolve(draftsDir(), `${draftId}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as TaskDraft;
}

export function listTaskDrafts(): TaskDraft[] {
  ensureDir(draftsDir());
  return readdirSync(draftsDir())
    .filter(name => name.endsWith(".json"))
    .sort()
    .map(name => JSON.parse(readFileSync(resolve(draftsDir(), name), "utf8")) as TaskDraft);
}

export function archiveTaskDraft(draftId: string): void {
  ensureDir(reviewedDir());
  const source = resolve(draftsDir(), `${draftId}.json`);
  const target = resolve(reviewedDir(), `${draftId}.json`);
  if (existsSync(source)) {
    renameSync(source, target);
  }
}
