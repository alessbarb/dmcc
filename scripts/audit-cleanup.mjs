import { spawnSync } from "node:child_process";

const tasks = [
  ["npm", ["run", "audit:unused"]],
  ["npm", ["run", "audit:orphans"]],
  ["npm", ["run", "audit:cycles"]],
  ["npm", ["run", "audit:duplicates"]],
  ["npm", ["run", "audit:deps"]],
];

let failed = false;

for (const [command, args] of tasks) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) {
    failed = true;
  }
}

process.exitCode = failed ? 1 : 0;
