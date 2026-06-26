import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "dmcc-tags-"));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

describe("Tags", () => {
  it("creates a tag and lists it back", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const token = (server as any).dmSessionToken;

      await server.inject({
        method: "POST", url: "/api/campaigns",
        payload: { campaignId: "cmp_tag1", title: "Tag Test", actorId: "usr_dm" },
        headers: { "x-dm-token": token },
      });

      const createRes = await server.inject({
        method: "POST", url: "/api/campaigns/cmp_tag1/tags",
        payload: { name: "protagonistas", color: "#6366f1" },
        headers: { "x-dm-token": token },
      });
      expect(createRes.statusCode).toBe(201);
      expect(createRes.json().tagId).toMatch(/^tag_/);

      const listRes = await server.inject({
        method: "GET", url: "/api/campaigns/cmp_tag1/tags",
        headers: { "x-dm-token": token },
      });
      expect(listRes.statusCode).toBe(200);
      const tags = listRes.json().tags;
      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe("protagonistas");
    });
  });
});
