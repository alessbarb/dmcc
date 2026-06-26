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

async function issueToken(server: any, dmToken: string) {
  const res = await server.inject({
    method: "POST",
    url: "/api/campaigns/cmp_portal/players/ply_1/token",
    payload: { label: "phone" },
    headers: { "x-dm-token": dmToken },
  });
  return res.json().token as string;
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

it("lets a token-authenticated player update their own live status", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dmToken = await seedPlayer(server);
    const playerToken = await issueToken(server, dmToken);

    const update = await server.inject({
      method: "PUT",
      url: "/api/campaigns/cmp_portal/player-portal/status",
      payload: { characterEntityId: "ent_pc_1", hitPointsCurrent: 7, hitPointsMax: 12, armorClass: 14, inspiration: true, conditions: ["poisoned"] },
      headers: { "x-player-token": playerToken },
    });

    expect(update.statusCode).toBe(200);

    const state = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal/player-portal/state",
      headers: { "x-player-token": playerToken },
    });

    expect(state.statusCode).toBe(200);
    expect(state.json().sheet.status.hitPointsCurrent).toBe(7);
    expect(state.json().sheet.status.conditions).toEqual(["poisoned"]);
  });
});

it("does not return private notes in dm summary", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dmToken = await seedPlayer(server);
    const playerToken = await issueToken(server, dmToken);

    await server.inject({
      method: "POST",
      url: "/api/campaigns/cmp_portal/player-portal/notes",
      payload: { title: "Private note", content: "secret", visibility: "private", linkedEntityIds: [] },
      headers: { "x-player-token": playerToken },
    });
    await server.inject({
      method: "POST",
      url: "/api/campaigns/cmp_portal/player-portal/notes",
      payload: { title: "DM note", content: "visible", visibility: "dm_visible", linkedEntityIds: [] },
      headers: { "x-player-token": playerToken },
    });

    const summary = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal/player-portal/dm-summary",
      headers: { "x-dm-token": dmToken },
    });

    expect(summary.statusCode).toBe(200);
    expect(summary.json().players[0].notes.map((note: any) => note.title)).toEqual(["DM note"]);
  });
});
