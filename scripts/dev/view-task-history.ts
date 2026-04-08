import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const historyDir = resolve(process.cwd(), "Pathwarden", "tasks", "history");

if (!existsSync(historyDir)) {
  console.log("No task history directory found.");
  process.exit(0);
}

const files = readdirSync(historyDir)
  .filter(name => name.endsWith(".result.json"))
  .sort();

if (files.length === 0) {
  console.log("No task history found.");
  process.exit(0);
}

const results = files.map(name => {
  const fullPath = resolve(historyDir, name);
  return JSON.parse(readFileSync(fullPath, "utf8"));
});

console.log(JSON.stringify(results, null, 2));
