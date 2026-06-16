const statusText = document.getElementById("statusText");
const outputText = document.getElementById("outputText");
const cardContainer = document.getElementById("cardContainer");
const viewTitle = document.getElementById("viewTitle");
const bridgeText = document.getElementById("bridgeText");

/* PATHWARDEN:API_HELPERS:START */
function getAPI() {
  return window.pathwardenAPI || null;
}

function setStatus(message) {
  statusText.textContent = message;
}

function setOutput(message) {
  outputText.textContent = message;
}

function clearCards() {
  cardContainer.innerHTML = "";
}
/* PATHWARDEN:API_HELPERS:END */

/* PATHWARDEN:CARD_HELPERS:START */
function makeCard(title, bodyLines = []) {
  const card = document.createElement("div");
  card.className = "data-card";

  const h3 = document.createElement("h3");
  h3.textContent = title;
  card.appendChild(h3);

  for (const line of bodyLines) {
    const p = document.createElement("p");
    p.textContent = line;
    card.appendChild(p);
  }

  return card;
}

function showBridgeError(actionName) {
  clearCards();
  viewTitle.textContent = "Bridge Error";
  cardContainer.appendChild(
    makeCard("Desktop bridge unavailable", [
      `Action: ${actionName}`,
      "window.pathwardenAPI is undefined.",
      "Check preload.cjs, main.cjs preload path, and restart Electron."
    ])
  );
  setStatus("Desktop bridge unavailable");
  bridgeText.textContent = "Unavailable";
  setOutput("Bridge error: window.pathwardenAPI is undefined.");
}
/* PATHWARDEN:CARD_HELPERS:END */

/* PATHWARDEN:RENDERERS:START */
function renderDiagnostics(data) {
  clearCards();
  viewTitle.textContent = "Diagnostics";

  if (!data?.report) {
    cardContainer.appendChild(makeCard("No diagnostics report", [data?.message || "Nothing to show."]));
    return;
  }

  const report = data.report;

  cardContainer.appendChild(
    makeCard("Diagnostics Summary", [
      `Overall Status: ${report.overall_status}`,
      `Run ID: ${report.run_id}`,
      `Timestamp: ${report.timestamp}`,
      `Checks: ${Array.isArray(report.results) ? report.results.length : 0}`
    ])
  );

  (report.results || []).forEach((result) => {
    cardContainer.appendChild(
      makeCard(`${result.id} - ${result.name}`, [
        `Severity: ${result.severity}`,
        `Status: ${result.status}`,
        `Detail: ${result.detail}`
      ])
    );
  });
}

function renderTasks(data) {
  clearCards();
  viewTitle.textContent = "Tasks / Approval Queue";

  const tasks = data?.tasks || [];

  cardContainer.appendChild(
    makeCard("Approval Boundary", [
      "This view is experimental / advanced.",
      "User approval does not bypass policy or executor checks.",
      "Run is only valid when the current task state and kernel policy allow it."
    ])
  );

  if (tasks.length === 0) {
    cardContainer.appendChild(makeCard("No queued tasks", [data?.message || "Nothing queued."]));
    return;
  }

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "data-card";

    const title = document.createElement("h3");
    title.textContent = task.name || "Unnamed Task";
    card.appendChild(title);

    const details = [
      `Task ID: ${task.task_id}`,
      `Type: ${task.type}`,
      `Status: ${task.status}`,
      `Mode: ${task.mode}`,
      `Requires Confirmation: ${task.requires_confirmation ? "Yes" : "No"}`,
      `Approved: ${task.approved ? "Yes" : "No"}`,
      `Auto Run: ${task.auto_run ? "Yes" : "No"}`,
      `Scheduled For: ${task.scheduled_for || "N/A"}`
    ];

    details.forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      card.appendChild(p);
    });

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const approveBtn = document.createElement("button");
    approveBtn.textContent = "Approve once";
    approveBtn.onclick = async () => {
      const api = getAPI();
      if (!api?.approveTask) return showBridgeError("approveTask");
      await runAction("Approve Task Once", () => api.approveTask(task.task_id));
      await runAction("Tasks / Approval Queue", () => api.viewTasks());
    };

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Deny / Cancel";
    cancelBtn.onclick = async () => {
      const api = getAPI();
      if (!api?.cancelTask) return showBridgeError("cancelTask");
      await runAction("Deny / Cancel Task", () => api.cancelTask(task.task_id));
      await runAction("Tasks / Approval Queue", () => api.viewTasks());
    };

    const runBtn = document.createElement("button");
    runBtn.textContent = "Run approved task";
    runBtn.onclick = async () => {
      const api = getAPI();
      if (!api?.runTask) return showBridgeError("runTask");
      await runAction("Run Approved Task", () => api.runTask(task.task_id));
      await runAction("Tasks / Approval Queue", () => api.viewTasks());
    };

    actions.appendChild(approveBtn);
    actions.appendChild(cancelBtn);
    actions.appendChild(runBtn);

    card.appendChild(actions);
    cardContainer.appendChild(card);
  });
}

