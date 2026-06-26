import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "dmcc-player-portal-"));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

async function seedPlayer(server: any, campaignId = "cmp_portal") {
  const token = (server as any).dmSessionToken;
  await server.inject({
    method: "POST",
    url: "/api/campaigns",
    payload: { campaignId, title: "Portal Campaign", actorId: "usr_dm" },
    headers: { "x-dm-token": token },
  });
  await server.inject({
    method: "POST",
    url: `/api/campaigns/${campaignId}/players`,
    payload: { playerId: "ply_1", name: "Player One", displayName: "Player One" },
    headers: { "x-dm-token": token },
  });
  return token;
}

describe("player portal tokens", () => {
  it("issues a raw token once and does not expose it in dm summary", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dmToken = await seedPlayer(server);

      const res = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_portal/players/ply_1/token",
        payload: { label: "phone" },
        headers: { "x-dm-token": dmToken },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().tokenId).toMatch(/^ptok_/);
      expect(res.json().token).toMatch(/^[A-Z0-9]{8}$/);
      expect(res.json().tokenHash).toBeUndefined();
    });
  });
});
