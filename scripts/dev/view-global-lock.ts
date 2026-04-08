import { loadGlobalLock } from "../../core/common/globalLock";

const lockName = process.argv[2];

if (!lockName) {
  console.log("Usage: view-global-lock <lock_name>");
  process.exit(1);
}

const lock = loadGlobalLock(lockName);

if (!lock) {
  console.log(`No global lock found: ${lockName}`);
  process.exit(0);
}

console.log(JSON.stringify(lock, null, 2));
