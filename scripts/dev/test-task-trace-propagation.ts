import { runTask } from "../../core/tasks/taskRunner";
import type { PathwardenTask } from "../../core/tasks/taskTypes";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const task: PathwardenTask = {
  task_id: "task-trace-diagnostic",
  name: "Trace diagnostic task",
  type: "run_diagnostics",
  mode: "core",
  status: "pending",
  created_at: new Date().toISOString(),
  requires_confirmation: false,
  approved: true,
  auto_run: false
};

const result = runTask(task);

assert(typeof task.trace_id === "string", "Expected task to receive trace_id");
assert(task.trace_id.startsWith("trace_"), "Expected task trace_id to use trace prefix");
assert(result.trace_id === task.trace_id, "Expected result trace_id to match task trace_id");
assert(result.status === "completed", "Expected diagnostic task to complete");

console.log("Task trace propagation diagnostic passed.");
