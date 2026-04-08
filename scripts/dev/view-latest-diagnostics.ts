import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const reportsDir = resolve(process.cwd(), "Pathwarden", "diagnostics", "reports");

if (!existsSync(reportsDir)) {
  console.log("No diagnostics reports directory found.");
  process.exit(0);
}

const files = readdirSync(reportsDir)
  .filter(name => name.endsWith(".json"))
  .sort();

if (files.length === 0) {
  console.log("No diagnostics reports found.");
  process.exit(0);
}

const latest = files[files.length - 1];
const fullPath = resolve(reportsDir, latest);
const raw = readFileSync(fullPath, "utf8");

console.log(raw);
