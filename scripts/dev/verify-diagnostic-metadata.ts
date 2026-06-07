import {
  getDiagnosticMetadataRegistry,
  validateDiagnosticMetadataRegistry
} from "../../core/common/diagnostics/diagnosticRegistry";

type VerificationFailure = {
  code: string;
  message: string;
};

const DIAGNOSTIC_ID_PATTERN = /^diag\.[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

function verifyDiagnosticMetadata(): VerificationFailure[] {
  const failures: VerificationFailure[] = [];
  const registry = getDiagnosticMetadataRegistry();
  const ids = new Set<string>();

  try {
    validateDiagnosticMetadataRegistry();
  } catch (error) {
    failures.push({
      code: "REGISTRY_VALIDATION_FAILED",
      message: error instanceof Error ? error.message : String(error)
    });
  }

  for (const metadata of registry) {
    if (!DIAGNOSTIC_ID_PATTERN.test(metadata.id)) {
      failures.push({
        code: "INVALID_DIAGNOSTIC_ID_PATTERN",
        message: `Diagnostic id does not match required pattern: ${metadata.id}`
      });
    }

    if (ids.has(metadata.id)) {
      failures.push({
        code: "DUPLICATE_DIAGNOSTIC_ID",
        message: `Duplicate diagnostic metadata id: ${metadata.id}`
      });
    }

    ids.add(metadata.id);

    if (metadata.dependencies.includes(metadata.id)) {
      failures.push({
        code: "SELF_REFERENTIAL_DEPENDENCY",
        message: `Diagnostic cannot depend on itself: ${metadata.id}`
      });
    }

    if (metadata.status === "active" && metadata.tags.length === 0) {
      failures.push({
        code: "ACTIVE_DIAGNOSTIC_WITHOUT_TAGS",
        message: `Active diagnostic must have at least one tag: ${metadata.id}`
      });
    }

    if (metadata.tags.some((tag) => tag.trim().length === 0)) {
      failures.push({
        code: "EMPTY_DIAGNOSTIC_TAG",
        message: `Diagnostic contains an empty tag: ${metadata.id}`
      });
    }

    if (metadata.blocking && !metadata.ci_compatible) {
      failures.push({
        code: "BLOCKING_DIAGNOSTIC_NOT_CI_COMPATIBLE",
        message:
          `Blocking diagnostic must be CI-compatible unless explicitly redesigned later: ${metadata.id}`
      });
    }

    if (metadata.status === "active" && metadata.ci_compatible && metadata.requires.network) {
      failures.push({
        code: "ACTIVE_CI_DIAGNOSTIC_REQUIRES_NETWORK",
        message:
          `Active CI-compatible diagnostic must not require network access: ${metadata.id}`
      });
    }

    if (metadata.status === "active" && metadata.requires.manual_approval) {
      failures.push({
        code: "ACTIVE_DIAGNOSTIC_REQUIRES_MANUAL_APPROVAL",
        message:
          `Active diagnostic must not require manual approval unless execution semantics are separated: ${metadata.id}`
      });
    }
  }

  for (const metadata of registry) {
    for (const dependency of metadata.dependencies) {
      if (!ids.has(dependency)) {
        failures.push({
          code: "MISSING_DIAGNOSTIC_DEPENDENCY",
          message: `Diagnostic dependency not found: ${metadata.id} -> ${dependency}`
        });
      }
    }
  }

  return failures;
}

function main(): void {
  const registry = getDiagnosticMetadataRegistry();
  const failures = verifyDiagnosticMetadata();

  if (failures.length > 0) {
    console.error("Diagnostic metadata verification failed:");

    for (const failure of failures) {
      console.error(`- ${failure.code}: ${failure.message}`);
    }

    process.exit(1);
  }

  const active = registry.filter((metadata) => metadata.status === "active");
  const planned = registry.filter((metadata) => metadata.status === "planned");
  const blocking = registry.filter((metadata) => metadata.blocking);
  const ciCompatible = registry.filter((metadata) => metadata.ci_compatible);

  console.log(JSON.stringify({
    ok: true,
    diagnostic: "diagnostic-metadata-registry-validation",
    total: registry.length,
    active: active.length,
    planned: planned.length,
    blocking: blocking.length,
    ci_compatible: ciCompatible.length,
    ids: registry.map((metadata) => metadata.id)
  }, null, 2));
}

main();