import { spawnSync } from "node:child_process";
import path from "node:path";

type ExpectedPlan = {
  request: string;
  intent: string;
  capability: string;
  risk: string;
};

const repoRoot = process.cwd();
const tsxPath = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const plannerPath = path.join(repoRoot, "scripts", "dev", "plan-user-request-json.ts");

const cases: ExpectedPlan[] = [
  {
    request: "Find txt files in Documents",
    intent: "filesystem_search",
    capability: "filesystem.search",
    risk: "low"
  },
  {
    request: "Search Documents for skill",
    intent: "filesystem_search",
    capability: "filesystem.search",
    risk: "low"
  },
  {
    request: "Summarize Documents",
    intent: "folder_summary",
    capability: "filesystem.summary",
    risk: "low"
  },
  {
    request: "Inspect Documents",
    intent: "filesystem_inspection",
    capability: "filesystem.inspect",
    risk: "low"
  },
  {
    request: "Show me what is in Documents",
    intent: "filesystem_inspection",
    capability: "filesystem.inspect",
    risk: "low"
  },
  {
    request: "Find duplicate-looking filenames",
    intent: "filesystem_search",
    capability: "filesystem.search",
    risk: "low"
  }
];

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

for (const testCase of cases) {
  const result = spawnSync(
    "node",
    [tsxPath, plannerPath, testCase.request],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true
    }
  );

  if (result.status !== 0) {
    fail(`Planner exited with ${result.status} for "${testCase.request}". STDERR: ${result.stderr}`);
  }

  let parsed: any;

  try {
    parsed = JSON.parse(result.stdout);
  } catch {
    fail(`Planner did not return JSON for "${testCase.request}". STDOUT: ${result.stdout}`);
  }

  if (parsed.type !== "request-plan") fail(`Wrong type for "${testCase.request}".`);
  if (parsed.intent !== testCase.intent) fail(`Wrong intent for "${testCase.request}". Got ${parsed.intent}.`);
  if (parsed.capability !== testCase.capability) fail(`Wrong capability for "${testCase.request}". Got ${parsed.capability}.`);
  if (parsed.risk !== testCase.risk) fail(`Wrong risk for "${testCase.request}". Got ${parsed.risk}.`);
  if (parsed.mode !== "read_only") fail(`Mode was not read_only for "${testCase.request}".`);
  if (parsed.execution_status !== "not_executed") fail(`Planner executed something for "${testCase.request}".`);
  if (parsed.capability === "filesystem.write") fail(`Planner returned unimplemented filesystem.write for "${testCase.request}".`);
}

console.log(JSON.stringify({
  ok: true,
  type: "user-request-planner-test",
  cases: cases.length,
  message: "User request planner fixtures passed."
}, null, 2));
