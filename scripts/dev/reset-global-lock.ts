import { releaseGlobalLock } from "../../core/common/globalLock";

const lockName = process.argv[2];

if (!lockName) {
  console.log("Usage: reset-global-lock <lock_name>");
  process.exit(1);
}

releaseGlobalLock(lockName);
console.log(`Global lock released: ${lockName}`);
