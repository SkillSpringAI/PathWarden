import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

type AuditEvent = {
  event_id?: string;
  timestamp?: string;
  mode?: string;
  decision_code?: string;
  refusal_code?: string;
  outcome?: string;
  trigger_hits?: string[];
  risk_level?: string;
  message?: string;
  plan_id?: string;
  commit_id?: string;
};

const eventsDir = resolve(process.cwd(), "Pathwarden", "audit", "events");
const exportsDir = resolve(process.cwd(), "Pathwarden", "audit", "exports");

if (!existsSync(eventsDir)) {
  console.log("No audit events directory found.");
  process.exit(0);
}

if (!existsSync(exportsDir)) {
  mkdirSync(exportsDir, { recursive: true });
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

const generatedAt = new Date().toISOString();

const counts = {
  total: events.length,
  allowed: events.filter(e => e.outcome === "allowed").length,
  refused: events.filter(e => e.outcome === "refused").length,
  executed: events.filter(e => e.outcome === "executed").length,
  failed: events.filter(e => e.outcome === "failed").length,
  low: events.filter(e => e.risk_level === "low").length,
  medium: events.filter(e => e.risk_level === "medium").length,
  high: events.filter(e => e.risk_level === "high").length,
  critical: events.filter(e => e.risk_level === "critical").length
};

const lines: string[] = [];

lines.push("# Pathwarden Audit Report");
lines.push("");
lines.push(`Generated: ${generatedAt}`);
lines.push("");
lines.push("## Summary");
lines.push("");
lines.push(`- Total events: ${counts.total}`);
lines.push(`- Allowed: ${counts.allowed}`);
lines.push(`- Refused: ${counts.refused}`);
lines.push(`- Executed: ${counts.executed}`);
lines.push(`- Failed: ${counts.failed}`);
lines.push("");
lines.push("## Risk Breakdown");
lines.push("");
lines.push(`- Low: ${counts.low}`);
lines.push(`- Medium: ${counts.medium}`);
lines.push(`- High: ${counts.high}`);
lines.push(`- Critical: ${counts.critical}`);
lines.push("");
lines.push("## Event Details");
lines.push("");

if (events.length === 0) {
  lines.push("No audit events found.");
} else {
  events.forEach((event, index) => {
    lines.push(`### Event ${index + 1}`);
    lines.push("");
    lines.push(`- Timestamp: ${event.timestamp ?? "N/A"}`);
    lines.push(`- Outcome: ${event.outcome ?? "N/A"}`);
    lines.push(`- Mode: ${event.mode ?? "N/A"}`);
    lines.push(`- Decision Code: ${event.decision_code ?? "N/A"}`);
    lines.push(`- Refusal Code: ${event.refusal_code ?? "N/A"}`);
    lines.push(`- Risk Level: ${event.risk_level ?? "N/A"}`);
    lines.push(`- Message: ${event.message ?? "N/A"}`);
    lines.push(`- Trigger Hits: ${(event.trigger_hits ?? []).join(", ") || "None"}`);
    lines.push(`- Plan ID: ${event.plan_id ?? "N/A"}`);
    lines.push(`- Commit ID: ${event.commit_id ?? "N/A"}`);
    lines.push("");
  });
}

const outPath = resolve(exportsDir, `audit-report-${generatedAt.replace(/[:.]/g, "-")}.md`);
writeFileSync(outPath, lines.join("\n"), "utf8");

console.log(lines.join("\n"));
console.log("");
console.log(`Human-readable audit report written to: ${outPath}`);