function renderAudit(data) {
  clearCards();
  viewTitle.textContent = "Recent Audit";

  const events = data?.events || [];
  if (events.length === 0) {
    cardContainer.appendChild(makeCard("No audit events", [data?.message || "No recent audit data."]));
    return;
  }

  events.slice().reverse().forEach((event) => {
    cardContainer.appendChild(
      makeCard(event.decision_code || "Audit Event", [
        `Timestamp: ${event.timestamp || "N/A"}`,
        `Outcome: ${event.outcome || "N/A"}`,
        `Mode: ${event.mode || "N/A"}`,
        `Risk: ${event.risk_level || "N/A"}`,
        `Refusal Code: ${event.refusal_code || "N/A"}`,
        `Message: ${event.message || "N/A"}`
      ])
    );
  });
}

function renderStartup(data) {
  clearCards();
  viewTitle.textContent = "Startup Workflow";

  cardContainer.appendChild(
    makeCard("Startup Result", [
      `Success: ${data?.ok ? "Yes" : "No"}`,
      `Message: ${data?.message || "N/A"}`,
      `Exit Code: ${data?.exit_code ?? "N/A"}`
    ])
  );
}
function yesNoUnknown(value, yesLabel, noLabel) {
  if (value === true) return yesLabel;
  if (value === false) return noLabel;
  return "Unknown";
}

function evidenceStatusLabel(status) {
  switch (status) {
    case "verified":
      return "Verified";
    case "verified_with_warnings":
      return "Verified with warnings";
    case "incomplete":
      return "Incomplete";
    case "failed":
      return "Failed";
    case "not_checked":
      return "Not checked";
    default:
      return "Missing";
  }
}

