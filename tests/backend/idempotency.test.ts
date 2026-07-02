import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

async function withTempDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-idempotency-"));
  try {
    return await fn(dataDir);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

function getDmToken(server: any): string {
  return (server as any).dmSessionToken;
}

describe("Idempotency and Conflict API assertions", () => {
  it("handles idempotent command retries and prevents commandId conflict reuse", async () => {
    await withTempDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const token = getDmToken(server);

      // Create campaign first
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: { campaignId: "cmp_idem", actorId: "usr_dm", title: "Idempotency Test Campaign" },
        headers: { "x-dm-token": token },
      });

      // 1. Send first entity creation command with explicit command-id header
      const commandId = "cmd_entity_create_123";
      const payload1 = {
        actorId: "usr_dm",
        entityId: "ent_idem_1",
        entityType: "npc",
        title: "Unique NPC",
      };

      const res1 = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_idem/entities",
        payload: payload1,
        headers: {
          "x-dm-token": token,
          "command-id": commandId,
        },
      });
      expect(res1.statusCode).toBe(201);

      // 2. Retry exact same command with same command-id header -> no duplicate write
      const res2 = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_idem/entities",
        payload: payload1,
        headers: {
          "x-dm-token": token,
          "command-id": commandId,
        },
      });

      expect(res2.statusCode).toBe(201);
      const graphAfterRetry = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_idem/graph",
        headers: { "x-dm-token": token },
      });
      expect(graphAfterRetry.statusCode).toBe(200);
      const retryNodes = graphAfterRetry.json().nodes.filter((node: any) => node.id === "ent_idem_1");
      expect(retryNodes).toHaveLength(1);

      // 3. Attempt to reuse command-id with different payload (conflict) -> 409 Conflict
      const payloadConflict = {
        actorId: "usr_dm",
        entityId: "ent_idem_conflict",
        entityType: "npc",
        title: "Conflicting NPC",
      };

      const resConflict = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_idem/entities",
        payload: payloadConflict,
        headers: {
          "x-dm-token": token,
          "command-id": commandId,
        },
      });

      expect(resConflict.statusCode).toBe(409);
      expect(resConflict.json().error).toContain("Conflict: Command ID");
    });
  });
});
