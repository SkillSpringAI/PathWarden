type WorkflowStatus = "planned" | "partial_workflow_available";

type RequestPlan = {
  ok: boolean;
  type: "request-plan";
  request: string;
  intent: string;
  capability: string;
  mode: "read_only";
  risk: "low" | "medium" | "unknown";
  execution_status: "not_executed";
  workflow_status: WorkflowStatus;
  boundary: string;
  next_step: string;
};

function planUserRequest(request: string): RequestPlan {
  const normalized = request.toLowerCase().trim();

  if (normalized.includes("find") || normalized.includes("search")) {
    return makePlan(request, "filesystem_search", "filesystem.search", "low");
  }

  if (normalized.includes("summarize") || normalized.includes("summary")) {
    return makePlan(request, "folder_summary", "filesystem.summary", "low");
  }

  if (
    normalized.includes("inspect") ||
    normalized.includes("list") ||
    normalized.includes("show")
  ) {
    return makePlan(request, "filesystem_inspection", "filesystem.inspect", "low");
  }

  if (normalized.includes("large") && normalized.includes("files")) {
    return makePlan(request, "filesystem_search", "filesystem.search", "low");
  }

  if (normalized.includes("duplicate")) {
    return makePlan(
      request,
      "duplicate_filename_review",
      "filesystem.search",
      "medium",
      "partial_workflow_available"
    );
  }

  return makePlan(request, "unknown", "none", "unknown");
}

function makePlan(
  request: string,
  intent: string,
  capability: string,
  risk: "low" | "medium" | "unknown",
  workflowStatus: WorkflowStatus = "planned"
): RequestPlan {
  return {
    ok: capability !== "none",
    type: "request-plan",
    request,
    intent,
    capability,
    mode: "read_only",
    risk,
    execution_status: "not_executed",
    workflow_status: workflowStatus,
    boundary: "Planning only. No filesystem access, execution, mutation, approval, or policy change occurred.",
    next_step:
      capability === "none"
        ? "Refine the request into a supported read-only file workflow."
        : workflowStatus === "partial_workflow_available"
          ? "A partial workflow is available. Review the planned capability before execution."
          : "Review the planned capability before any future execution step."
  };
}

const request = process.argv.slice(2).join(" ");

if (!request) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        type: "request-plan",
        message: "No request text provided."
      },
      null,
      2
    )
  );
  process.exit(1);
}

console.log(JSON.stringify(planUserRequest(request), null, 2));
