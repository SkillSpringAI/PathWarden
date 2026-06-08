import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  formatAjvErrors,
  getSchemaValidator
} from "../../core/common/schemaValidator";

interface FixtureSchemaCase {
  label: string;
  fixturePath: string;
  schemaPath: string;
}

const cases: FixtureSchemaCase[] = [
  {
    label: "valid incomplete governance report",
    fixturePath: "tests/fixtures/governance-report/valid-incomplete.json",
    schemaPath: "schemas/audit/governance-report.schema.json"
  },
  {
    label: "valid incomplete replay provenance report",
    fixturePath: "tests/fixtures/replay-provenance-report/valid-incomplete.json",
    schemaPath: "schemas/audit/replay-provenance-report.schema.json"
  },
  {
    label: "valid not-ready federation readiness audit",
    fixturePath: "tests/fixtures/federation-readiness-audit/valid-not-ready.json",
    schemaPath: "schemas/audit/federation-readiness-audit.schema.json"
  },
  {
    label: "valid replay baseline input",
    fixturePath: "tests/fixtures/replay-inputs/replay-baseline.valid.json",
    schemaPath: "schemas/audit/replay-baseline.schema.json"
  },
  {
    label: "valid replay diff input",
    fixturePath: "tests/fixtures/replay-inputs/replay-diff.valid.json",
    schemaPath: "schemas/audit/replay-diff.schema.json"
  }
];

function readJson(path: string): unknown {
  return JSON.parse(
    readFileSync(resolve(process.cwd(), path), "utf8")
  );
}

const failures: string[] = [];

for (const testCase of cases) {
  const fixture = readJson(testCase.fixturePath);
  const validator = getSchemaValidator(testCase.schemaPath);
  const valid = validator(fixture);

  if (!valid) {
    failures.push(
      `${testCase.label}: ${formatAjvErrors(validator.errors)}`
    );
  }
}

if (failures.length > 0) {
  console.error("Report fixture schema validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  test: "report-fixture-schema-validation",
  checked: cases.length,
  fixtures: cases.map((testCase) => testCase.fixturePath)
}, null, 2));
