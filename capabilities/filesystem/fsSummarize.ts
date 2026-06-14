import { inspectDirectory } from "./fsInspect";

export type ExtensionSummary = {
  extension: string;
  count: number;
};

export type FilesystemSummaryResult = {
  ok: boolean;
  type: "filesystem-summary";
  path: string;

  file_count: number;
  directory_count: number;

  total_visible_file_size_bytes: number;

  extension_breakdown: ExtensionSummary[];

  largest_files: {
    name: string;
    size_bytes: number;
  }[];

  recent_files: {
    name: string;
    modified_at: string | null;
  }[];
};

export function summarizeDirectory(targetPath: string): FilesystemSummaryResult {
  if (!targetPath) throw new Error("summarizeDirectory requires a path");

  const inspection = inspectDirectory(targetPath);

  if (!inspection.ok) {
    throw new Error("Inspection failed.");
  }

  const fileCount = (inspection.files || []).length;
  const directoryCount = (inspection.directories || []).length;

  let totalSize = 0;

  const extensionMap = new Map<string, number>();

  for (const file of inspection.files || []) {
    totalSize += file.size_bytes ?? 0;

    const extension = file.name.includes(".") ? file.name.substring(file.name.lastIndexOf(".")).toLowerCase() : "[none]";
    extensionMap.set(extension, (extensionMap.get(extension) ?? 0) + 1);
  }

  const extensionBreakdown = [...extensionMap.entries()]
    .map(([extension, count]) => ({ extension, count }))
    .sort((a, b) => b.count - a.count);

  const largestFiles = [...(inspection.files || [])]
    .sort((a, b) => (b.size_bytes ?? 0) - (a.size_bytes ?? 0))
    .slice(0, 5)
    .map((f) => ({ name: f.name, size_bytes: f.size_bytes ?? 0 }));

  const recentFiles = [...(inspection.files || [])]
    .sort((a, b) => (b.modified_at ?? "").localeCompare(a.modified_at ?? ""))
    .slice(0, 5)
    .map((f) => ({ name: f.name, modified_at: f.modified_at }));

  return {
    ok: true,
    type: "filesystem-summary",
    path: inspection.path,

    file_count: fileCount,
    directory_count: directoryCount,

    total_visible_file_size_bytes: totalSize,

    extension_breakdown: extensionBreakdown,

    largest_files: largestFiles,
    recent_files: recentFiles
  };
}

export default summarizeDirectory;