function renderEvidenceIndex(result) {
  clearCards();
  viewTitle.textContent = "Evidence Overview";

  const data = result?.data;

  if (!data?.ok) {
    cardContainer.appendChild(
      makeCard("No evidence index found", [
        data?.message || "No latest report index found.",
        `Expected path: ${data?.path || "exports/report-index/latest-report-index.json"}`,
        "Generate the latest evidence reports before using this view."
      ])
    );

    cardContainer.appendChild(
      makeCard("Required Commands", [
        "npm run export:governance-report",
        "npm run export:replay-provenance-report",
        "npm run export:federation-readiness-audit",
        "npm run export:latest-report-index",
        "npm run verify:latest-report-index"
      ])
    );

    cardContainer.appendChild(
      makeCard("Read-Only Boundary", [
        "This view does not generate reports.",
        "This view does not approve or execute tasks.",
        "This view does not mutate policy, authority, or federation state."
      ])
    );

    return;
  }

  const index = data.index;
  const reports = index?.reports || {};
  const governance = reports.governance || {};
  const replay = reports.replay_provenance || {};
  const federation = reports.federation_readiness || {};

  cardContainer.appendChild(
    makeCard("Evidence Summary", [
      `Governance evidence: ${evidenceStatusLabel(governance.status)}`,
      `Release-safe: ${yesNoUnknown(governance.release_safe, "Yes", "No")}`,
      `Replay lineage: ${yesNoUnknown(replay.lineage_complete, "Complete", "Incomplete")}`,
      `Replay admissibility: ${yesNoUnknown(replay.admissible, "Admissible", "Not admissible")}`,
      `Federation readiness: ${yesNoUnknown(federation.ready_for_federation, "Ready", "Not ready")}`
    ])
  );

  cardContainer.appendChild(
    makeCard("What This Means", [
      governance.release_safe === true
        ? "Governance evidence is currently suitable for release review."
        : "Governance evidence needs review before it should be treated as release-safe.",
      replay.lineage_complete === true
        ? "Replay lineage is complete, so the evidence chain is easier to inspect."
        : "Replay lineage is incomplete or unavailable, so provenance should be treated cautiously.",
      replay.admissible === true
        ? "Replay provenance is currently admissible."
        : "Replay provenance is not currently admissible.",
      federation.ready_for_federation === true
        ? "Federation design review may be considered."
        : "Federation is not ready. This UI does not enable federation runtime."
    ])
  );

  cardContainer.appendChild(
    makeCard("Governance Evidence", [
      `Status: ${evidenceStatusLabel(governance.status)}`,
      `Release-safe: ${yesNoUnknown(governance.release_safe, "Yes", "No")}`,
      `Report ID: ${governance.id || "Missing"}`
    ])
  );

  cardContainer.appendChild(
    makeCard("Replay Provenance", [
      `Status: ${evidenceStatusLabel(replay.status)}`,
      `Admissible: ${yesNoUnknown(replay.admissible, "Yes", "No")}`,
      `Lineage complete: ${yesNoUnknown(replay.lineage_complete, "Yes", "No")}`,
      `Report ID: ${replay.id || "Missing"}`
    ])
  );

  cardContainer.appendChild(
    makeCard("Federation Readiness", [
      `Status: ${evidenceStatusLabel(federation.status)}`,
      `Ready for federation: ${yesNoUnknown(federation.ready_for_federation, "Yes", "No")}`,
      `Audit ID: ${federation.id || "Missing"}`,
      "Federation readiness is advisory. This UI does not enable federation runtime."
    ])
  );

  cardContainer.appendChild(
    makeCard("Report Paths", [
      `Latest index: ${data.path || "Missing"}`,
      `Governance report: ${governance.path || "Missing"}`,
      `Replay provenance report: ${replay.path || "Missing"}`,
      `Federation readiness audit: ${federation.path || "Missing"}`
    ])
  );

  cardContainer.appendChild(
    makeCard("Read-Only Boundary", [
      "This view is read-only.",
      "It does not generate reports.",
      "It does not approve or execute tasks.",
      "It does not mutate policy or authority.",
      "It does not start federation.",
      "Raw JSON remains available in Advanced Raw Output."
    ])
  );
}

