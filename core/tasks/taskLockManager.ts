import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { nowIso } from "../common/time";
import type { TaskLock } from "./taskLockTypes";

const DEFAULT_LOCK_TTL_MS = 5 * 60 * 1000;

function lockPath(taskId: string): string {
  return resolve(process.cwd(), "Pathwarden", "runtime", "locks", `${taskId}.lock.json`);
}

function ensureLockDir(taskId: string): void {
  mkdirSync(dirname(lockPath(taskId)), { recursive: true });
}

function makeExpiryIso(ttlMs: number): string {
  return new Date(Date.now() + ttlMs).toISOString();
}

export function loadTaskLock(taskId: string): TaskLock | null {
  const path = lockPath(taskId);
  if (!existsSync(path)) {
    return null;
  }

  return JSON.parse(readFileSync(path, "utf8")) as TaskLock;
}

export function isLockExpired(lock: TaskLock): boolean {
  return new Date(lock.expires_at).getTime() <= Date.now();
}

export function acquireTaskLock(taskId: string, ttlMs = DEFAULT_LOCK_TTL_MS): { ok: true; lock: TaskLock } | { ok: false; reason: string } {
  ensureLockDir(taskId);

  const existing = loadTaskLock(taskId);
  if (existing && !isLockExpired(existing)) {
    return {
      ok: false,
      reason: `Task is already locked by pid ${existing.owner_pid} until ${existing.expires_at}`
    };
  }

  if (existing && isLockExpired(existing)) {
    releaseTaskLock(taskId);
  }

  const lock: TaskLock = {
    task_id: taskId,
    owner_pid: process.pid,
    created_at: nowIso(),
    expires_at: makeExpiryIso(ttlMs)
  };

  writeFileSync(lockPath(taskId), JSON.stringify(lock, null, 2), "utf8");

  return {
    ok: true,
    lock
  };
}

export function refreshTaskLock(taskId: string, ttlMs = DEFAULT_LOCK_TTL_MS): void {
  const existing = loadTaskLock(taskId);
  if (!existing) {
    return;
  }

  const refreshed: TaskLock = {
    ...existing,
    expires_at: makeExpiryIso(ttlMs)
  };

  writeFileSync(lockPath(taskId), JSON.stringify(refreshed, null, 2), "utf8");
}

export function releaseTaskLock(taskId: string): void {
  const path = lockPath(taskId);
  if (existsSync(path)) {
    rmSync(path, { force: true });
  }
}
