import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { AuditEvent } from "./auditTypes";

export function writeAuditEvent(event: AuditEvent): void {
  const dir = resolve(process.cwd(), "audit", "events");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const date = event.timestamp.slice(0, 10);
  const filePath = resolve(dir, `${date}.jsonl`);
  appendFileSync(filePath, JSON.stringify(event) + "\n", "utf8");
}
