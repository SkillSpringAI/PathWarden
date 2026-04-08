import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const repoRoot = process.cwd();
const tsxPath = resolve(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const startupScript = resolve(repoRoot, "Pathwarden", "scripts", "dev", "run-startup.ts");

const result = spawnSync("node", [tsxPath, startupScript], {
  cwd: repoRoot,
  encoding: "utf8",
  shell: true
});

console.log(JSON.stringify({
  ok: result.status === 0,
  type: "startup",
  message: result.status === 0 ? "Startup workflow completed." : "Startup workflow finished with issues.",
  exit_code: result.status ?? 0,
  stdout: result.stdout ?? "",
  stderr: result.stderr ?? ""
}, null, 2));
