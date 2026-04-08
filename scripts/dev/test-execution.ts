import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validatePlan } from "../../core/kernel/planValidator";
import { executeCommittedPlan } from "../../core/executor/commitExecutor";

const planPath = resolve(process.cwd(), "Pathwarden/data/sample/sample-plan.json");
const commitPath = resolve(process.cwd(), "Pathwarden/data/sample/sample-commit.json");

const planRaw = readFileSync(planPath, "utf8");
const commitRaw = readFileSync(commitPath, "utf8");

const planInput = JSON.parse(planRaw);
const commitInput = JSON.parse(commitRaw);

const planCheck = validatePlan("core", planInput);

if (!planCheck.ok) {
  console.log("Plan refused:");
  console.log(JSON.stringify(planCheck.refusal, null, 2));
  process.exit(0);
}

const result = executeCommittedPlan("core", planCheck.plan, commitInput);

console.log(JSON.stringify(result, null, 2));
