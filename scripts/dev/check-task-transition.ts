import { canTransitionTaskStatus } from "../../core/tasks/taskLifecycle";

const from = process.argv[2];
const to = process.argv[3];

if (!from || !to) {
  console.log("Usage: check-task-transition <from> <to>");
  process.exit(1);
}

const ok = canTransitionTaskStatus(from as any, to as any);

console.log(JSON.stringify({
  ok,
  from,
  to,
  message: ok ? "Transition allowed" : "Transition blocked"
}, null, 2));
