import { validateCapabilityGrant } from "../../core/kernel/capabilityGrantValidator";

interface ExpectedCase {
  name: string;
  app_id: string;
  tool_id: string;
  expected_ok: boolean;
  expected_decision_code: string;
  expected_requires_approval?: boolean;
}

const cases: ExpectedCase[] = [
  {
    name: "SkillSpring Quantum can create a draft task",
    app_id: "skillspring-quantum",
    tool_id: "task.createDraft",
    expected_ok: true,
    expected_decision_code: "ALLOW_CAPABILITY_GRANT",
    expected_requires_approval: true
  },
  {
    name: "SkillSpring Quantum can request a filesystem move but approval is required",
    app_id: "skillspring-quantum",
    tool_id: "filesystem.requestMove",
    expected_ok: true,
    expected_decision_code: "ALLOW_CAPABILITY_GRANT",
    expected_requires_approval: true
  },
  {
    name: "SkillSpring Quantum cannot request unregistered delete capability",
    app_id: "skillspring-quantum",
    tool_id: "filesystem.delete",
    expected_ok: false,
    expected_decision_code: "REFUSE_TOOL_NOT_REGISTERED"
  },
  {
    name: "Unknown app is refused",
    app_id: "unknown-app",
    tool_id: "task.createDraft",
    expected_ok: false,
    expected_decision_code: "REFUSE_APP_NOT_REGISTERED"
  },
  {
    name: "Risk above SkillSpring Quantum grant ceiling is refused",
    app_id: "skillspring-quantum",
    tool_id: "filesystem.requestMove",
    expected_ok: false,
    expected_decision_code: "REFUSE_RISK_CEILING_EXCEEDED"
  }
];

let failures = 0;

for (const testCase of cases) {
  const decision = validateCapabilityGrant({
    app_id: testCase.app_id,
    tool_id: testCase.tool_id,
    requested_risk_level:
      testCase.name === "Risk above SkillSpring Quantum grant ceiling is refused"
        ? "critical"
        : undefined
  });

  const okMatches = decision.ok === testCase.expected_ok;
  const decisionMatches = decision.decision_code === testCase.expected_decision_code;
  const approvalMatches =
    typeof testCase.expected_requires_approval !== "boolean" ||
    (decision.ok && decision.requires_approval === testCase.expected_requires_approval);

  const passed = okMatches && decisionMatches && approvalMatches;

  console.log(
    JSON.stringify(
      {
        test: testCase.name,
        passed,
        decision
      },
      null,
      2
    )
  );

  if (!passed) {
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`Capability grant tests failed: ${failures}`);
  process.exitCode = 1;
} else {
  console.log("Capability grant tests passed.");
}
