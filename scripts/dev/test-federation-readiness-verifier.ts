import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

type FixtureCase = {
  name: string;
  path: string;
  shouldPass: boolean;
};

const cases: FixtureCase[] = [
  {
    name: "valid not-ready federation readiness audit passes",
    path: "tests/fixtures/federation-readiness-audit/valid-not-ready.json",
    shouldPass: true
  },
  {
    name: "ready overstated federation readiness audit fails",
    path: "tests/fixtures/federation-readiness-audit/invalid-ready-overstated.json",
    shouldPass: false
  },
  {
    name: "missing requirements federation readiness audit fails",
    path: "tests/fixtures/federation-readiness-audit/invalid-missing-requirements.json",
    shouldPass: false
  },
  {
    name: "runtime field federation readiness audit fails",
    path: "tests/fixtures/federation-readiness-audit/invalid-runtime-field.json",
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
      "scripts/dev/verify-federation-readiness-audit.ts",
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
  console.error("Federation readiness verifier fixture tests failed:");
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  diagnostic: "federation-readiness-verifier-fixtures",
  cases: cases.length,
  passed: cases.length
}, null, 2));