import { isPathAllowed } from "../../capabilities/filesystem/pathGuards";

const tests = [
  "C:\\Users\\Laptop\\Documents\\test.txt",
  "C:\\Users\\Laptop\\Downloads\\sample.txt",
  "C:\\Windows\\System32\\drivers\\etc\\hosts",
  "C:\\Users\\Laptop\\AppData\\Local\\Temp\\x.txt"
];

for (const target of tests) {
  console.log(target, "=>", isPathAllowed(target));
}
