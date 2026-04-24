import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import type { PathwardenTask, TaskResult } from "./taskTypes";
import { transitionTaskStatus } from "./taskLifecycle";

function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

function queueDir(): string {
  return resolve(process.cwd(), "tasks", "queue");
}

function historyDir(): string {
  return resolve(process.cwd(), "tasks", "history");
}

export function saveTask(task: PathwardenTask): string {
  const dir = queueDir();
  ensureDir(dir);

  const filePath = resolve(dir, `${task.task_id}.json`);
  writeFileSync(filePath, JSON.stringify(task, null, 2), "utf8");
  return filePath;
}

export function loadTask(taskId: string): PathwardenTask | null {
  const filePath = resolve(queueDir(), `${taskId}.json`);
  if (!existsSync(filePath)) {
    return null;
  }

  return JSON.parse(readFileSync(filePath, "utf8")) as PathwardenTask;
}

export function listQueuedTasks(): PathwardenTask[] {
  const dir = queueDir();
  ensureDir(dir);

  return readdirSync(dir)
    .filter(name => name.endsWith(".json"))
    .sort()
    .map(name => JSON.parse(readFileSync(resolve(dir, name), "utf8")) as PathwardenTask);
}

export function updateTask(task: PathwardenTask): void {
  saveTask(task);
}

export function approveTask(taskId: string): PathwardenTask | null {
  const task = loadTask(taskId);
  if (!task) return null;

  task.approved = true;

  if (task.status === "pending" || task.status === "scheduled") {
    transitionTaskStatus(task, "approved");
  }

  updateTask(task);
  return task;
}

export function cancelTask(taskId: string): PathwardenTask | null {
  const task = loadTask(taskId);
  if (!task) return null;

  transitionTaskStatus(task, "cancelled");
  updateTask(task);
  return task;
}

export function archiveTaskResult(task: PathwardenTask, result: TaskResult): void {
  const dir = historyDir();
  ensureDir(dir);

  const historyPath = resolve(dir, `${task.task_id}.result.json`);
  writeFileSync(historyPath, JSON.stringify({ task, result }, null, 2), "utf8");

  const queuedPath = resolve(queueDir(), `${task.task_id}.json`);
  if (existsSync(queuedPath)) {
    const archivedPath = resolve(dir, `${task.task_id}.task.json`);
    renameSync(queuedPath, archivedPath);
  }
}
