import { spawnSync } from "node:child_process";
import path from "node:path";

type BridgeCase = {
  request: string;
  expectedCapability: string;
  expectedExecutionType?: string;
  shouldSucceed: boolean;
};

const repoRoot = process.cwd();
const tsxPath = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const bridgePath = path.join(repoRoot, "scripts", "dev", "execute-planned-request-json.ts");

const cases: BridgeCase[] = [
  {
    request: "Find txt files in Documents",
    expectedCapability: "filesystem.search",
    expectedExecutionType: "filesystem-search",
    shouldSucceed: true
  },
  {
    request: "Summarize Documents",
    expectedCapability: "filesystem.summary",
    expectedExecutionType: "filesystem-summary",
    shouldSucceed: true
  },
  {
    request: "Inspect Documents",
    expectedCapability: "filesystem.inspect",
    expectedExecutionType: "filesystem-inspect",
    shouldSucceed: true
  },
  {
    request: "Dance around the moon",
    expectedCapability: "none",
    shouldSucceed: false
  }
];

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

for (const testCase of cases) {
  const result = spawnSync(
    "node",
    [tsxPath, bridgePath, testCase.request],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: true
    }
  );

  if (testCase.shouldSucceed && result.status !== 0) {
    fail(`Expected success for "${testCase.request}" but exited ${result.status}. STDERR: ${result.stderr}`);
  }

  if (!testCase.shouldSucceed && result.status === 0) {
    fail(`Expected refusal for "${testCase.request}" but command succeeded.`);
  }

  let parsed: any;

  try {
    parsed = JSON.parse(result.stdout);
  } catch {
    fail(`Bridge did not return JSON for "${testCase.request}". STDOUT: ${result.stdout}`);
  }

  if (parsed.type !== "planned-request-execution") {
    fail(`Wrong bridge type for "${testCase.request}".`);
  }

  if (parsed.plan?.capability !== testCase.expectedCapability) {
    fail(
      `Wrong capability for "${testCase.request}". Expected ${testCase.expectedCapability}, got ${parsed.plan?.capability}.`
    );
  }

  if (testCase.shouldSucceed) {
    if (!parsed.ok) fail(`Bridge result was not ok for "${testCase.request}".`);
    if (!parsed.execution) fail(`Missing execution result for "${testCase.request}".`);
    if (parsed.execution.type !== testCase.expectedExecutionType) {
      fail(
        `Wrong execution type for "${testCase.request}". Expected ${testCase.expectedExecutionType}, got ${parsed.execution.type}.`
      );
    }
  }

  if (!testCase.shouldSucceed) {
    if (parsed.ok) fail(`Unsupported request returned ok for "${testCase.request}".`);
    if (parsed.execution !== null) fail(`Unsupported request should not execute anything.`);
  }
}

console.log(JSON.stringify({
  ok: true,
  type: "planner-execution-bridge-test",
  cases: cases.length,
  message: "Planner execution bridge checks passed."
}, null, 2));
