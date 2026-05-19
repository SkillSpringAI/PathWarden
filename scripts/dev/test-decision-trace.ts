import { validateAction } from "../../core/kernel/validator";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const invalidResult = validateAction("core", {
  type: "filesystem",
  operation: "move"
});

assert(!invalidResult.ok, "Expected invalid action to be refused");

const invalidTraceId = invalidResult.trace_id;
assert(typeof invalidTraceId === "string", "Expected refusal result to include trace_id");
assert(invalidTraceId.startsWith("trace_"), "Expected refusal trace_id to use trace prefix");

const validResult = validateAction("core", {
  type: "filesystem",
  operation: "list",
  selector: {
    path: "C:\\Users\\Laptop\\Documents"
  }
}, true);

assert(validResult.ok, "Expected valid list action to be allowed");

const validTraceId = validResult.trace_id;
assert(typeof validTraceId === "string", "Expected allowed result to include trace_id");
assert(validTraceId.startsWith("trace_"), "Expected allowed trace_id to use trace prefix");

console.log("Decision trace validation diagnostic passed.");
