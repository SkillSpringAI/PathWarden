type RequestPlan = {
  ok: boolean;
  type: "request-plan";
  request: string;
  intent: string;
  capability: string;
  mode: "read_only";
  risk: "low" | "medium" | "unknown";
  execution_status: "not_executed";
  boundary: string;
  next_step: string;
};

function planUserRequest(request: string): RequestPlan {
  const normalized = request.toLowerCase().trim();

  if (normalized.includes("pdf") && normalized.includes("modified")) {
    return makePlan(request, "filesystem_search", "filesystem.search", "low");
  }

  if (normalized.includes("large") && normalized.includes("files")) {
    return makePlan(request, "filesystem_inspection", "filesystem.read", "low");
  }

  if (normalized.includes("list") && normalized.includes("folders")) {
    return makePlan(request, "folder_listing", "filesystem.read", "low");
  }

  if (normalized.includes("duplicate")) {
    return makePlan(request, "duplicate_filename_review", "filesystem.search", "medium");
  }

  if (normalized.includes("summarize") && normalized.includes("folder")) {
    return makePlan(request, "folder_summary", "filesystem.read", "low");
  }

  return makePlan(request, "unknown", "none", "unknown");
}

function makePlan(
  request: string,
  intent: string,
  capability: string,
  risk: "low" | "medium" | "unknown"
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
    boundary: "Planning only. No filesystem access, execution, mutation, approval, or policy change occurred.",
    next_step:
      capability === "none"
        ? "Refine the request into a supported read-only file workflow."
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