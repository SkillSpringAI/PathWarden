import { summarizeDirectory } from "../../capabilities/filesystem/fsSummarize";

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

const allowedPath = "C:\\Users\\Laptop\\Documents";
const blockedPath = "C:\\Windows";

const result = summarizeDirectory(allowedPath);

if (!result.ok) fail("Allowed path summary did not succeed.");
if (result.type !== "filesystem-summary") fail("Wrong result type.");
if (result.path.length === 0) fail("Summary path was empty.");

if (typeof result.file_count !== "number") fail("file_count was not a number.");
if (typeof result.directory_count !== "number") fail("directory_count was not a number.");
if (typeof result.total_visible_file_size_bytes !== "number") {
  fail("total_visible_file_size_bytes was not a number.");
}

if (!Array.isArray(result.extension_breakdown)) fail("extension_breakdown was not an array.");
if (!Array.isArray(result.largest_files)) fail("largest_files was not an array.");
if (!Array.isArray(result.recent_files)) fail("recent_files was not an array.");

if (result.file_count < 0) fail("file_count was negative.");
if (result.directory_count < 0) fail("directory_count was negative.");
if (result.total_visible_file_size_bytes < 0) fail("total_visible_file_size_bytes was negative.");

if (result.file_count > 0 && result.largest_files.length === 0) {
  fail("largest_files was empty despite files being present.");
}

if (result.file_count > 0 && result.recent_files.length === 0) {
  fail("recent_files was empty despite files being present.");
}

let blockedDenied = false;

try {
  summarizeDirectory(blockedPath);
} catch (error) {
  blockedDenied = error instanceof Error && error.name === "AccessPolicyDeniedError";
}

if (!blockedDenied) {
  fail("Blocked path was not denied by access policy.");
}

console.log(JSON.stringify({
  ok: true,
  type: "filesystem-summary-test",
  message: "Filesystem summary checks passed.",
  checked: {
    allowedPath,
    blockedPath,
    file_count: result.file_count,
    directory_count: result.directory_count,
    extension_types: result.extension_breakdown.length
  }
}, null, 2));