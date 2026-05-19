import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import type { PermissionToken } from "../kernel/permissionToken";
import type { DecisionLegitimacyArtifact } from "../kernel/legitimacyArtifact";

export type AuthorityArtifactRecord =
  | {
      record_type: "permission_token";
      trace_id: string;
      timestamp: string;
      token: PermissionToken;
    }
  | {
      record_type: "legitimacy_artifact";
      trace_id: string;
      timestamp: string;
      artifact: DecisionLegitimacyArtifact;
    };

function authorityDir(): string {
  return resolve(process.cwd(), "audit", "authority");
}

function authorityFilePath(timestamp: string): string {
  const date = timestamp.slice(0, 10);
  return resolve(authorityDir(), `${date}.jsonl`);
}

export function writeAuthorityArtifact(record: AuthorityArtifactRecord): void {
  const dir = authorityDir();

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  appendFileSync(
    authorityFilePath(record.timestamp),
    JSON.stringify(record) + "\n",
    "utf8"
  );
}
