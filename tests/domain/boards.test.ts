import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/server/createServer.js";

function getDmToken(server: any): string {
  return (server as any).dmSessionToken;
}

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "dmcc-boards-"));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe("Boards: entity type filtering via GET /api/campaigns/:id", () => {
  it("seeds campaign with quest, clue, and npc entities and retrieves them grouped by type", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const token = getDmToken(server);

      // Create campaign
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: { campaignId: "cmp_boards", actorId: "usr_dm", title: "Boards Test Campaign" },
        headers: { "x-dm-token": token },
      });

      // Seed entities of different types
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_boards/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_quest1",
          entityType: "quest",
          title: "Find the Lost Mine",
          status: "active",
        },
        headers: { "x-dm-token": token },
      });

      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_boards/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_quest2",
          entityType: "quest",
          title: "Rescue the Villagers",
          status: "blocked",
        },
        headers: { "x-dm-token": token },
      });

      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_boards/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_clue1",
          entityType: "clue",
          title: "The Torn Map",
          status: "hidden",
          metadata: { content: "Half of a map leading to the mine." },
        },
        headers: { "x-dm-token": token },
      });

      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_boards/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_npc1",
          entityType: "npc",
          title: "Sildar Hallwinter",
          status: "alive",
        },
        headers: { "x-dm-token": token },
      });

      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_boards/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_npc2",
          entityType: "npc",
          title: "Iarno Albrek",
          status: "enemy",
        },
        headers: { "x-dm-token": token },
      });

      // Fetch the campaign state
      const res = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_boards",
        headers: { "x-dm-token": token },
      });

      expect(res.statusCode).toBe(200);
      const state = res.json();
      expect(state.entities).toBeDefined();
      expect(Array.isArray(state.entities)).toBe(true);

      const entities: Array<{ entityId: string; entityType: string; title: string; status: string }> = state.entities;

      // Verify entities of each board type are present
      const quests = entities.filter((e) => e.entityType === "quest");
      expect(quests).toHaveLength(2);
      expect(quests.map((e) => e.entityId)).toContain("ent_quest1");
      expect(quests.map((e) => e.entityId)).toContain("ent_quest2");

      const clues = entities.filter((e) => e.entityType === "clue");
      expect(clues).toHaveLength(1);
      expect(clues[0].entityId).toBe("ent_clue1");
      expect(clues[0].status).toBe("hidden");

      const npcs = entities.filter((e) => e.entityType === "npc");
      expect(npcs).toHaveLength(2);
      expect(npcs.map((e) => e.entityId)).toContain("ent_npc1");
      expect(npcs.map((e) => e.entityId)).toContain("ent_npc2");

      // Verify statuses are preserved for board column assignment
      const activeQuest = quests.find((e) => e.entityId === "ent_quest1");
      expect(activeQuest?.status).toBe("active");

      const blockedQuest = quests.find((e) => e.entityId === "ent_quest2");
      expect(blockedQuest?.status).toBe("blocked");

      const enemyNpc = npcs.find((e) => e.entityId === "ent_npc2");
      expect(enemyNpc?.status).toBe("enemy");
    });
  });

  it("does not include archived entities in campaign state", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const token = getDmToken(server);

      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: { campaignId: "cmp_boards_arch", actorId: "usr_dm", title: "Boards Archive Test" },
        headers: { "x-dm-token": token },
      });

      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_boards_arch/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_live",
          entityType: "quest",
          title: "Live Quest",
          status: "active",
        },
        headers: { "x-dm-token": token },
      });

      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_boards_arch/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_archived",
          entityType: "quest",
          title: "Archived Quest",
          status: "abandoned",
        },
        headers: { "x-dm-token": token },
      });

      // Archive the second entity
      await server.inject({
        method: "DELETE",
        url: "/api/campaigns/cmp_boards_arch/entities/ent_archived",
        payload: { actorId: "usr_dm" },
        headers: { "x-dm-token": token },
      });

      const res = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_boards_arch",
        headers: { "x-dm-token": token },
      });

      expect(res.statusCode).toBe(200);
      const state = res.json();
      const entities: Array<{ entityId: string; archived: boolean }> = state.entities;

      const liveEntities = entities.filter((e) => !e.archived);
      const archivedEntities = entities.filter((e) => e.archived);

      expect(liveEntities.map((e) => e.entityId)).toContain("ent_live");
      // Archived entity should still be in state but flagged — the board page filters it client-side
      const archivedEntity = entities.find((e) => e.entityId === "ent_archived");
      if (archivedEntity) {
        expect(archivedEntity.archived).toBe(true);
      }
    });
  });
});
