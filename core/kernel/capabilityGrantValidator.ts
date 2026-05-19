import { loadConfigFile } from "../common/configLoader";
import type { RiskLevel } from "./types";
import type { PermissionToken } from "./permissionToken";
import { mintPermissionToken } from "./permissionTokenBuilder";
import type { DecisionLegitimacyArtifact } from "./legitimacyArtifact";
import { buildDecisionLegitimacyArtifact } from "./legitimacyArtifactBuilder";

type RegistryStatus = "enabled" | "disabled";

type DenialDecisionCode =
  | "REFUSE_APP_NOT_REGISTERED"
  | "REFUSE_APP_DISABLED"
  | "REFUSE_TOOL_NOT_REGISTERED"
  | "REFUSE_TOOL_DISABLED"
  | "REFUSE_GRANT_NOT_FOUND"
  | "REFUSE_GRANT_DISABLED"
  | "REFUSE_TOOL_NOT_GRANTED"
  | "REFUSE_RISK_CEILING_EXCEEDED";

interface RegisteredApp {
  app_id: string;
  display_name: string;
  kind: string;
  status: RegistryStatus;
  description?: string;
}

interface AppRegistry {
  schema_version: string;
  updated_at: string;
  apps: RegisteredApp[];
}

interface RegisteredTool {
  tool_id: string;
  category: string;
  status: RegistryStatus;
  risk_level: RiskLevel;
  requires_approval: boolean;
  audit_required: boolean;
  description?: string;
}

interface ToolRegistry {
  schema_version: string;
  updated_at: string;
  tools: RegisteredTool[];
}

interface AppGrant {
  grant_id: string;
  app_id: string;
  status: RegistryStatus;
  risk_ceiling: RiskLevel;
  requires_approval: boolean;
  audit_required: boolean;
  tool_ids: string[];
}

interface AppGrants {
  schema_version: string;
  updated_at: string;
  grants: AppGrant[];
}

export interface CapabilityGrantRequest {
  app_id: string;
  tool_id: string;
  requested_risk_level?: RiskLevel;
}

export type CapabilityGrantDecision =
  | {
      ok: true;
      decision_code: "ALLOW_CAPABILITY_GRANT";
      app_id: string;
      tool_id: string;
      risk_level: RiskLevel;
      requires_approval: boolean;
      audit_required: boolean;
      grant_id: string;
      permission_token: PermissionToken;
      legitimacy_artifact: DecisionLegitimacyArtifact;
    }
  | {
      ok: false;
      decision_code: DenialDecisionCode;
      refusal_code: "PW-GRANT-001";
      message: string;
      app_id: string;
      tool_id: string;
      trigger_hits: string[];
      audit_required: true;
    };

const riskRank: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

function loadAppRegistry(): AppRegistry {
  return loadConfigFile<AppRegistry>("policy/registry/app-registry.json");
}

function loadToolRegistry(): ToolRegistry {
  return loadConfigFile<ToolRegistry>("policy/registry/tool-registry.json");
}

function loadAppGrants(): AppGrants {
  return loadConfigFile<AppGrants>("policy/grants/app-grants.json");
}

function deny(
  decisionCode: DenialDecisionCode,
  message: string,
  appId: string,
  toolId: string,
  triggerHits: string[]
): CapabilityGrantDecision {
  return {
    ok: false,
    decision_code: decisionCode,
    refusal_code: "PW-GRANT-001",
    message,
    app_id: appId,
    tool_id: toolId,
    trigger_hits: triggerHits,
    audit_required: true
  };
}

