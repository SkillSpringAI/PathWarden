import {
  getDiagnosticMetadataRegistry,
  validateDiagnosticMetadataRegistry
} from "../../core/common/diagnostics/diagnosticRegistry";

validateDiagnosticMetadataRegistry();

const registry = getDiagnosticMetadataRegistry();

const active = registry.filter((metadata) => metadata.status === "active");
const blocking = registry.filter((metadata) => metadata.blocking);
const ciCompatible = registry.filter((metadata) => metadata.ci_compatible);

console.log(JSON.stringify({
  ok: true,
  diagnostic: "diagnostic-metadata-registry-validation",
  total: registry.length,
  active: active.length,
  blocking: blocking.length,
  ci_compatible: ciCompatible.length,
  ids: registry.map((metadata) => metadata.id)
}, null, 2));
