import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const eventsDir = resolve(process.cwd(), "Pathwarden", "audit", "events");
const exportsDir = resolve(process.cwd(), "Pathwarden", "audit", "exports");

if (!existsSync(eventsDir)) {
  console.log("No audit events directory found.");
  process.exit(0);
}

if (!existsSync(exportsDir)) {
  mkdirSync(exportsDir, { recursive: true });
}

const files = readdirSync(eventsDir).filter(name => name.endsWith(".jsonl")).sort();

const events: any[] = [];

for (const file of files) {
  const fullPath = resolve(eventsDir, file);
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

const summary = {
  generated_at: new Date().toISOString(),
  total_events: events.length,
  refused: events.filter(e => e.outcome === "refused").length,
  allowed: events.filter(e => e.outcome === "allowed").length,
  executed: events.filter(e => e.outcome === "executed").length,
  failed: events.filter(e => e.outcome === "failed").length,
  high_risk_or_critical: events.filter(e => e.risk_level === "high" || e.risk_level === "critical").length,
  events
};

const outPath = resolve(exportsDir, `audit-summary-${summary.generated_at.replace(/[:.]/g, "-")}.json`);
writeFileSync(outPath, JSON.stringify(summary, null, 2), "utf8");

console.log(JSON.stringify(summary, null, 2));
console.log(`Audit summary written to: ${outPath}`);
