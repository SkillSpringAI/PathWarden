import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(process.cwd(), "Pathwarden", "tasks", "templates", "default-tasks.json");

if (!existsSync(path)) {
  console.log(JSON.stringify({
    ok: false,
    type: "default-tasks",
    message: "Default task template file not found.",
    templates: []
  }, null, 2));
  process.exit(0);
}

const data = JSON.parse(readFileSync(path, "utf8"));

console.log(JSON.stringify({
  ok: true,
  type: "default-tasks",
  message: "Default task templates loaded.",
  templates: data.templates || []
}, null, 2));
