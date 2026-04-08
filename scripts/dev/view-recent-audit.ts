import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type AuditEvent = {
  timestamp?: string;
  outcome?: string;
  mode?: string;
  decision_code?: string;
  refusal_code?: string;
  risk_level?: string;
  message?: string;
};

const eventsDir = resolve(process.cwd(), "Pathwarden", "audit", "events");

if (!existsSync(eventsDir)) {
  console.log("No audit events directory found.");
  process.exit(0);
}

const files = readdirSync(eventsDir)
  .filter(name => name.endsWith(".jsonl"))
  .sort();

const events: AuditEvent[] = [];

for (const file of files) {
  const fullPath = resolve(eventsDir, file);
  const raw = readFileSync(fullPath, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);

  for (const line of lines) {
    try {
      events.push(JSON.parse(line));
    } catch {
      events.push({
        outcome: "failed",
        decision_code: "AUDIT_PARSE_ERROR",
        message: "Failed to parse audit line"
      });
    }
  }
}

const recent = events.slice(-10);

if (recent.length === 0) {
  console.log("No audit events found.");
  process.exit(0);
}

console.log("Recent Pathwarden Audit Events");
console.log("");

recent.forEach((event, index) => {
  console.log(`Event ${index + 1}`);
  console.log(`  Timestamp: ${event.timestamp ?? "N/A"}`);
  console.log(`  Outcome: ${event.outcome ?? "N/A"}`);
  console.log(`  Mode: ${event.mode ?? "N/A"}`);
  console.log(`  Decision: ${event.decision_code ?? "N/A"}`);
  console.log(`  Refusal: ${event.refusal_code ?? "N/A"}`);
  console.log(`  Risk: ${event.risk_level ?? "N/A"}`);
  console.log(`  Message: ${event.message ?? "N/A"}`);
  console.log("");
});
