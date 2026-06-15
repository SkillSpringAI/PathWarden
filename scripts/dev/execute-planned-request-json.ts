import { inspectDirectory } from "../../capabilities/filesystem/fsInspect";
import { summarizeDirectory } from "../../capabilities/filesystem/fsSummarize";
import { searchDirectory } from "../../capabilities/filesystem/fsSearch";

type ExecutionBridgeResult = {
  ok: boolean;
  type: "planned-request-execution";
  request: string;
  plan: {
    ok: boolean;
    capability: string;
    intent: string;
    mode: "read_only";
  };
  execution: unknown | null;
  message: string;
};

const request = process.argv.slice(2).join(" ");

function inferPath(text: string): string | null {
  const normalized = text.toLowerCase();

  if (normalized.includes("documents")) {
    return "C:\\Users\\Laptop\\Documents";
  }

  if (normalized.includes("downloads")) {
    return "C:\\Users\\Laptop\\Downloads";
  }

  return null;
}

function inferExtension(text: string): string | undefined {
  const normalized = text.toLowerCase();

  if (normalized.includes("txt")) return ".txt";
  if (normalized.includes("pdf")) return ".pdf";
  if (normalized.includes("docx")) return ".docx";
  if (normalized.includes("zip")) return ".zip";
  if (normalized.includes("ods")) return ".ods";

  return undefined;
}

function inferNameContains(text: string): string | undefined {
  const normalized = text.toLowerCase();

  const match = normalized.match(/(?:containing|contains|named|name contains|for)\s+["']?([a-z0-9 _-]+)["']?/i);

  if (!match?.[1]) return undefined;

  return match[1].trim();
}

function inferCapability(text: string): {
  ok: boolean;
  capability: string;
  intent: string;
  mode: "read_only";
} {
  const normalized = text.toLowerCase();

  if (normalized.includes("find") || normalized.includes("search")) {
    return {
      ok: true,
      capability: "filesystem.search",
      intent: "filesystem_search",
      mode: "read_only"
    };
  }

  if (normalized.includes("summarize") || normalized.includes("summary")) {
    return {
      ok: true,
      capability: "filesystem.summary",
      intent: "folder_summary",
      mode: "read_only"
    };
  }

  if (
    normalized.includes("inspect") ||
    normalized.includes("list") ||
    normalized.includes("show")
  ) {
    return {
      ok: true,
      capability: "filesystem.inspect",
      intent: "filesystem_inspection",
      mode: "read_only"
    };
  }

  return {
    ok: false,
    capability: "none",
    intent: "unknown",
    mode: "read_only"
  };
}

function buildResult(
  ok: boolean,
  request: string,
  plan: ExecutionBridgeResult["plan"],
  execution: unknown | null,
  message: string
): ExecutionBridgeResult {
  return {
    ok,
    type: "planned-request-execution",
    request,
    plan,
    execution,
    message
  };
}

if (!request) {
  console.log(
    JSON.stringify(
      buildResult(
        false,
        "",
        {
          ok: false,
          capability: "none",
          intent: "unknown",
          mode: "read_only"
        },
        null,
        "No request provided."
      ),
      null,
      2
    )
  );

  process.exit(1);
}

const plan = inferCapability(request);
const targetPath = inferPath(request);

if (!plan.ok) {
  console.log(
    JSON.stringify(
      buildResult(false, request, plan, null, "Request could not be planned into a supported read-only capability."),
      null,
      2
    )
  );

  process.exit(1);
}

if (!targetPath) {
  console.log(
    JSON.stringify(
      buildResult(false, request, plan, null, "No supported target folder found. Try Documents or Downloads."),
      null,
      2
    )
  );

  process.exit(1);
}

try {
  if (plan.capability === "filesystem.inspect") {
    const execution = inspectDirectory(targetPath);
    console.log(JSON.stringify(buildResult(execution.ok, request, plan, execution, "Inspection executed."), null, 2));
    process.exit(execution.ok ? 0 : 1);
  }

  if (plan.capability === "filesystem.summary") {
    const execution = summarizeDirectory(targetPath);
    console.log(JSON.stringify(buildResult(execution.ok, request, plan, execution, "Summary executed."), null, 2));
    process.exit(execution.ok ? 0 : 1);
  }

  if (plan.capability === "filesystem.search") {
    const execution = searchDirectory({
      path: targetPath,
      extension: inferExtension(request),
      nameContains: inferNameContains(request)
    });

    console.log(JSON.stringify(buildResult(execution.ok, request, plan, execution, "Search executed."), null, 2));
    process.exit(execution.ok ? 0 : 1);
  }

  console.log(JSON.stringify(buildResult(false, request, plan, null, "Capability is not executable by this bridge."), null, 2));
  process.exit(1);
} catch (error) {
  console.log(
    JSON.stringify(
      buildResult(
        false,
        request,
        plan,
        null,
        error instanceof Error ? error.message : String(error)
      ),
      null,
      2
    )
  );

  process.exit(1);
}