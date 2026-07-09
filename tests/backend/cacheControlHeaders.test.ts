import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-cache-headers-"));
  try {
    return await fn(dataDir);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

function getDmToken(server: ReturnType<typeof createServer>): string {
  return server.dmSessionToken;
}

describe("API Cache-Control headers", () => {
  it("sets no-store on an authenticated API response", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir, storageMode: "legacy", allowLegacyTestAuth: true });

      const response = await server.inject({
        method: "GET",
        url: "/api/diagnostics",
        headers: { "x-dm-token": getDmToken(server) },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["cache-control"]).toBe("no-store");
    });
  });

  it("does not add no-store to a public non-sensitive API response", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir, storageMode: "legacy", allowLegacyTestAuth: true });

      const response = await server.inject({ method: "GET", url: "/api/health" });

      expect(response.statusCode).toBe(200);
      expect(response.headers["cache-control"]).toBeUndefined();
    });
  });
});
