import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const reportsDir = resolve(process.cwd(), "Pathwarden", "diagnostics", "reports");

if (!existsSync(reportsDir)) {
  console.log(JSON.stringify({
    ok: false,
    type: "diagnostics",
    message: "No diagnostics reports directory found.",
    report: null
  }, null, 2));
  process.exit(0);
}

const files = readdirSync(reportsDir)
  .filter(name => name.endsWith(".json"))
  .sort();

if (files.length === 0) {
  console.log(JSON.stringify({
    ok: false,
    type: "diagnostics",
    message: "No diagnostics reports found.",
    report: null
  }, null, 2));
  process.exit(0);
}

const latest = files[files.length - 1];
const fullPath = resolve(reportsDir, latest);
const raw = readFileSync(fullPath, "utf8");
const report = JSON.parse(raw);

console.log(JSON.stringify({
  ok: true,
  type: "diagnostics",
  message: "Latest diagnostics report loaded.",
  report
}, null, 2));
