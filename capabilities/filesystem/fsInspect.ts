import fs from "node:fs";
import path from "node:path";
import { assertPathAllowed } from "./pathGuards";

export type FilesystemInspectEntry = {
  name: string;
  path: string;
  type: "file" | "directory";
  size_bytes: number | null;
  modified_at: string | null;
};

export type FilesystemInspectResult = {
  ok: boolean;
  type: "filesystem-inspect";
  path: string;
  directories: FilesystemInspectEntry[];
  files: FilesystemInspectEntry[];
  message?: string;
};

export function inspectDirectory(targetPath: string): FilesystemInspectResult {
  if (!targetPath) {
    throw new Error("Inspect requires path");
  }

  const resolvedPath = path.resolve(targetPath);

  assertPathAllowed(resolvedPath);

  if (!fs.existsSync(resolvedPath)) {
    return {
      ok: false,
      type: "filesystem-inspect",
      path: resolvedPath,
      directories: [],
      files: [],
      message: "Path does not exist."
    };
  }

  const stats = fs.statSync(resolvedPath);

  if (!stats.isDirectory()) {
    return {
      ok: false,
      type: "filesystem-inspect",
      path: resolvedPath,
      directories: [],
      files: [],
      message: "Path is not a directory."
    };
  }

  const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });

  const directories: FilesystemInspectEntry[] = [];
  const files: FilesystemInspectEntry[] = [];

  for (const entry of entries) {
    const entryPath = path.join(resolvedPath, entry.name);

    let entryStats: fs.Stats | null = null;

    try {
      entryStats = fs.statSync(entryPath);
    } catch {
      entryStats = null;
    }

    const item: FilesystemInspectEntry = {
      name: entry.name,
      path: entryPath,
      type: entry.isDirectory() ? "directory" : "file",
      size_bytes: entryStats?.isFile() ? entryStats.size : null,
      modified_at: entryStats?.mtime ? entryStats.mtime.toISOString() : null
    };

    if (entry.isDirectory()) {
      directories.push(item);
    } else {
      files.push(item);
    }
  }

  directories.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b) => a.name.localeCompare(b.name));

  return {
    ok: true,
    type: "filesystem-inspect",
    path: resolvedPath,
    directories,
    files
  };
}