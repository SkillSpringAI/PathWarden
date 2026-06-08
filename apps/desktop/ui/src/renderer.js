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
  viewTitle.textContent = "Queued Tasks";

  const tasks = data?.tasks || [];
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
    approveBtn.textContent = "Approve";
    approveBtn.onclick = async () => {
      const api = getAPI();
      if (!api?.approveTask) return showBridgeError("approveTask");
      await runAction("Approve Task", () => api.approveTask(task.task_id));
      await runAction("Task Summary", () => api.viewTasks());
    };

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.onclick = async () => {
      const api = getAPI();
      if (!api?.cancelTask) return showBridgeError("cancelTask");
      await runAction("Cancel Task", () => api.cancelTask(task.task_id));
      await runAction("Task Summary", () => api.viewTasks());
    };

    const runBtn = document.createElement("button");
    runBtn.textContent = "Run";
    runBtn.onclick = async () => {
      const api = getAPI();
      if (!api?.runTask) return showBridgeError("runTask");
      await runAction("Run Task", () => api.runTask(task.task_id));
      await runAction("Task Summary", () => api.viewTasks());
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
        "Generate the latest reports before viewing evidence."
      ])
    );

    cardContainer.appendChild(
      makeCard("Generate evidence", [
        "npm run export:governance-report",
        "npm run export:replay-provenance-report",
        "npm run export:federation-readiness-audit",
        "npm run export:latest-report-index",
        "npm run verify:latest-report-index"
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
    makeCard("Current Evidence Posture", [
      `Governance: ${evidenceStatusLabel(governance.status)}`,
      `Replay lineage: ${yesNoUnknown(replay.lineage_complete, "Complete", "Incomplete")}`,
      `Replay admissibility: ${yesNoUnknown(replay.admissible, "Admissible", "Not admissible")}`,
      `Federation: ${yesNoUnknown(federation.ready_for_federation, "Ready for design review", "Not ready")}`
    ])
  );

  cardContainer.appendChild(
    makeCard("User Summary", [
      governance.release_safe === true
        ? "Governance evidence is currently release-safe."
        : "Governance evidence is not currently release-safe.",
      replay.lineage_complete === true
        ? "Replay lineage is complete."
        : "Replay lineage is incomplete or not available.",
      replay.admissible === true
        ? "Replay provenance is admissible."
        : "Replay provenance is not currently admissible.",
      federation.ready_for_federation === true
        ? "Federation design may be considered."
        : "Federation is not ready. This UI does not enable federation runtime."
    ])
  );

  cardContainer.appendChild(
    makeCard("Governance Report", [
      `Status: ${evidenceStatusLabel(governance.status)}`,
      `Release-safe: ${yesNoUnknown(governance.release_safe, "Yes", "No")}`,
      `Report ID: ${governance.id || "Missing"}`,
      `Path: ${governance.path || "Missing"}`
    ])
  );

  cardContainer.appendChild(
    makeCard("Replay Provenance", [
      `Status: ${evidenceStatusLabel(replay.status)}`,
      `Admissible: ${yesNoUnknown(replay.admissible, "Yes", "No")}`,
      `Lineage complete: ${yesNoUnknown(replay.lineage_complete, "Yes", "No")}`,
      `Report ID: ${replay.id || "Missing"}`,
      `Path: ${replay.path || "Missing"}`
    ])
  );

  cardContainer.appendChild(
    makeCard("Federation Readiness", [
      `Status: ${evidenceStatusLabel(federation.status)}`,
      `Ready for federation: ${yesNoUnknown(federation.ready_for_federation, "Yes", "No")}`,
      `Audit ID: ${federation.id || "Missing"}`,
      `Path: ${federation.path || "Missing"}`
    ])
  );

  cardContainer.appendChild(
    makeCard("Power User Detail", [
      "Raw JSON remains available in the Raw Output panel below.",
      "Artifact paths are shown for direct inspection.",
      "This view is read-only and does not execute actions."
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
document.getElementById("diagnosticsLatestBtn").addEventListener("click", () => {
  const api = getAPI();
  if (!api?.viewDiagnosticsLatest) return showBridgeError("viewDiagnosticsLatest");
  runAction("Latest Diagnostics", () => api.viewDiagnosticsLatest());
});

document.getElementById("tasksBtn").addEventListener("click", () => {
  const api = getAPI();
  if (!api?.viewTasks) return showBridgeError("viewTasks");
  runAction("Task Summary", () => api.viewTasks());
});

document.getElementById("auditBtn").addEventListener("click", () => {
  const api = getAPI();
  if (!api?.viewAuditRecent) return showBridgeError("viewAuditRecent");
  runAction("Recent Audit", () => api.viewAuditRecent());
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
