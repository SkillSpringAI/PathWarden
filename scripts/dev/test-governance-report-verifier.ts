import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

type FixtureCase = {
  name: string;
  path: string;
  shouldPass: boolean;
};

const cases: FixtureCase[] = [
  {
    name: "valid incomplete governance report passes",
    path: "tests/fixtures/governance-report/valid-incomplete.json",
    shouldPass: true
  },
  {
    name: "release_safe overstated governance report fails",
    path: "tests/fixtures/governance-report/invalid-release-safe-overstated.json",
    shouldPass: false
  },
  {
    name: "missing artifacts governance report fails",
    path: "tests/fixtures/governance-report/invalid-missing-artifacts.json",
    shouldPass: false
  }
];

const failures: string[] = [];

for (const testCase of cases) {
  const absolutePath = resolve(process.cwd(), testCase.path);

  const result = spawnSync(
    "npx",
    [
      "tsx",
      "scripts/dev/verify-governance-report.ts",
      absolutePath
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      shell: process.platform === "win32"
    }
  );

  const passed = result.status === 0;

  if (passed !== testCase.shouldPass) {
    failures.push(
      [
        `Case failed: ${testCase.name}`,
        `Expected pass: ${testCase.shouldPass}`,
        `Actual pass: ${passed}`,
        `Exit status: ${result.status}`,
        `stdout: ${result.stdout.trim()}`,
        `stderr: ${result.stderr.trim()}`
      ].join("\n")
    );
  }
}

if (failures.length > 0) {
  console.error("Governance report verifier fixture tests failed:");
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  diagnostic: "governance-report-verifier-fixtures",
  cases: cases.length,
  passed: cases.length
}, null, 2));