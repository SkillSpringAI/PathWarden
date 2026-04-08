import Ajv, { type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

const ajv = new Ajv({
  allErrors: true,
  strict: false
});

addFormats(ajv);

const validatorCache = new Map<string, ValidateFunction>();

function loadJson(absolutePath: string): unknown {
  const raw = readFileSync(absolutePath, "utf8");
  return JSON.parse(raw);
}

function registerSchemaRecursive(absolutePath: string, seen = new Set<string>()): void {
  const normalized = absolutePath.replace(/\\/g, "/");
  if (seen.has(normalized)) {
    return;
  }
  seen.add(normalized);

  const schema = loadJson(absolutePath) as Record<string, unknown>;
  const schemaDir = dirname(absolutePath);

  if (!ajv.getSchema(normalized)) {
    ajv.addSchema(schema, normalized);
  }

  collectRefs(schema).forEach(ref => {
    if (typeof ref !== "string") return;
    if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("#")) return;

    const childAbsolute = resolve(schemaDir, ref);
    registerSchemaRecursive(childAbsolute, seen);
  });
}

function collectRefs(node: unknown, refs: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const item of node) collectRefs(item, refs);
    return refs;
  }

  if (node && typeof node === "object") {
    const record = node as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      if (key === "$ref" && typeof value === "string") {
        refs.push(value);
      } else {
        collectRefs(value, refs);
      }
    }
  }

  return refs;
}

export function getSchemaValidator(relativeSchemaPath: string): ValidateFunction {
  const absolutePath = resolve(process.cwd(), "Pathwarden", relativeSchemaPath).replace(/\\/g, "/");

  if (validatorCache.has(absolutePath)) {
    return validatorCache.get(absolutePath)!;
  }

  registerSchemaRecursive(absolutePath);

  const validator = ajv.getSchema(absolutePath);
  if (!validator) {
    throw new Error(`Failed to compile schema: ${absolutePath}`);
  }

  validatorCache.set(absolutePath, validator);
  return validator;
}

export function formatAjvErrors(errors: ValidateFunction["errors"]): string {
  if (!errors || errors.length === 0) {
    return "Unknown schema validation error";
  }

  return errors
    .map(err => {
      const location = err.instancePath || "/";
      return `${location} ${err.message ?? "validation error"}`.trim();
    })
    .join("; ");
}
