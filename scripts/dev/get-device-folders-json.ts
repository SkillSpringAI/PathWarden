import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const home = homedir();

const candidates = [
  { id: "desktop", label: "Desktop", path: join(home, "Desktop") },
  { id: "documents", label: "Documents", path: join(home, "Documents") },
  { id: "downloads", label: "Downloads", path: join(home, "Downloads") },
  { id: "pictures", label: "Pictures", path: join(home, "Pictures") },
  { id: "music", label: "Music", path: join(home, "Music") },
  { id: "videos", label: "Videos", path: join(home, "Videos") }
];

const folders = candidates.filter(item => existsSync(item.path));

console.log(JSON.stringify({
  ok: true,
  type: "device-folders",
  message: "Detected common local folders.",
  folders
}, null, 2));
