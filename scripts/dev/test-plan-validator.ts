import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validatePlan } from "../../core/kernel/planValidator";

const samplePath = resolve(process.cwd(), "Pathwarden/data/sample/sample-plan.json");
const raw = readFileSync(samplePath, "utf8");
const plan = JSON.parse(raw);

const result = validatePlan("core", plan);

console.log(JSON.stringify(result, null, 2));
