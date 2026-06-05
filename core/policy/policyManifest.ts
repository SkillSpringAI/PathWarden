import { existsSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  formatAjvErrors,
  getSchemaValidator
} from "../common/schemaValidator";

export type PolicyManifestFileKind =
  | "policy"
  | "governance"
  | "trigger"
  | "trust"
  | "schema"
  | "diagnostic";

export interface PolicyManifestFileRef {
  path: string;
  kind: PolicyManifestFileKind;
  required: boolean;
  hash: string | null;
}

export interface PolicyManifest {
  schema_version: "policy-manifest.v1";
  manifest_id: string;
  created_at: string;
  source: {
    runtime: "pathwarden";
    environment: string;
  };
  policy: {
    files: PolicyManifestFileRef[];
  };
  governance: {
    files: PolicyManifestFileRef[];
  };
  triggers: {
    files: PolicyManifestFileRef[];
  };
  trust: {
    manifest_refs: PolicyManifestFileRef[];
  };
  schemas: {
    files: PolicyManifestFileRef[];
  };
  hashing: {
    hash_algorithm: "sha256" | null;
    hashes_available: boolean;
    file_hashes: object[];
  };
  diagnostics: {
    drift_check_eligible: boolean;
    notes: string[];
  };
}

function repoPath(...parts: string[]): string {
  return resolve(process.cwd(), ...parts);
}

function toRepoRelativePath(absolutePath: string): string {
  return relative(process.cwd(), absolutePath).replace(/\\/g, "/");
}

function createFileRef(
  path: string,
  kind: PolicyManifestFileKind,
  required: boolean
): PolicyManifestFileRef {
  return {
    path: path.replace(/\\/g, "/"),
    kind,
    required,
    hash: null
  };
}

function existingFileRef(
  path: string,
  kind: PolicyManifestFileKind,
  required: boolean
): PolicyManifestFileRef | null {
  const absolutePath = repoPath(path);

  if (!existsSync(absolutePath)) {
    return required
      ? createFileRef(path, kind, required)
      : null;
  }

  return createFileRef(path, kind, required);
}

function listSchemaFiles(): PolicyManifestFileRef[] {
  const schemaRoot = repoPath("schemas");

  if (!existsSync(schemaRoot)) {
    return [];
  }

  const refs: PolicyManifestFileRef[] = [];

  function walk(directory: string): void {
    const entries = readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(".schema.json")) {
        refs.push(
          createFileRef(
            toRepoRelativePath(absolutePath),
            "schema",
            true
          )
        );
      }
    }
  }

  walk(schemaRoot);

  return refs.sort(compareFileRefs);
}

function compareFileRefs(
  left: PolicyManifestFileRef,
  right: PolicyManifestFileRef
): number {
  return (
    left.kind.localeCompare(right.kind) ||
    left.path.localeCompare(right.path)
  );
}

function compactRefs(
  refs: Array<PolicyManifestFileRef | null>
): PolicyManifestFileRef[] {
  return refs
    .filter((ref): ref is PolicyManifestFileRef => ref !== null)
    .sort(compareFileRefs);
}

function createManifestId(createdAt: string): string {
  const safeTimestamp = createdAt
    .replace(/[^0-9A-Za-z]/g, "")
    .slice(0, 20);

  return `policymanifest_${safeTimestamp}`;
}

export function buildPolicyManifest(
  createdAt = new Date().toISOString()
): PolicyManifest {
  const policyFiles = compactRefs([
    existingFileRef("config/access-policy.json", "policy", true),
    existingFileRef("config/schedule-policy.json", "policy", false),
    existingFileRef("config/startup.json", "policy", false),
    existingFileRef("schemas/policy/execution-policy.schema.json", "policy", true)
  ]);

  const governanceFiles = compactRefs([
    existingFileRef("docs/governance/AUTHORITY_SNAPSHOT_DESIGN.md", "governance", true),
    existingFileRef("docs/governance/AUTHORITY_EXPORT_VERIFICATION_DESIGN.md", "governance", true),
    existingFileRef("docs/governance/POLICY_MANIFEST_DESIGN.md", "governance", true),
    existingFileRef("docs/governance/POLICY_HASHING_DESIGN.md", "governance", true),
    existingFileRef("docs/governance/GOVERNANCE_REPORTING_DESIGN.md", "governance", true)
  ]);

  const triggerFiles = compactRefs([
    existingFileRef("schemas/triggers/trigger-hit.schema.json", "trigger", false),
    existingFileRef("schemas/triggers/trigger-registry.schema.json", "trigger", false)
  ]);

  const trustManifestRefs = compactRefs([
    existingFileRef("schemas/trust/governance-trust-manifest.schema.json", "trust", true)
  ]);

  return {
    schema_version: "policy-manifest.v1",
    manifest_id: createManifestId(createdAt),
    created_at: createdAt,
    source: {
      runtime: "pathwarden",
      environment: "local"
    },
    policy: {
      files: policyFiles
    },
    governance: {
      files: governanceFiles
    },
    triggers: {
      files: triggerFiles
    },
    trust: {
      manifest_refs: trustManifestRefs
    },
    schemas: {
      files: listSchemaFiles()
    },
    hashing: {
      hash_algorithm: null,
      hashes_available: false,
      file_hashes: []
    },
    diagnostics: {
      drift_check_eligible: true,
      notes: [
        "Initial policy manifest implementation records repository-relative file references only.",
        "Hash fields are intentionally null until Policy Hashing implementation.",
        "Policy manifest is not executable."
      ]
    }
  };
}

export function validatePolicyManifest(
  manifest: PolicyManifest
): void {
  const validator = getSchemaValidator(
    "schemas/policy/policy-manifest.schema.json"
  );

  const valid = validator(manifest);

  if (!valid) {
    throw new Error(
      "Invalid policy manifest: " +
      formatAjvErrors(validator.errors)
    );
  }
}
