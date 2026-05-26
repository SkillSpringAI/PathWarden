import { createHash } from "node:crypto";

export function sha256(value: string): string {
  return createHash("sha256")
    .update(value, "utf8")
    .digest("hex");
}

export function hashAuthorityChain(authorityChain: string[]): string {
  return sha256(JSON.stringify(authorityChain));
}
