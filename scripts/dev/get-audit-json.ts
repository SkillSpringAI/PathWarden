import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve(process.cwd(), "Pathwarden", "audit", "events");

if (!existsSync(dir)) {
  console.log(JSON.stringify({
    ok: false,
    type: "audit",
    message: "No audit directory found.",
    events: []
  }, null, 2));
  process.exit(0);
}

const files = readdirSync(dir)
  .filter(name => name.endsWith(".jsonl"))
  .sort();

const events: unknown[] = [];

for (const file of files) {
  const fullPath = resolve(dir, file);
  const raw = readFileSync(fullPath, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);

  for (const line of lines) {
    try {
      events.push(JSON.parse(line));
    } catch {
      events.push({ parse_error: true, raw: line });
    }
  }
}

const recent = events.slice(-12);

console.log(JSON.stringify({
  ok: true,
  type: "audit",
  message: recent.length === 0 ? "No audit events found." : "Recent audit events loaded.",
  events: recent
}, null, 2));
