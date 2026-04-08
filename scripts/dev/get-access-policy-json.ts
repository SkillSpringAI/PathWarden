import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(process.cwd(), "Pathwarden", "config", "access-policy.json");

if (!existsSync(path)) {
  console.log(JSON.stringify({
    ok: false,
    type: "access-policy",
    message: "Access policy file not found.",
    policy: null
  }, null, 2));
  process.exit(0);
}

const policy = JSON.parse(readFileSync(path, "utf8"));

console.log(JSON.stringify({
  ok: true,
  type: "access-policy",
  message: "Access policy loaded.",
  policy
}, null, 2));
