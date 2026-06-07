import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

type FixtureCase = {
  name: string;
  path: string;
  shouldPass: boolean;
};

const cases: FixtureCase[] = [
  {
    name: "valid incomplete replay provenance report passes",
    path: "tests/fixtures/replay-provenance-report/valid-incomplete.json",
    shouldPass: true
  },
  {
    name: "missing baseline lineage gap fails",
    path: "tests/fixtures/replay-provenance-report/invalid-missing-baseline-gap.json",
    shouldPass: false
  },
  {
    name: "admissible overstated replay provenance report fails",
    path: "tests/fixtures/replay-provenance-report/invalid-admissible-overstated.json",
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
      "scripts/dev/verify-replay-provenance-report.ts",
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
  console.error("Replay provenance verifier fixture tests failed:");
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  diagnostic: "replay-provenance-verifier-fixtures",
  cases: cases.length,
  passed: cases.length
}, null, 2));