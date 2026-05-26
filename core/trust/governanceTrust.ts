import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { verify } from "node:crypto";
import { sha256 } from "../common/hash";

export interface GovernanceSignatureVerificationResult {
  ok: boolean;
  trace_id: string;
  signer?: string;
  trust_status?: string;
  signature_algorithm?: string;
  signer_public_key_fingerprint?: string;
  reason?: string;
}

export function verifyGovernanceManifestSignature(
  traceId: string
): GovernanceSignatureVerificationResult {

  const manifestPath = resolve(
    process.cwd(),
    "exports",
    "traces",
    `${traceId}.manifest.json`
  );

  const signaturePath = resolve(
    process.cwd(),
    "exports",
    "traces",
    `${traceId}.manifest.sig.json`
  );

  const publicKeyPath = resolve(
    process.cwd(),
    "config",
    "keys",
    "dev-governance-public.pem"
  );

  const trustManifestPath = resolve(
    process.cwd(),
    "policy",
    "trust",
    "governance-trust-manifest.json"
  );

  for (const requiredPath of [
    manifestPath,
    signaturePath,
    publicKeyPath,
    trustManifestPath
  ]) {
    if (!existsSync(requiredPath)) {
      return {
        ok: false,
        trace_id: traceId,
        reason: `missing_required_file:${requiredPath}`
      };
    }
  }

  const manifestContent = readFileSync(manifestPath, "utf8");
  const signatureEnvelope = JSON.parse(readFileSync(signaturePath, "utf8"));
  const publicKey = readFileSync(publicKeyPath, "utf8");
  const trustManifest = JSON.parse(readFileSync(trustManifestPath, "utf8"));

  const publicKeyFingerprint = sha256(publicKey);

  if (signatureEnvelope.signature_algorithm !== "ed25519") {
    return {
      ok: false,
      trace_id: traceId,
      reason: "unsupported_signature_algorithm"
    };
  }

  if (
    signatureEnvelope.signer_public_key_fingerprint_algorithm !== "sha256" ||
    signatureEnvelope.signer_public_key_fingerprint !== publicKeyFingerprint
  ) {
    return {
      ok: false,
      trace_id: traceId,
      reason: "signer_public_key_fingerprint_mismatch",
      signer: signatureEnvelope.signer,
      signer_public_key_fingerprint: publicKeyFingerprint
    };
  }

  const trustedSigner = trustManifest.trusted_signers?.find(
    (signer: {
      signer_id?: string;
      public_key_fingerprint?: string;
      fingerprint_algorithm?: string;
      signature_algorithm?: string;
      status?: string;
    }) =>
      signer.signer_id === signatureEnvelope.signer &&
      signer.public_key_fingerprint === signatureEnvelope.signer_public_key_fingerprint &&
      signer.fingerprint_algorithm === "sha256" &&
      signer.signature_algorithm === "ed25519" &&
      signer.status === "trusted"
  );

  if (!trustedSigner) {
    return {
      ok: false,
      trace_id: traceId,
      reason: "signer_not_trusted",
      signer: signatureEnvelope.signer,
      signer_public_key_fingerprint:
        signatureEnvelope.signer_public_key_fingerprint
    };
  }

  const verified = verify(
    null,
    Buffer.from(manifestContent, "utf8"),
    publicKey,
    Buffer.from(signatureEnvelope.signature_base64, "base64")
  );

  if (!verified) {
    return {
      ok: false,
      trace_id: traceId,
      reason: "signature_invalid",
      signer: signatureEnvelope.signer,
      signer_public_key_fingerprint: publicKeyFingerprint
    };
  }

  return {
    ok: true,
    trace_id: traceId,
    signer: signatureEnvelope.signer,
    trust_status: trustedSigner.status,
    signature_algorithm: "ed25519",
    signer_public_key_fingerprint: publicKeyFingerprint
  };
}