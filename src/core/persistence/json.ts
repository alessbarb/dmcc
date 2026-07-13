import * as fs from "fs/promises";
import { dirname } from "path";

/**
 * Writes JSON data atomically to the specified file path by writing to a temporary file,
 * syncing it to disk, renaming it to the final destination, and syncing the parent directory.
 */
export async function atomicWriteJson(filePath: string, data: unknown): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  const dirPath = dirname(filePath);
  const content = JSON.stringify(data, null, 2);

  // 1. Write to temporary file and fsync the file descriptor
  const handle = await fs.open(tempPath, "w");
  try {
    await handle.writeFile(content, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }

  // 2. Rename atomically
  await fs.rename(tempPath, filePath);

  // 3. fsync the parent directory to commit the directory entry changes
  try {
    const dirHandle = await fs.open(dirPath, "r");
    try {
      await dirHandle.sync();
    } finally {
      await dirHandle.close();
    }
  } catch {
    // Fallback if directory opening/syncing is not supported on the OS/storage backend
  }
}
