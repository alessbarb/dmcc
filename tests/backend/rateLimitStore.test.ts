import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PersistentRateLimit } from "../../src/backend/server/rateLimitStore.js";

describe("PersistentRateLimit lifecycle", () => {
  it("flushes pending state before closing", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "dmcc-rate-limit-"));
    const filePath = join(dataDir, "rate-limits-test.json");

    try {
      const store = await PersistentRateLimit.load(dataDir, "test");
      store.set("client", { count: 1, resetAt: Date.now() + 60_000 });

      await store.close();

      expect(JSON.parse(await readFile(filePath, "utf8"))).toMatchObject({
        client: { count: 1 },
      });
    } finally {
      await rm(dataDir, { recursive: true, force: true });
    }
  });
});
