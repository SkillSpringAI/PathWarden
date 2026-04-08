import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateCommit } from "../../core/kernel/commitValidator";

const samplePath = resolve(process.cwd(), "Pathwarden/data/sample/sample-commit.json");
const raw = readFileSync(samplePath, "utf8");
const commit = JSON.parse(raw);

const result = validateCommit(commit);

console.log(JSON.stringify(result, null, 2));
