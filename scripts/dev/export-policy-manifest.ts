import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildPolicyManifest,
  validatePolicyManifest
} from "../../core/policy/policyManifest";

const manifest = buildPolicyManifest();

validatePolicyManifest(manifest);

const exportDir = resolve(
  process.cwd(),
  "exports",
  "policy"
);

mkdirSync(exportDir, { recursive: true });

const exportPath = resolve(
  exportDir,
  `${manifest.manifest_id}.json`
);

writeFileSync(
  exportPath,
  JSON.stringify(manifest, null, 2),
  "utf8"
);

console.log(`Policy manifest written to: ${exportPath}`);
console.log(`Manifest id: ${manifest.manifest_id}`);
console.log(`Policy files: ${manifest.policy.files.length}`);
console.log(`Governance files: ${manifest.governance.files.length}`);
console.log(`Trigger files: ${manifest.triggers.files.length}`);
console.log(`Trust refs: ${manifest.trust.manifest_refs.length}`);
console.log(`Schema files: ${manifest.schemas.files.length}`);
console.log(`Hashes available: ${manifest.hashing.hashes_available}`);
