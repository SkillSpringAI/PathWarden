import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const candidates: { id: string; label: string; path: string }[] = [];

const roots = [
  process.env["ProgramFiles"],
  process.env["ProgramFiles(x86)"],
  process.env["LOCALAPPDATA"]
].filter(Boolean) as string[];

function tryAdd(label: string, path: string) {
  if (existsSync(path)) {
    candidates.push({
      id: label.toLowerCase().replace(/\s+/g, "_"),
      label,
      path
    });
  }
}

for (const root of roots) {
  tryAdd("Visual Studio Code", join(root, "Microsoft VS Code"));
  tryAdd("Google Chrome", join(root, "Google", "Chrome"));
  tryAdd("Mozilla Firefox", join(root, "Mozilla Firefox"));
  tryAdd("Microsoft Edge", join(root, "Microsoft", "Edge"));
  tryAdd("Notepad++", join(root, "Notepad++"));
  tryAdd("LibreOffice", join(root, "LibreOffice"));
  tryAdd("Git", join(root, "Git"));
  tryAdd("Python", join(root, "Python"));
  tryAdd("Node.js", join(root, "nodejs"));
}

const deduped = Array.from(
  new Map(candidates.map(item => [item.path.toLowerCase(), item])).values()
);

console.log(JSON.stringify({
  ok: true,
  type: "device-apps",
  message: "Detected likely installed applications from common install paths.",
  applications: deduped
}, null, 2));
