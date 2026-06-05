import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildPolicyManifest,
  validatePolicyManifest
} from "../../core/policy/policyManifest";
import { addPolicyHashes } from "../../core/policy/policyHasher";

const manifest = addPolicyHashes(
  buildPolicyManifest()
);

validatePolicyManifest(manifest);

const exportDir = resolve(
  process.cwd(),
  "exports",
  "policy"
);

mkdirSync(exportDir, { recursive: true });

const exportPath = resolve(
  exportDir,
  `${manifest.manifest_id}_hashed.json`
);

writeFileSync(
  exportPath,
  JSON.stringify(manifest, null, 2),
  "utf8"
);

console.log(`Hashed policy manifest written to: ${exportPath}`);
console.log(`Manifest id: ${manifest.manifest_id}`);
console.log(`Hashes available: ${manifest.hashing.hashes_available}`);
console.log(`Hash algorithm: ${manifest.hashing.hash_algorithm}`);
console.log(`File hashes: ${manifest.hashing.file_hashes.length}`);
