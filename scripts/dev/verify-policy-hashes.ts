import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { PolicyManifest } from "../../core/policy/policyManifest";
import { validatePolicyManifest } from "../../core/policy/policyManifest";
import { verifyPolicyHashes } from "../../core/policy/policyHasher";

const manifestPathArg = process.argv[2];

if (!manifestPathArg) {
  console.error("Usage: npm run verify:policy-hashes -- <policy_manifest_json_path>");
  process.exit(1);
}

const manifestPath = resolve(process.cwd(), manifestPathArg);

if (!existsSync(manifestPath)) {
  console.error(`Policy manifest not found: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(
  readFileSync(manifestPath, "utf8")
) as PolicyManifest;

validatePolicyManifest(manifest);

const results = verifyPolicyHashes(manifest);

const failed = results.filter((result) =>
  result.status !== "match"
);

const summary = {
  ok: failed.length === 0,
  diagnostic: "policy-hash-verification",
  manifest_id: manifest.manifest_id,
  hashes_available: manifest.hashing.hashes_available,
  total: results.length,
  matched: results.filter((result) => result.status === "match").length,
  failed: failed.length,
  failures: failed
};

console.log(JSON.stringify(summary, null, 2));

if (!summary.ok) {
  process.exit(1);
}
