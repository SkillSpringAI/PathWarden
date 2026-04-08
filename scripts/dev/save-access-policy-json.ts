import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const foldersRaw = process.argv[2] || "[]";
const appsRaw = process.argv[3] || "[]";

let folders: unknown[] = [];
let applications: unknown[] = [];

try {
  folders = JSON.parse(foldersRaw);
  applications = JSON.parse(appsRaw);
} catch {
  console.log(JSON.stringify({
    ok: false,
    type: "access-policy-save",
    message: "Invalid JSON input for folders or applications."
  }, null, 2));
  process.exit(0);
}

const policy = {
  version: "1.0",
  allowed_folders: folders,
  allowed_applications: applications,
  last_updated: new Date().toISOString()
};

const path = resolve(process.cwd(), "Pathwarden", "config", "access-policy.json");
writeFileSync(path, JSON.stringify(policy, null, 2), "utf8");

console.log(JSON.stringify({
  ok: true,
  type: "access-policy-save",
  message: "Access policy saved.",
  policy
}, null, 2));
