import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { verify } from "node:crypto";
import { sha256 } from "../common/hash";
import {
  getSchemaValidator,
  formatAjvErrors
} from "../common/schemaValidator";

interface TraceManifestSignatureEnvelope {
  schema_version: "trace-manifest-signature.v1";
  trace_id: string;
  signed_at: string;
  signer: string;
  signer_public_key_fingerprint: string;
  signer_public_key_fingerprint_algorithm: "sha256";
  signature_algorithm: "ed25519";
  manifest_path: string;
  signature_base64: string;
}

interface GovernanceTrustSigner {
  signer_id: string;
  public_key_path: string;
  public_key_fingerprint: string;
  fingerprint_algorithm: "sha256";
  signature_algorithm: "ed25519";
  status: "trusted" | "revoked" | "suspended";
  created_at: string;
  valid_from: string;
  valid_until?: string;
  purpose: "governance_manifest_signing";
}

interface GovernanceTrustManifest {
  schema_version: "governance-trust-manifest.v1";
  generated_at: string;
  trusted_signers: GovernanceTrustSigner[];
}

export interface GovernanceSignatureVerificationResult {
  ok: boolean;
  trace_id: string;
  signer?: string;
  trust_status?: string;
  signature_algorithm?: string;
  signer_public_key_fingerprint?: string;
  reason?: string;
  validation_error?: string;
}

const signatureEnvelopeValidator = getSchemaValidator(
  "schemas/trust/trace-manifest-signature.schema.json"
);

const trustManifestValidator = getSchemaValidator(
  "schemas/trust/governance-trust-manifest.schema.json"
);

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

  const trustManifestPath = resolve(
    process.cwd(),
    "policy",
    "trust",
    "governance-trust-manifest.json"
  );

  for (const requiredPath of [
    manifestPath,
    signaturePath,
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
  const signatureEnvelope = JSON.parse(
    readFileSync(signaturePath, "utf8")
  );
  const trustManifest = JSON.parse(
    readFileSync(trustManifestPath, "utf8")
  );

  if (!signatureEnvelopeValidator(signatureEnvelope)) {
    return {
      ok: false,
      trace_id: traceId,
      reason: "invalid_signature_envelope_schema",
      validation_error: formatAjvErrors(signatureEnvelopeValidator.errors)
    };
  }

  if (!trustManifestValidator(trustManifest)) {
    return {
      ok: false,
      trace_id: traceId,
      reason: "invalid_trust_manifest_schema",
      validation_error: formatAjvErrors(trustManifestValidator.errors)
    };
  }

  const validatedSignatureEnvelope =
    signatureEnvelope as TraceManifestSignatureEnvelope;

  const validatedTrustManifest =
    trustManifest as GovernanceTrustManifest;

  if (validatedSignatureEnvelope.signature_algorithm !== "ed25519") {
    return {
      ok: false,
      trace_id: traceId,
      reason: "unsupported_signature_algorithm"
    };
  }

  if (
    validatedSignatureEnvelope.signer_public_key_fingerprint_algorithm !==
    "sha256"
  ) {
    return {
      ok: false,
      trace_id: traceId,
      reason: "unsupported_fingerprint_algorithm",
      signer: validatedSignatureEnvelope.signer
    };
  }

  const trustedSigner = validatedTrustManifest.trusted_signers.find(
    (signer) =>
      signer.signer_id === validatedSignatureEnvelope.signer &&
      signer.public_key_fingerprint ===
        validatedSignatureEnvelope.signer_public_key_fingerprint &&
      signer.fingerprint_algorithm === "sha256" &&
      signer.signature_algorithm === "ed25519" &&
      signer.status === "trusted" &&
      signer.purpose === "governance_manifest_signing"
  );

  if (!trustedSigner) {
    return {
      ok: false,
      trace_id: traceId,
      reason: "signer_not_trusted",
      signer: validatedSignatureEnvelope.signer,
      signer_public_key_fingerprint:
        validatedSignatureEnvelope.signer_public_key_fingerprint
    };
  }

  const now = Date.now();

  const validFrom = Date.parse(
    trustedSigner.valid_from
  );

  const validUntil = trustedSigner.valid_until
    ? Date.parse(trustedSigner.valid_until)
    : undefined;

  if (Number.isNaN(validFrom)) {
    return {
      ok: false,
      trace_id: traceId,
      reason: "signer_valid_from_invalid",
      signer: validatedSignatureEnvelope.signer
    };
  }

  if (now < validFrom) {
    return {
      ok: false,
      trace_id: traceId,
      reason: "signer_not_yet_valid",
      signer: validatedSignatureEnvelope.signer
    };
  }

  if (
    validUntil !== undefined &&
    !Number.isNaN(validUntil) &&
    now > validUntil
  ) {
    return {
      ok: false,
      trace_id: traceId,
      reason: "signer_expired",
      signer: validatedSignatureEnvelope.signer
    };
  }

  const resolvedPublicKeyPath = resolve(
    process.cwd(),
    trustedSigner.public_key_path
  );

  if (!existsSync(resolvedPublicKeyPath)) {
    return {
      ok: false,
      trace_id: traceId,
      reason: "trusted_signer_public_key_missing",
      signer: validatedSignatureEnvelope.signer
    };
  }

  const trustedPublicKey = readFileSync(
    resolvedPublicKeyPath,
    "utf8"
  );

  const trustedPublicKeyFingerprint =
    sha256(trustedPublicKey);

  if (
    trustedPublicKeyFingerprint !==
    trustedSigner.public_key_fingerprint
  ) {
    return {
      ok: false,
      trace_id: traceId,
      reason:
        "trusted_signer_public_key_fingerprint_mismatch",
      signer: validatedSignatureEnvelope.signer
    };
  }

  const verified = verify(
    null,
    Buffer.from(manifestContent, "utf8"),
    trustedPublicKey,
    Buffer.from(validatedSignatureEnvelope.signature_base64, "base64")
  );

  if (!verified) {
    return {
      ok: false,
      trace_id: traceId,
      reason: "signature_invalid",
      signer: validatedSignatureEnvelope.signer,
      signer_public_key_fingerprint: trustedPublicKeyFingerprint
    };
  }

  return {
    ok: true,
    trace_id: traceId,
    signer: validatedSignatureEnvelope.signer,
    trust_status: trustedSigner.status,
    signature_algorithm: "ed25519",
    signer_public_key_fingerprint: trustedPublicKeyFingerprint
  };
}