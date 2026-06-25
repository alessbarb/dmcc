import * as fs from "fs/promises";
import * as path from "path";

export class JsonSnapshotStore {
  constructor(public readonly filePath: string) {}

  /**
   * Writes the snapshot JSON atomically using a temp file.
   */
  public async write(snapshot: any): Promise<void> {
    const tempPath = this.filePath + ".tmp";
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(tempPath, JSON.stringify(snapshot, null, 2), "utf8");
    await fs.rename(tempPath, this.filePath);
  }

  /**
   * Reads and parses the snapshot JSON file. Returns null if not found.
   */
  public async read(): Promise<any | null> {
    try {
      const content = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(content);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }
}