function renderCapabilities(result) {
  clearCards();
  viewTitle.textContent = "Capabilities";

  const data = result || {};
  const inventory = data.inventory || data || {};

  cardContainer.appendChild(
    makeCard("Capabilities Summary", [
      "This view lists available capabilities grouped by stability and implementation status.",
      `Loaded: ${inventory ? "Yes" : "No"}`
    ])
  );

  const groups = [
    ["Validated", inventory.validated],
    ["Advanced Reporting", inventory.advancedReporting],
    ["Experimental", inventory.experimental],
    ["Not Implemented", inventory.notImplemented],
    ["Authority Mechanisms", inventory.authorityMechanisms]
  ];

  groups.forEach(([title, items]) => {
    if (!items || items.length === 0) return;
    cardContainer.appendChild(
      makeCard(title, items.map((i) => `${i}`))
    );
  });
}
function renderFilesystemInspect(data) {
  clearCards();
  viewTitle.textContent = "Read-Only Path Inspection";

  cardContainer.appendChild(
    makeCard("Inspection Summary", [
      `Path: ${data.path || "N/A"}`,
      `Directories: ${Array.isArray(data.directories) ? data.directories.length : 0}`,
      `Files: ${Array.isArray(data.files) ? data.files.length : 0}`,
      `Status: ${data.ok ? "Allowed and inspected" : "Not inspected"}`,
      data.message ? `Message: ${data.message}` : "Read-only inspection completed."
    ])
  );

  cardContainer.appendChild(
    makeCard("Read-Only Boundary", [
      "This view lists immediate folder contents only.",
      "It does not read file contents.",
      "It does not write, move, rename, copy, delete, or execute files.",
      "Access is constrained by config/access-policy.json and path guards."
    ])
  );

  const directories = Array.isArray(data.directories) ? data.directories : [];
  const files = Array.isArray(data.files) ? data.files : [];

  directories.slice(0, 25).forEach((entry) => {
    cardContainer.appendChild(
      makeCard(`Folder: ${entry.name}`, [
        `Path: ${entry.path}`,
        `Modified: ${entry.modified_at || "Unknown"}`
      ])
    );
  });

  files.slice(0, 25).forEach((entry) => {
    cardContainer.appendChild(
      makeCard(`File: ${entry.name}`, [
        `Path: ${entry.path}`,
        `Size: ${entry.size_bytes ?? "Unknown"} bytes`,
        `Modified: ${entry.modified_at || "Unknown"}`
      ])
    );
  });

  if (directories.length + files.length > 50) {
    cardContainer.appendChild(
      makeCard("Result Limit", [
        "Only the first 25 folders and first 25 files are shown as cards.",
        "Full JSON remains available in Advanced Raw Output."
      ])
    );
  }
}

function renderFilesystemSummary(data) {
  clearCards();
  viewTitle.textContent = "Directory Summary";

  cardContainer.appendChild(
    makeCard("Folder Summary", [
      `Path: ${data.path || "N/A"}`,
      `Files: ${data.file_count ?? 0}`,
      `Folders: ${data.directory_count ?? 0}`,
      `Visible File Size: ${data.total_visible_file_size_bytes ?? 0} bytes`,
      `Status: ${data.ok ? "Summarized" : "Not summarized"}`,
      data.message ? `Message: ${data.message}` : "Metadata-only summary completed."
    ])
  );

  const extensions = Array.isArray(data.extension_breakdown) ? data.extension_breakdown : [];
  if (extensions.length > 0) {
    cardContainer.appendChild(
      makeCard("Extension Breakdown", extensions.slice(0, 10).map((entry) =>
        `${entry.extension}: ${entry.count}`
      ))
    );
  }

  const largestFiles = Array.isArray(data.largest_files) ? data.largest_files : [];
  if (largestFiles.length > 0) {
    cardContainer.appendChild(
      makeCard("Largest Files", largestFiles.map((file) =>
        `${file.name}: ${file.size_bytes} bytes`
      ))
    );
  }

  const recentFiles = Array.isArray(data.recent_files) ? data.recent_files : [];
  if (recentFiles.length > 0) {
    cardContainer.appendChild(
      makeCard("Recently Modified Files", recentFiles.map((file) =>
        `${file.name}: ${file.modified_at || "Unknown"}`
      ))
    );
  }

  cardContainer.appendChild(
    makeCard("Read-Only Boundary", [
      "This summary uses immediate directory metadata only.",
      "It does not read file contents.",
      "It does not recurse through subfolders.",
      "It does not write, move, rename, copy, delete, or execute files.",
      "Access is constrained by config/access-policy.json and path guards."
    ])
  );
}

