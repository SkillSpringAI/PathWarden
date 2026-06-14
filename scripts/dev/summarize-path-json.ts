import { summarizeDirectory } from "../../capabilities/filesystem/fsSummarize";

const targetPath = process.argv.slice(2).join(" ");

if (!targetPath) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        type: "filesystem-summary",
        message: "No path provided."
      },
      null,
      2
    )
  );

  process.exit(1);
}

try {
  const result = summarizeDirectory(targetPath);

  console.log(JSON.stringify(result, null, 2));

  process.exit(0);
} catch (error) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        type: "filesystem-summary",
        path: targetPath,
        message: error instanceof Error ? error.message : String(error)
      },
      null,
      2
    )
  );

  process.exit(1);
}