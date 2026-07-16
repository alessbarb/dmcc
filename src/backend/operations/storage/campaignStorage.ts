import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join, resolve, sep } from "node:path";

function getDataDir(): string {
  return process.env.DMCC_DATA_DIR ?? join(homedir(), "Documents", "DMCampaignCompanion");
}

export async function deleteStorageKey(key: string): Promise<void> {
  if (!key || key.trim() === "") {
    throw new Error("Empty storage key");
  }

  // Enforce relative path rules
  if (isAbsolute(key)) {
    throw new Error("Absolute paths are forbidden");
  }

  // Prevent path traversal (no ".." segments)
  const segments = key.split(/[/\\]/);
  if (segments.includes("..") || segments.includes(".")) {
    throw new Error("Path traversal segments (.. or .) are forbidden");
  }

  const dataDir = resolve(getDataDir());
  const resolvedPath = resolve(dataDir, key);

  // Enforce that the path resolves strictly inside the dataDir
  if (!resolvedPath.startsWith(dataDir + sep) && resolvedPath !== dataDir) {
    throw new Error("Target path is outside the data directory");
  }

  if (existsSync(resolvedPath)) {
    await rm(resolvedPath, { recursive: true, force: true });
  }
}
