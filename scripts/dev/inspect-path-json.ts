import { inspectDirectory } from "../../capabilities/filesystem/fsInspect";

const targetPath = process.argv.slice(2).join(" ");

if (!targetPath) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        type: "filesystem-inspect",
        message: "No path provided.",
        path: "",
        directories: [],
        files: []
      },
      null,
      2
    )
  );
  process.exit(1);
}

try {
  const result = inspectDirectory(targetPath);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
} catch (error) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        type: "filesystem-inspect",
        message: error instanceof Error ? error.message : String(error),
        path: targetPath,
        directories: [],
        files: []
      },
      null,
      2
    )
  );
  process.exit(1);
}