function renderFilesystemSearch(data) {
  clearCards();
  viewTitle.textContent = "Filesystem Search";

  cardContainer.appendChild(
    makeCard("Search Summary", [
      `Path: ${data.path || "N/A"}`,
      `Matches: ${data.match_count ?? 0}`,
      `Extension: ${data.query?.extension || "Any"}`,
      `Name Contains: ${data.query?.nameContains || "Any"}`,
      `Minimum Size: ${data.query?.minSizeBytes ?? "None"}`,
      `Status: ${data.ok ? "Search completed" : "Search failed"}`,
      data.message ? `Message: ${data.message}` : "Metadata-only search completed."
    ])
  );

  const matches = Array.isArray(data.matches) ? data.matches : [];

  matches.slice(0, 30).forEach((entry) => {
    cardContainer.appendChild(
      makeCard(`Match: ${entry.name}`, [
        `Path: ${entry.path}`,
        `Size: ${entry.size_bytes ?? "Unknown"} bytes`,
        `Modified: ${entry.modified_at || "Unknown"}`
      ])
    );
  });

  if (matches.length > 30) {
    cardContainer.appendChild(
      makeCard("Result Limit", [
        "Only the first 30 matches are shown as cards.",
        "Full JSON remains available in Advanced Raw Output."
      ])
    );
  }

  cardContainer.appendChild(
    makeCard("Read-Only Boundary", [
      "This search uses immediate directory metadata only.",
      "It does not read file contents.",
      "It does not recurse through subfolders.",
      "It does not write, move, rename, copy, delete, or execute files.",
      "Access is constrained by config/access-policy.json and path guards."
    ])
  );
}

function renderPlannedRequestExecution(data) {
  clearCards();
  viewTitle.textContent = "Planned Request Execution";

  cardContainer.appendChild(
    makeCard("Execution Summary", [
      `Request: ${data.request || "N/A"}`,
      `Capability: ${data.plan?.capability || "N/A"}`,
      `Intent: ${data.plan?.intent || "N/A"}`,
      `Mode: ${data.plan?.mode || "N/A"}`,
      `Status: ${data.ok ? "Executed" : "Not executed"}`,
      `Message: ${data.message || "N/A"}`
    ])
  );

  if (data.execution?.type === "filesystem-search") {
    renderFilesystemSearch(data.execution);
    cardContainer.prepend(
      makeCard("Planner Bridge", [
        `Request: ${data.request || "N/A"}`,
        `Selected Capability: ${data.plan?.capability || "N/A"}`,
        "Planner selected filesystem search and executed it through the read-only bridge."
      ])
    );
    return;
  }

  if (data.execution?.type === "filesystem-summary") {
    renderFilesystemSummary(data.execution);
    cardContainer.prepend(
      makeCard("Planner Bridge", [
        `Request: ${data.request || "N/A"}`,
        `Selected Capability: ${data.plan?.capability || "N/A"}`,
        "Planner selected directory summary and executed it through the read-only bridge."
      ])
    );
    return;
  }

  if (data.execution?.type === "filesystem-inspect") {
    renderFilesystemInspect(data.execution);
    cardContainer.prepend(
      makeCard("Planner Bridge", [
        `Request: ${data.request || "N/A"}`,
        `Selected Capability: ${data.plan?.capability || "N/A"}`,
        "Planner selected path inspection and executed it through the read-only bridge."
      ])
    );
    return;
  }

  cardContainer.appendChild(
    makeCard("Read-Only Boundary", [
      "This bridge only executes supported read-only capabilities.",
      "It does not write, move, rename, copy, delete, or execute files.",
      "Unsupported requests are refused without execution."
    ])
  );
}

