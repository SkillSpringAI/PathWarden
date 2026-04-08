const { contextBridge, ipcRenderer } = require("electron");

const api = {
  ping: () => "Pathwarden desktop bridge ready",

  runStartup: () => ipcRenderer.invoke("pathwarden:runStartup"),
  runDiagnostics: () => ipcRenderer.invoke("pathwarden:runDiagnostics"),
  viewTasks: () => ipcRenderer.invoke("pathwarden:viewTasks"),
  viewAuditRecent: () => ipcRenderer.invoke("pathwarden:viewAuditRecent"),
  viewDiagnosticsLatest: () => ipcRenderer.invoke("pathwarden:viewDiagnosticsLatest"),

  approveTask: (taskId) => ipcRenderer.invoke("pathwarden:approveTask", taskId),
  cancelTask: (taskId) => ipcRenderer.invoke("pathwarden:cancelTask", taskId),
  runTask: (taskId) => ipcRenderer.invoke("pathwarden:runTask", taskId),

  createTaskDraftFromText: (text) => ipcRenderer.invoke("pathwarden:createTaskDraftFromText", text),
  getDefaultTasks: () => ipcRenderer.invoke("pathwarden:getDefaultTasks"),
  createTaskFromTemplate: (templateId) => ipcRenderer.invoke("pathwarden:createTaskFromTemplate", templateId),

  getDeviceFolders: () => ipcRenderer.invoke("pathwarden:getDeviceFolders"),
  getDeviceApps: () => ipcRenderer.invoke("pathwarden:getDeviceApps"),
  getAccessPolicy: () => ipcRenderer.invoke("pathwarden:getAccessPolicy"),
  saveAccessPolicy: (foldersJson, appsJson) => ipcRenderer.invoke("pathwarden:saveAccessPolicy", foldersJson, appsJson)
};

contextBridge.exposeInMainWorld("pathwardenAPI", api);
