import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "dmcc-lan-"));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

describe("LAN join", () => {
  it("exchanges valid access code for player token", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const token = (server as any).dmSessionToken;

      // Create campaign and enable LAN
      await server.inject({
        method: "POST", url: "/api/campaigns",
        payload: { campaignId: "cmp_lan_j", title: "LAN Join Test", actorId: "usr_dm" },
        headers: { "x-dm-token": token },
      });

      const toggleRes = await server.inject({
        method: "POST", url: "/api/campaigns/cmp_lan_j/lan/toggle",
        payload: { enabled: true },
        headers: { "x-dm-token": token },
      });
      expect(toggleRes.statusCode).toBe(200);
      const { accessCode } = toggleRes.json();
      expect(accessCode).toBeTruthy();

      // Exchange code for player token
      const joinRes = await server.inject({
        method: "POST", url: "/api/join/cmp_lan_j",
        payload: { accessCode },
      });
      expect(joinRes.statusCode).toBe(200);
      expect(joinRes.json().playerToken).toBeTruthy();
    });
  });

  it("player token grants access to GET /api/campaigns/:campaignId", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const token = (server as any).dmSessionToken;

      // Create campaign
      await server.inject({
        method: "POST", url: "/api/campaigns",
        payload: { campaignId: "cmp_lan_tok", title: "LAN Token Test", actorId: "usr_dm" },
        headers: { "x-dm-token": token },
      });

      // Enable LAN mode
      const toggleRes = await server.inject({
        method: "POST", url: "/api/campaigns/cmp_lan_tok/lan/toggle",
        payload: { enabled: true },
        headers: { "x-dm-token": token },
      });
      expect(toggleRes.statusCode).toBe(200);
      const { accessCode } = toggleRes.json();

      // Join with access code to get player token
      const joinRes = await server.inject({
        method: "POST", url: "/api/join/cmp_lan_tok",
        payload: { accessCode },
      });
      expect(joinRes.statusCode).toBe(200);
      const { playerToken } = joinRes.json();
      expect(playerToken).toBeTruthy();

      // Use player token to access campaign
      const campaignRes = await server.inject({
        method: "GET", url: "/api/campaigns/cmp_lan_tok",
        headers: { "x-player-token": playerToken },
      });
      expect(campaignRes.statusCode).toBe(200);
    });
  });

  it("rejects invalid access code", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const token = (server as any).dmSessionToken;

      await server.inject({
        method: "POST", url: "/api/campaigns",
        payload: { campaignId: "cmp_lan_bad", title: "LAN Bad Code", actorId: "usr_dm" },
        headers: { "x-dm-token": token },
      });
      await server.inject({
        method: "POST", url: "/api/campaigns/cmp_lan_bad/lan/toggle",
        payload: { enabled: true },
        headers: { "x-dm-token": token },
      });

      const joinRes = await server.inject({
        method: "POST", url: "/api/join/cmp_lan_bad",
        payload: { accessCode: "000000" },
      });
      expect([401, 403]).toContain(joinRes.statusCode);
    });
  });
});
