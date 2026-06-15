import { searchDirectory } from "../../capabilities/filesystem/fsSearch";

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

const allowedPath = "C:\\Users\\Laptop\\Documents";
const blockedPath = "C:\\Windows";

const extensionResult = searchDirectory({
  path: allowedPath,
  extension: ".txt"
});

if (!extensionResult.ok) fail("Extension search did not succeed.");
if (extensionResult.type !== "filesystem-search") fail("Wrong result type.");
if (extensionResult.query.extension !== ".txt") fail("Extension was not normalized to .txt.");
if (extensionResult.matches.some((match) => !match.name.toLowerCase().endsWith(".txt"))) {
  fail("Extension search returned a non-.txt file.");
}

const nameResult = searchDirectory({
  path: allowedPath,
  nameContains: "skill"
});

if (!nameResult.ok) fail("Name search did not succeed.");
if (nameResult.matches.some((match) => !match.name.toLowerCase().includes("skill"))) {
  fail("Name search returned a file that does not contain the query.");
}

const sizeResult = searchDirectory({
  path: allowedPath,
  minSizeBytes: 1000000
});

if (!sizeResult.ok) fail("Size search did not succeed.");
if (sizeResult.matches.some((match) => (match.size_bytes ?? 0) < 1000000)) {
  fail("Size search returned a file smaller than the minimum.");
}

const combinedResult = searchDirectory({
  path: allowedPath,
  extension: ".txt",
  nameContains: "skill"
});

if (!combinedResult.ok) fail("Combined search did not succeed.");
if (
  combinedResult.matches.some(
    (match) =>
      !match.name.toLowerCase().endsWith(".txt") ||
      !match.name.toLowerCase().includes("skill")
  )
) {
  fail("Combined search returned a file outside the combined filters.");
}

let blockedDenied = false;

try {
  searchDirectory({
    path: blockedPath,
    extension: ".txt"
  });
} catch (error) {
  blockedDenied = error instanceof Error && error.name === "AccessPolicyDeniedError";
}

if (!blockedDenied) {
  fail("Blocked path was not denied by access policy.");
}

console.log(JSON.stringify({
  ok: true,
  type: "filesystem-search-test",
  message: "Filesystem search checks passed.",
  checked: {
    allowedPath,
    blockedPath,
    extensionMatches: extensionResult.match_count,
    nameMatches: nameResult.match_count,
    sizeMatches: sizeResult.match_count,
    combinedMatches: combinedResult.match_count
  }
}, null, 2));