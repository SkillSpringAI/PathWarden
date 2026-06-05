import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sha256 } from "../common/hash";
import type {
  PolicyManifest,
  PolicyManifestFileRef
} from "./policyManifest";

export interface PolicyFileHash {
  path: string;
  kind: PolicyManifestFileRef["kind"];
  required: boolean;
  hash_algorithm: "sha256";
  hash: string;
}

export interface PolicyHashVerificationResult {
  path: string;
  kind: PolicyManifestFileRef["kind"];
  required: boolean;
  status:
    | "match"
    | "mismatch"
    | "missing_required"
    | "missing_optional"
    | "not_checked"
    | "invalid_entry";
  expected_hash: string | null;
  actual_hash: string | null;
}

function repoPath(relativePath: string): string {
  return resolve(process.cwd(), relativePath);
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

function comparePolicyFileHashes(
  left: PolicyFileHash,
  right: PolicyFileHash
): number {
  return (
    left.kind.localeCompare(right.kind) ||
    left.path.localeCompare(right.path)
  );
}

function allManifestRefs(
  manifest: PolicyManifest
): PolicyManifestFileRef[] {
  return [
    ...manifest.policy.files,
    ...manifest.governance.files,
    ...manifest.triggers.files,
    ...manifest.trust.manifest_refs,
    ...manifest.schemas.files
  ].sort((left, right) => (
    left.kind.localeCompare(right.kind) ||
    left.path.localeCompare(right.path)
  ));
}

function hashFileRef(ref: PolicyManifestFileRef): PolicyFileHash | null {
  const normalized = normalizePath(ref.path);
  const absolutePath = repoPath(normalized);

  if (!existsSync(absolutePath)) {
    return null;
  }

  const fileBytes = readFileSync(absolutePath);

  return {
    path: normalized,
    kind: ref.kind,
    required: ref.required,
    hash_algorithm: "sha256",
    hash: sha256(fileBytes.toString("binary"))
  };
}

export function addPolicyHashes(
  manifest: PolicyManifest
): PolicyManifest {
  const fileHashes = allManifestRefs(manifest)
    .map(hashFileRef)
    .filter((entry): entry is PolicyFileHash => entry !== null)
    .sort(comparePolicyFileHashes);

  return {
    ...manifest,
    hashing: {
      hash_algorithm: "sha256",
      hashes_available: true,
      file_hashes: fileHashes
    }
  };
}

export function verifyPolicyHashes(
  manifest: PolicyManifest
): PolicyHashVerificationResult[] {
  if (!manifest.hashing.hashes_available) {
    return allManifestRefs(manifest).map((ref) => ({
      path: normalizePath(ref.path),
      kind: ref.kind,
      required: ref.required,
      status: "not_checked",
      expected_hash: null,
      actual_hash: null
    }));
  }

  const expectedHashes = new Map<string, PolicyFileHash>();

  for (const entry of manifest.hashing.file_hashes as PolicyFileHash[]) {
    expectedHashes.set(
      `${entry.kind}:${normalizePath(entry.path)}`,
      {
        ...entry,
        path: normalizePath(entry.path)
      }
    );
  }

  return allManifestRefs(manifest).map((ref) => {
    const normalized = normalizePath(ref.path);
    const expected = expectedHashes.get(`${ref.kind}:${normalized}`) ?? null;
    const absolutePath = repoPath(normalized);

    if (!expected) {
      return {
        path: normalized,
        kind: ref.kind,
        required: ref.required,
        status: "invalid_entry",
        expected_hash: null,
        actual_hash: null
      };
    }

    if (!existsSync(absolutePath)) {
      return {
        path: normalized,
        kind: ref.kind,
        required: ref.required,
        status: ref.required ? "missing_required" : "missing_optional",
        expected_hash: expected.hash,
        actual_hash: null
      };
    }

    const actualHash = sha256(
      readFileSync(absolutePath).toString("binary")
    );

    return {
      path: normalized,
      kind: ref.kind,
      required: ref.required,
      status: actualHash === expected.hash ? "match" : "mismatch",
      expected_hash: expected.hash,
      actual_hash: actualHash
    };
  });
}