function renderGeneric(result) {
  clearCards();
  viewTitle.textContent = "Output";

  const data = result?.data;
  if (!data) {
    cardContainer.appendChild(makeCard("No structured data", ["Raw output shown below."]));
    return;
  }

  switch (data.type) {
    case "diagnostics":
      renderDiagnostics(data);
      break;
    case "latest-report-index":
      renderEvidenceIndex(result);
      break;
    case "tasks":
      renderTasks(data);
      break;
    case "audit":
      renderAudit(data);
      break;
    case "startup":
      renderStartup(data);
      break;
    case "diagnostics-run":
      cardContainer.appendChild(
        makeCard("Diagnostics Run", [
          `Success: ${data.ok ? "Yes" : "No"}`,
          `Message: ${data.message || "N/A"}`,
          `Exit Code: ${data.exit_code ?? "N/A"}`
        ])
      );
      viewTitle.textContent = "Diagnostics Run";
      break;
    case "task-action":
      cardContainer.appendChild(
        makeCard("Task Action Result", [
          `Success: ${data.ok ? "Yes" : "No"}`,
          `Action: ${data.action || "N/A"}`,
          `Task ID: ${data.task_id || "N/A"}`,
          `Message: ${data.message || "N/A"}`
        ])
      );
      viewTitle.textContent = "Task Action";
      break;
    default:
      cardContainer.appendChild(makeCard("Structured result unavailable", [data.message || "Raw output shown below."]));
      viewTitle.textContent = "Output";
      break;
  }
}

function renderUserRequestPlan(data) {
  clearCards();
  viewTitle.textContent = "User Request Plan";

  cardContainer.appendChild(
    makeCard("Planned Request", [
      `Request: ${data.request || "N/A"}`,
      `Intent: ${data.intent || "N/A"}`,
      `Capability: ${data.capability || "N/A"}`,
      `Mode: ${data.mode || "N/A"}`,
      `Risk: ${data.risk || "N/A"}`,
      `Execution Status: ${data.execution_status || "N/A"}`,
      `Workflow Status: ${data.workflow_status || "N/A"}`
    ])
  );

  cardContainer.appendChild(
    makeCard("Boundary", [
      data.boundary || "Planning only. No execution occurred.",
      data.next_step || "Review the planned capability before any future execution step."
    ])
  );
}
/* PATHWARDEN:RENDERERS:END */

/* PATHWARDEN:RUNNER:START */
function formatRaw(result) {
  return [
    `Success: ${result.ok ? "Yes" : "No"}`,
    `Exit Code: ${result.code}`,
    "",
    "--- STDOUT ---",
    result.stdout?.trim() || "(no stdout)",
    "",
    "--- STDERR ---",
    result.stderr?.trim() || "(no stderr)"
  ].join("\n");
}

