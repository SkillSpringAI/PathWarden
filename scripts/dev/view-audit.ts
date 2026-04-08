import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve(process.cwd(), "Pathwarden", "audit", "events");

if (!existsSync(dir)) {
  console.log("No audit directory found.");
  process.exit(0);
}

const files = readdirSync(dir)
  .filter(name => name.endsWith(".jsonl"))
  .sort();

if (files.length === 0) {
  console.log("No audit events found.");
  process.exit(0);
}

const allEvents: unknown[] = [];

for (const file of files) {
  const fullPath = resolve(dir, file);
  const raw = readFileSync(fullPath, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);

  for (const line of lines) {
    try {
      allEvents.push(JSON.parse(line));
    } catch {
      allEvents.push({ parse_error: true, raw: line });
    }
  }
}

console.log(JSON.stringify(allEvents, null, 2));
