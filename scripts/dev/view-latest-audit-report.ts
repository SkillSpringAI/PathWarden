import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const exportsDir = resolve(process.cwd(), "Pathwarden", "audit", "exports");

if (!existsSync(exportsDir)) {
  console.log("No audit exports directory found.");
  process.exit(0);
}

const files = readdirSync(exportsDir)
  .filter(name => name.startsWith("audit-report-") && name.endsWith(".md"))
  .sort();

if (files.length === 0) {
  console.log("No human-readable audit reports found.");
  process.exit(0);
}

const latest = files[files.length - 1];
const fullPath = resolve(exportsDir, latest);
const raw = readFileSync(fullPath, "utf8");

console.log(raw);
