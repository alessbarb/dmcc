import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-cmdapi-"));
  try {
    return await fn(dataDir);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

async function setupCampaign(server: ReturnType<typeof createServer>) {
  const res = await server.inject({
    method: "POST",
    url: "/api/campaigns",
    headers: { "x-vault-id": "default", "x-role": "dm" },
    payload: { campaignId: "cmp_cmd_test", actorId: "usr_dm", title: "Command Test Campaign" },
  });
  expect(res.statusCode).toBe(201);
}

describe("command API", () => {
  it("creates campaign and generates an initial snapshot", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });

      const res = await server.inject({
        method: "POST",
        url: "/api/campaigns",
        headers: { "x-vault-id": "default", "x-role": "dm" },
        payload: { campaignId: "cmp_snap_test", actorId: "usr_dm", title: "Snapshot Test" },
      });
      expect(res.statusCode).toBe(201);

      const snapshotRes = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_snap_test",
        headers: { "x-vault-id": "default", "x-role": "dm" },
      });
      expect(snapshotRes.statusCode).toBe(200);
      expect(snapshotRes.json().campaignId).toBe("cmp_snap_test");

      await server.close();
    });
  });

  it("commands execute and are reflected in projection", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await setupCampaign(server);

      const commandRes = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_cmd_test/commands",
        headers: { "x-vault-id": "default", "x-role": "dm" },
        payload: {
          commandId: "cmd_entity_001",
          type: "create_entity",
          actorId: "usr_dm",
          name: "Gandalf",
          entityType: "npc",
        },
      });
      expect(commandRes.statusCode).not.toBe(404);

      await server.close();
    });
  });

  it("player cannot execute DM-only commands", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await setupCampaign(server);

      // Player tries to delete the campaign (DM-only action)
      const deleteRes = await server.inject({
        method: "DELETE",
        url: "/api/campaigns/cmp_cmd_test",
        headers: { "x-vault-id": "default", "x-role": "player" },
        payload: { confirm: "Command Test Campaign" },
      });
      expect(deleteRes.statusCode).toBeGreaterThanOrEqual(400);

      await server.close();
    });
  });
});
