const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 940,
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, "..", "ui", "src", "index.html"));
}

function runPathwardenJsonScript(relativeScriptPath, extraArgs = []) {
  return new Promise((resolvePromise) => {
    const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
    const tsxPath = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
    const scriptPath = path.join(repoRoot, relativeScriptPath);

    const child = spawn("node", [tsxPath, scriptPath, ...extraArgs], {
      cwd: repoRoot,
      shell: true
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      let parsed = null;

      try {
        parsed = JSON.parse(stdout);
      } catch {
        parsed = {
          ok: code === 0,
          type: "raw",
          message: "Failed to parse JSON output.",
          stdout,
          stderr
        };
      }

      resolvePromise({
        ok: code === 0,
        code,
        stdout,
        stderr,
        data: parsed
      });
    });
  });
}

ipcMain.handle("pathwarden:runStartup", async () => runPathwardenJsonScript("Pathwarden/scripts/dev/run-startup-json.ts"));
ipcMain.handle("pathwarden:runDiagnostics", async () => runPathwardenJsonScript("Pathwarden/scripts/dev/run-diagnostics-json.ts"));
ipcMain.handle("pathwarden:viewTasks", async () => runPathwardenJsonScript("Pathwarden/scripts/dev/get-tasks-json.ts"));
ipcMain.handle("pathwarden:viewAuditRecent", async () => runPathwardenJsonScript("Pathwarden/scripts/dev/get-audit-json.ts"));
ipcMain.handle("pathwarden:viewDiagnosticsLatest", async () => runPathwardenJsonScript("Pathwarden/scripts/dev/get-diagnostics-json.ts"));

ipcMain.handle("pathwarden:approveTask", async (_, taskId) => runPathwardenJsonScript("Pathwarden/scripts/dev/approve-task.ts", [taskId]));
ipcMain.handle("pathwarden:cancelTask", async (_, taskId) => runPathwardenJsonScript("Pathwarden/scripts/dev/cancel-task.ts", [taskId]));
ipcMain.handle("pathwarden:runTask", async (_, taskId) => runPathwardenJsonScript("Pathwarden/scripts/dev/run-task.ts", [taskId]));

ipcMain.handle("pathwarden:createTaskDraftFromText", async (_, text) => runPathwardenJsonScript("Pathwarden/scripts/dev/create-task-draft-json.ts", [text]));
ipcMain.handle("pathwarden:getDefaultTasks", async () => runPathwardenJsonScript("Pathwarden/scripts/dev/get-default-tasks-json.ts"));
ipcMain.handle("pathwarden:createTaskFromTemplate", async (_, templateId) => runPathwardenJsonScript("Pathwarden/scripts/dev/create-task-from-template-json.ts", [templateId]));

ipcMain.handle("pathwarden:getDeviceFolders", async () => runPathwardenJsonScript("Pathwarden/scripts/dev/get-device-folders-json.ts"));
ipcMain.handle("pathwarden:getDeviceApps", async () => runPathwardenJsonScript("Pathwarden/scripts/dev/get-device-apps-json.ts"));
ipcMain.handle("pathwarden:getAccessPolicy", async () => runPathwardenJsonScript("Pathwarden/scripts/dev/get-access-policy-json.ts"));
ipcMain.handle("pathwarden:saveAccessPolicy", async (_, foldersJson, appsJson) => runPathwardenJsonScript("Pathwarden/scripts/dev/save-access-policy-json.ts", [foldersJson, appsJson]));

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
