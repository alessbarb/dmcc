#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";

const outputPath = "dist/dmcc.tar.gz";
mkdirSync("dist", { recursive: true });

const listed = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
  encoding: "buffer",
});

if (listed.status !== 0) {
  process.stderr.write(listed.stderr);
  process.exit(listed.status ?? 1);
}

const files = listed.stdout
  .toString("utf8")
  .split("\0")
  .filter(Boolean)
  .filter((file) => file !== outputPath)
  .filter((file) => existsSync(file));

const input = `${files.join("\0")}\0`;
const archived = spawnSync("tar", ["--null", "-czf", outputPath, "--files-from=-"], {
  input,
  stdio: ["pipe", "inherit", "inherit"],
});

process.exit(archived.status ?? 0);