export function validateCapabilityGrant(request: CapabilityGrantRequest): CapabilityGrantDecision {
  const appRegistry = loadAppRegistry();
  const toolRegistry = loadToolRegistry();
  const appGrants = loadAppGrants();

  const app = appRegistry.apps.find((candidate) => candidate.app_id === request.app_id);
  if (!app) {
    return deny(
      "REFUSE_APP_NOT_REGISTERED",
      `App is not registered: ${request.app_id}`,
      request.app_id,
      request.tool_id,
      ["app_not_registered"]
    );
  }

  if (app.status !== "enabled") {
    return deny(
      "REFUSE_APP_DISABLED",
      `App is disabled: ${request.app_id}`,
      request.app_id,
      request.tool_id,
      ["app_disabled"]
    );
  }

  const tool = toolRegistry.tools.find((candidate) => candidate.tool_id === request.tool_id);
  if (!tool) {
    return deny(
      "REFUSE_TOOL_NOT_REGISTERED",
      `Tool is not registered: ${request.tool_id}`,
      request.app_id,
      request.tool_id,
      ["tool_not_registered"]
    );
  }

  if (tool.status !== "enabled") {
    return deny(
      "REFUSE_TOOL_DISABLED",
      `Tool is disabled: ${request.tool_id}`,
      request.app_id,
      request.tool_id,
      ["tool_disabled"]
    );
  }

  const grant = appGrants.grants.find((candidate) => candidate.app_id === request.app_id);
  if (!grant) {
    return deny(
      "REFUSE_GRANT_NOT_FOUND",
      `No grant found for app: ${request.app_id}`,
      request.app_id,
      request.tool_id,
      ["grant_not_found"]
    );
  }

  if (grant.status !== "enabled") {
    return deny(
      "REFUSE_GRANT_DISABLED",
      `Grant is disabled for app: ${request.app_id}`,
      request.app_id,
      request.tool_id,
      ["grant_disabled"]
    );
  }

  if (!grant.tool_ids.includes(request.tool_id)) {
    return deny(
      "REFUSE_TOOL_NOT_GRANTED",
      `Tool is not granted to app: ${request.tool_id}`,
      request.app_id,
      request.tool_id,
      ["tool_not_granted"]
    );
  }

  const effectiveRisk = request.requested_risk_level ?? tool.risk_level;
  if (riskRank[effectiveRisk] > riskRank[grant.risk_ceiling]) {
    return deny(
      "REFUSE_RISK_CEILING_EXCEEDED",
      `Requested risk ${effectiveRisk} exceeds grant ceiling ${grant.risk_ceiling}.`,
      request.app_id,
      request.tool_id,
      ["risk_ceiling_exceeded"]
    );
  }

  const requiresApproval =
    tool.requires_approval || grant.requires_approval;

  const auditRequired =
    tool.audit_required || grant.audit_required;

  const traceId = `trace_capability_${Date.now()}`;

  const permissionToken = mintPermissionToken({
    trace_id: traceId,
    app_id: request.app_id,
    tool_id: request.tool_id,
    granted_operations: [request.tool_id],
    risk_ceiling: effectiveRisk,
    requires_approval: requiresApproval,
    audit_required: auditRequired,
    issuer: "pathwarden-kernel",
    expires_at: "2030-01-01T00:00:00.000Z"
  });

  const legitimacyArtifact = buildDecisionLegitimacyArtifact({
    trace_id: traceId,
    mode: "core",
    decision_code: "ALLOW_CAPABILITY_GRANT",
    invariant_checks: ["INV-006"],
    trigger_hits: ["capability_grant_checked"],
    approval_state: requiresApproval ? "required_pending" : "not_required",
    authority_chain: [
      "pathwarden-kernel",
      grant.grant_id,
      permissionToken.token_id,
      "capability-grant-validator"
    ],
    capability_source: permissionToken.token_id,
    risk_level: effectiveRisk,
    audit_required: auditRequired
  });

  return {
    ok: true,
    decision_code: "ALLOW_CAPABILITY_GRANT",
    app_id: request.app_id,
    tool_id: request.tool_id,
    risk_level: effectiveRisk,
    requires_approval: requiresApproval,
    audit_required: auditRequired,
    grant_id: grant.grant_id,
    permission_token: permissionToken,
    legitimacy_artifact: legitimacyArtifact
  };
}




