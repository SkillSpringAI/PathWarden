import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { nowIso } from "./time";

export interface GlobalLock {
  lock_name: string;
  owner_pid: number;
  created_at: string;
  expires_at: string;
}

const DEFAULT_LOCK_TTL_MS = 5 * 60 * 1000;

function lockPath(lockName: string): string {
  return resolve(process.cwd(), "Pathwarden", "runtime", "locks", `${lockName}.global.lock.json`);
}

function ensureLockDir(lockName: string): void {
  mkdirSync(dirname(lockPath(lockName)), { recursive: true });
}

function makeExpiryIso(ttlMs: number): string {
  return new Date(Date.now() + ttlMs).toISOString();
}

export function loadGlobalLock(lockName: string): GlobalLock | null {
  const path = lockPath(lockName);
  if (!existsSync(path)) {
    return null;
  }

  return JSON.parse(readFileSync(path, "utf8")) as GlobalLock;
}

export function isGlobalLockExpired(lock: GlobalLock): boolean {
  return new Date(lock.expires_at).getTime() <= Date.now();
}

export function acquireGlobalLock(lockName: string, ttlMs = DEFAULT_LOCK_TTL_MS): { ok: true; lock: GlobalLock } | { ok: false; reason: string } {
  ensureLockDir(lockName);

  const existing = loadGlobalLock(lockName);
  if (existing && !isGlobalLockExpired(existing)) {
    return {
      ok: false,
      reason: `Global lock '${lockName}' already held by pid ${existing.owner_pid} until ${existing.expires_at}`
    };
  }

  if (existing && isGlobalLockExpired(existing)) {
    releaseGlobalLock(lockName);
  }

  const lock: GlobalLock = {
    lock_name: lockName,
    owner_pid: process.pid,
    created_at: nowIso(),
    expires_at: makeExpiryIso(ttlMs)
  };

  writeFileSync(lockPath(lockName), JSON.stringify(lock, null, 2), "utf8");

  return {
    ok: true,
    lock
  };
}

export function releaseGlobalLock(lockName: string): void {
  const path = lockPath(lockName);
  if (existsSync(path)) {
    rmSync(path, { force: true });
  }
}
