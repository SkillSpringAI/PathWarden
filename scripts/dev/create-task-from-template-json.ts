import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { makeId } from "../../core/common/ids";
import { nowIso } from "../../core/common/time";
import { saveTask } from "../../core/tasks/taskStore";

const templateId = process.argv[2];

if (!templateId) {
  console.log(JSON.stringify({
    ok: false,
    type: "task-template-create",
    message: "Missing template id."
  }, null, 2));
  process.exit(0);
}

const path = resolve(process.cwd(), "Pathwarden", "tasks", "templates", "default-tasks.json");

if (!existsSync(path)) {
  console.log(JSON.stringify({
    ok: false,
    type: "task-template-create",
    message: "Default task template file not found."
  }, null, 2));
  process.exit(0);
}

const data = JSON.parse(readFileSync(path, "utf8"));
const template = (data.templates || []).find((t: any) => t.id === templateId);

if (!template) {
  console.log(JSON.stringify({
    ok: false,
    type: "task-template-create",
    message: "Template not found."
  }, null, 2));
  process.exit(0);
}

const task = {
  task_id: makeId("task"),
  name: template.name,
  description: template.description,
  type: template.type,
  mode: template.mode,
  status: "pending",
  created_at: nowIso(),
  requires_confirmation: template.requires_confirmation,
  approved: template.approved,
  auto_run: template.auto_run
};

saveTask(task as any);

console.log(JSON.stringify({
  ok: true,
  type: "task-template-create",
  message: "Task created from template.",
  task
}, null, 2));
