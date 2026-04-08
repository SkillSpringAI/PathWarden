import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateAction } from "../../core/kernel/validator";

const samplePath = resolve(process.cwd(), "Pathwarden/data/sample/sample-action.json");
const raw = readFileSync(samplePath, "utf8");
const action = JSON.parse(raw);

const result = validateAction("core", action, false);

console.log(JSON.stringify(result, null, 2));
