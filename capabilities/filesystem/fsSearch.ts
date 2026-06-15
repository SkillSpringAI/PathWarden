import { inspectDirectory, FilesystemInspectEntry } from "./fsInspect";

export type FilesystemSearchRequest = {
  path: string;
  extension?: string;
  nameContains?: string;
  minSizeBytes?: number;
};

export type FilesystemSearchResult = {
  ok: boolean;
  type: "filesystem-search";
  path: string;
  query: {
    extension?: string;
    nameContains?: string;
    minSizeBytes?: number;
  };
  match_count: number;
  matches: FilesystemInspectEntry[];
  message?: string;
};

function normalizeExtension(extension: string | undefined): string | undefined {
  if (!extension) return undefined;

  const trimmed = extension.trim().toLowerCase();

  if (!trimmed) return undefined;

  return trimmed.startsWith(".") ? trimmed : `.${trimmed}`;
}

export function searchDirectory(request: FilesystemSearchRequest): FilesystemSearchResult {
  if (!request.path) {
    throw new Error("Search requires path");
  }

  const extension = normalizeExtension(request.extension);
  const nameContains = request.nameContains?.trim().toLowerCase() || undefined;
  const minSizeBytes = request.minSizeBytes;

  const inspection = inspectDirectory(request.path);

  if (!inspection.ok) {
    return {
      ok: false,
      type: "filesystem-search",
      path: inspection.path,
      query: {
        extension,
        nameContains,
        minSizeBytes
      },
      match_count: 0,
      matches: [],
      message: inspection.message || "Inspection failed."
    };
  }

  const matches = inspection.files.filter((file) => {
    if (extension) {
      const fileName = file.name.toLowerCase();

      if (!fileName.endsWith(extension)) {
        return false;
      }
    }

    if (nameContains) {
      if (!file.name.toLowerCase().includes(nameContains)) {
        return false;
      }
    }

    if (typeof minSizeBytes === "number") {
      if ((file.size_bytes ?? 0) < minSizeBytes) {
        return false;
      }
    }

    return true;
  });

  return {
    ok: true,
    type: "filesystem-search",
    path: inspection.path,
    query: {
      extension,
      nameContains,
      minSizeBytes
    },
    match_count: matches.length,
    matches
  };
}