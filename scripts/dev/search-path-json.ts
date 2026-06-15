import { searchDirectory } from "../../capabilities/filesystem/fsSearch";

const args = process.argv.slice(2);
const targetPath = args[0];

function readFlag(name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

const extension = readFlag("--extension");
const nameContains = readFlag("--name-contains");
const minSizeText = readFlag("--min-size-bytes");

const minSizeBytes =
  minSizeText && !Number.isNaN(Number(minSizeText))
    ? Number(minSizeText)
    : undefined;

if (!targetPath) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        type: "filesystem-search",
        message: "No path provided.",
        path: "",
        query: {},
        match_count: 0,
        matches: []
      },
      null,
      2
    )
  );

  process.exit(1);
}

try {
  const result = searchDirectory({
    path: targetPath,
    extension,
    nameContains,
    minSizeBytes
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
} catch (error) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        type: "filesystem-search",
        path: targetPath,
        query: {
          extension,
          nameContains,
          minSizeBytes
        },
        match_count: 0,
        matches: [],
        message: error instanceof Error ? error.message : String(error)
      },
      null,
      2
    )
  );

  process.exit(1);
}