async function runAction(title, actionFn) {
  try {
    setStatus(`${title} running...`);
    setOutput(`Running ${title}...`);
    clearCards();
    viewTitle.textContent = title;

    const result = await actionFn();

    renderGeneric(result);
    setOutput(formatRaw(result));
    setStatus(result.ok ? `${title} completed` : `${title} finished with issues`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    clearCards();
    cardContainer.appendChild(makeCard(`${title} failed`, [message]));
    setStatus(`${title} failed`);
    setOutput(`Unhandled error:\n${message}`);
    return null;
  }
}
/* PATHWARDEN:RUNNER:END */

/* PATHWARDEN:EVENT_BINDINGS:START */
document.getElementById("startupBtn").addEventListener("click", () => {
  const api = getAPI();
  if (!api?.runStartup) return showBridgeError("runStartup");
  runAction("Startup Workflow", () => api.runStartup());
});

document.getElementById("diagnosticsBtn").addEventListener("click", () => {
  const api = getAPI();
  if (!api?.runDiagnostics) return showBridgeError("runDiagnostics");
  runAction("Diagnostics Run", () => api.runDiagnostics());
});
document.getElementById("evidenceBtn").addEventListener("click", async () => {
  const api = getAPI();

  if (!api?.readLatestReportIndex) {
    return showBridgeError("readLatestReportIndex");
  }

  try {
    setStatus("Evidence Overview loading...");
    setOutput("Loading Evidence Overview...");
    clearCards();
    viewTitle.textContent = "Evidence Overview";

    const data = await api.readLatestReportIndex();

    renderEvidenceIndex({ data });

    setOutput(JSON.stringify(data, null, 2));
    setStatus(data.ok ? "Evidence Overview completed" : "Evidence Overview finished with issues");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    clearCards();
    cardContainer.appendChild(
      makeCard("Evidence Overview failed", [message])
    );

    setStatus("Evidence Overview failed");
    setOutput(`Unhandled error:\n${message}`);
  }
});
document.getElementById("planUserRequestBtn").addEventListener("click", () => {
  const api = getAPI();
  if (!api?.planUserRequest) return showBridgeError("planUserRequest");

  const input = document.getElementById("userRequestInput");
  const text = input?.value?.trim() || "";

  if (!text) {
    clearCards();
    viewTitle.textContent = "User Request Plan";
    cardContainer.appendChild(makeCard("No request entered", ["Enter a request to plan."]));
    setStatus("No user request entered");
    setOutput("No request entered.");
    return;
  }

  runAction("User Request Plan", () => api.planUserRequest(text));
});
document.getElementById("capabilitiesBtn").addEventListener("click", async () => {
  const api = getAPI();

  if (!api?.readCapabilityInventory) {
    return showBridgeError("readCapabilityInventory");
  }

  try {
    setStatus("Capabilities loading...");
    setOutput("Loading Capabilities...");
    clearCards();
    viewTitle.textContent = "Capabilities";

    const data = await api.readCapabilityInventory();

    renderCapabilities(data);

    setOutput(JSON.stringify(data, null, 2));
    setStatus(data.ok ? "Capabilities loaded" : "Capabilities finished with issues");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    clearCards();
    cardContainer.appendChild(
      makeCard("Capabilities failed", [message])
    );

    setStatus("Capabilities failed");
    setOutput(`Unhandled error:\n${message}`);
  }
});
document.getElementById("diagnosticsLatestBtn").addEventListener("click", () => {
  const api = getAPI();
  if (!api?.viewDiagnosticsLatest) return showBridgeError("viewDiagnosticsLatest");
  runAction("Latest Diagnostics", () => api.viewDiagnosticsLatest());
});

document.getElementById("tasksBtn").addEventListener("click", () => {
  const api = getAPI();
  if (!api?.viewTasks) return showBridgeError("viewTasks");
  runAction("Tasks / Approval Queue", () => api.viewTasks());
});

document.getElementById("auditBtn").addEventListener("click", () => {
  const api = getAPI();
  if (!api?.viewAuditRecent) return showBridgeError("viewAuditRecent");
  runAction("Recent Audit", () => api.viewAuditRecent());
});

document.getElementById("inspectPathBtn").addEventListener("click", () => {
  const api = getAPI();
  if (!api?.inspectPath) return showBridgeError("inspectPath");

  const input = document.getElementById("inspectPathInput");
  const targetPath = input?.value?.trim() || "";

  if (!targetPath) {
    clearCards();
    viewTitle.textContent = "Read-Only Path Inspection";
    cardContainer.appendChild(makeCard("No path entered", ["Enter an allowed folder path to inspect."]));
    setStatus("No path entered");
    setOutput("No path entered.");
    return;
  }

  runAction("Read-Only Path Inspection", () => api.inspectPath(targetPath));
});

document.getElementById("summarizePathBtn").addEventListener("click", () => {
  const api = getAPI();
  if (!api?.summarizePath) return showBridgeError("summarizePath");

  const input = document.getElementById("summarizePathInput");
  const targetPath = input?.value?.trim() || "";

  if (!targetPath) {
    clearCards();
    viewTitle.textContent = "Directory Summary";
    cardContainer.appendChild(makeCard("No path entered", ["Enter an allowed folder path to summarize."]));
    setStatus("No path entered");
    setOutput("No path entered.");
    return;
  }

  runAction("Directory Summary", () => api.summarizePath(targetPath));
});

document.getElementById("searchPathBtn").addEventListener("click", () => {
  const api = getAPI();
  if (!api?.searchPath) return showBridgeError("searchPath");

  const pathInput = document.getElementById("searchPathInput");
  const extensionInput = document.getElementById("searchExtensionInput");
  const nameInput = document.getElementById("searchNameInput");
  const minSizeInput = document.getElementById("searchMinSizeInput");

  const targetPath = pathInput?.value?.trim() || "";
  const extension = extensionInput?.value?.trim() || "";
  const nameContains = nameInput?.value?.trim() || "";
  const minSizeText = minSizeInput?.value?.trim() || "";
  const minSizeBytes = minSizeText ? Number(minSizeText) : undefined;

  if (!targetPath) {
    clearCards();
    viewTitle.textContent = "Filesystem Search";
    cardContainer.appendChild(makeCard("No path entered", ["Enter an allowed folder path to search."]));
    setStatus("No path entered");
    setOutput("No path entered.");
    return;
  }

  if (minSizeText && Number.isNaN(minSizeBytes)) {
    clearCards();
    viewTitle.textContent = "Filesystem Search";
    cardContainer.appendChild(makeCard("Invalid minimum size", ["Minimum size must be a number of bytes."]));
    setStatus("Invalid minimum size");
    setOutput("Invalid minimum size.");
    return;
  }

  runAction("Filesystem Search", () =>
    api.searchPath(targetPath, extension, nameContains, minSizeBytes)
  );
});

document.getElementById("executePlannedRequestBtn").addEventListener("click", () => {
  const api = getAPI();
  if (!api?.executePlannedRequest) return showBridgeError("executePlannedRequest");

  const input = document.getElementById("executePlannedRequestInput");
  const requestText = input?.value?.trim() || "";

  if (!requestText) {
    clearCards();
    viewTitle.textContent = "Planned Request Execution";
    cardContainer.appendChild(makeCard("No request entered", ["Enter a supported read-only request to run."]));
    setStatus("No request entered");
    setOutput("No request entered.");
    return;
  }

  runAction("Planned Request Execution", () => api.executePlannedRequest(requestText));
});

document.getElementById("createPlannedRequestTaskBtn").addEventListener("click", async () => {
  const api = getAPI();
  if (!api?.createPlannedRequestTask) return showBridgeError("createPlannedRequestTask");

  const input = document.getElementById("plannedRequestTaskInput");
  const text = input?.value?.trim() || "";

  if (!text) {
    clearCards();
    viewTitle.textContent = "Planned Request Approval";
    cardContainer.appendChild(makeCard("No request entered", ["Enter a request to queue for approval."]));
    setStatus("No planned request entered");
    setOutput("No request entered.");
    return;
  }

  await runAction("Create Planned Request Approval", () => api.createPlannedRequestTask(text));

  if (api.viewTasks) {
    await runAction("Tasks / Approval Queue", () => api.viewTasks());
  }
});

document.getElementById("createPlannedRequestTaskBtn").addEventListener("click", async () => {
  const api = getAPI();
  if (!api?.createPlannedRequestTask) return showBridgeError("createPlannedRequestTask");

  const input = document.getElementById("plannedRequestTaskInput");
  const text = input?.value?.trim() || "";

  if (!text) {
    clearCards();
    viewTitle.textContent = "Planned Request Approval";
    cardContainer.appendChild(makeCard("No request entered", ["Enter a request to queue for approval."]));
    setStatus("No planned request entered");
    setOutput("No request entered.");
    return;
  }

  await runAction("Create Planned Request Approval", () => api.createPlannedRequestTask(text));

  if (api.viewTasks) {
    await runAction("Tasks / Approval Queue", () => api.viewTasks());
  }
});

document.getElementById("clearBtn").addEventListener("click", () => {
  clearCards();
  setOutput("Waiting for action...");
  setStatus("Output cleared");
  viewTitle.textContent = "Output";
});
/* PATHWARDEN:EVENT_BINDINGS:END */

/* PATHWARDEN:BOOT:START */
const api = getAPI();
if (api?.ping) {
  setStatus(api.ping());
  bridgeText.textContent = "Connected";
} else {
  setStatus("Desktop bridge unavailable");
  bridgeText.textContent = "Unavailable";
  setOutput("Bridge error: window.pathwardenAPI is undefined.");
}
/* PATHWARDEN:BOOT:END */















