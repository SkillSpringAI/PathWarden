import fs from "node:fs";
import path from "node:path";
import { inspectDirectory } from "../../capabilities/filesystem/fsInspect";

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

const documentsPath = "C:\\Users\\Laptop\\Documents";
const blockedPath = "C:\\Windows";
const missingAllowedPath = path.join(documentsPath, "__pathwarden_missing_inspect_target__");

if (!fs.existsSync(documentsPath)) {
  fail(`Expected allowed test path to exist: ${documentsPath}`);
}

const allowedResult = inspectDirectory(documentsPath);

if (!allowedResult.ok) {
  fail(`Allowed path did not inspect successfully: ${allowedResult.message}`);
}

if (allowedResult.type !== "filesystem-inspect") {
  fail("Allowed result returned wrong type.");
}

if (!Array.isArray(allowedResult.directories)) {
  fail("Allowed result directories was not an array.");
}

if (!Array.isArray(allowedResult.files)) {
  fail("Allowed result files was not an array.");
}

let blockedDenied = false;

try {
  inspectDirectory(blockedPath);
} catch (error) {
  blockedDenied = error instanceof Error && error.name === "AccessPolicyDeniedError";
}

if (!blockedDenied) {
  fail("Blocked path was not denied by access policy.");
}

const missingResult = inspectDirectory(missingAllowedPath);

if (missingResult.ok) {
  fail("Missing allowed path should not inspect successfully.");
}

if (missingResult.message !== "Path does not exist.") {
  fail(`Missing path returned unexpected message: ${missingResult.message}`);
}

console.log(JSON.stringify({
  ok: true,
  type: "filesystem-inspect-test",
  message: "Filesystem inspect checks passed.",
  checked: {
    allowedPath: documentsPath,
    blockedPath,
    missingAllowedPath
  }
}, null, 2));