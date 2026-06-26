import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-canvas-test-"));
  try {
    return await fn(dataDir);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

function getDmToken(server: any): string {
  return (server as any).dmSessionToken;
}

describe("Canvas integration and domain flow", () => {
  it("verifies campaign setup, default canvas creation, node management, conversion, security, and projections", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dmToken = getDmToken(server);
      const headers = { "x-dm-token": dmToken, "x-role": "dm" };

      // 1. New campaign gets default canvas
      const campId = "cmp_canvas_test";
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: { campaignId: campId, actorId: "usr_dm", title: "Canvas Campaign" },
        headers,
      });

      // GET canvases: verify default "Campaña" canvas exists
      let canvasesRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${campId}/canvases`,
        headers,
      });
      expect(canvasesRes.statusCode).toBe(200);
      let canvases = canvasesRes.json();
      expect(canvases).toHaveLength(1);
      const defaultCanvas = canvases[0];
      expect(defaultCanvas.title).toBe("Campaña");
      expect(defaultCanvas.kind).toBe("world");
      expect(defaultCanvas.nodes).toEqual([]);
      expect(defaultCanvas.edges).toEqual([]);

      const canvasId = defaultCanvas.id;

      // 2. CreateCanvas creates empty world canvas
      const customCanvasId = "cvs_custom";
      const createCanvasRes = await server.inject({
        method: "POST",
        url: `/api/campaigns/${campId}/canvases`,
        payload: { actorId: "usr_dm", canvasId: customCanvasId, title: "Secret Vault", kind: "location", description: "Dungeon floor 1" },
        headers,
      });
      expect(createCanvasRes.statusCode).toBe(201);

      // GET single canvas details (Projection check: CanvasCreated appears in campaign projection)
      const singleCanvasRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${campId}/canvases/${customCanvasId}`,
        headers,
      });
      expect(singleCanvasRes.statusCode).toBe(200);
      expect(singleCanvasRes.json()).toMatchObject({
        id: customCanvasId,
        title: "Secret Vault",
        kind: "location",
        description: "Dungeon floor 1",
      });

      // 3. Security check: player cannot create canvas
      const playerHeaders = { "x-role": "player" };
      const playerCreateRes = await server.inject({
        method: "POST",
        url: `/api/campaigns/${campId}/canvases`,
        payload: { actorId: "usr_player", canvasId: "cvs_player", title: "Hack", kind: "world" },
        headers: playerHeaders,
      });
      expect(playerCreateRes.statusCode).toBe(403);

      // Security check: request without dm-token or role header cannot write canvas
      const noTokenRes = await server.inject({
        method: "POST",
        url: `/api/campaigns/${campId}/canvases`,
        payload: { actorId: "usr_dm", canvasId: "cvs_no_token", title: "No Token", kind: "world" },
        headers: {}, // no headers at all
      });
      expect(noTokenRes.statusCode).toBe(403);

      // Security check: Invalid dm-token cannot write canvas
      const invalidTokenRes = await server.inject({
        method: "POST",
        url: `/api/campaigns/${campId}/canvases`,
        payload: { actorId: "usr_dm", canvasId: "cvs_invalid_token", title: "Bad Token", kind: "world" },
        headers: { "x-dm-token": "bad_token" },
      });
      expect(invalidTokenRes.statusCode).toBe(403);

      // 4. PlaceNodeOnCanvas rejects unknown entityId
      const badEntityNodeRes = await server.inject({
        method: "POST",
        url: `/api/campaigns/${campId}/canvases/${canvasId}/nodes`,
        payload: {
          actorId: "usr_dm",
          node: { id: "cvn_bad", kind: "entity", entityId: "ent_nonexistent", x: 10, y: 20 },
        },
        headers,
      });
      expect(badEntityNodeRes.statusCode).toBe(500); // throws Entity not found or archived

      // Create a valid entity first
      const entityId = "ent_mira";
      await server.inject({
        method: "POST",
        url: `/api/campaigns/${campId}/entities`,
        payload: { actorId: "usr_dm", entityId, entityType: "npc", title: "Mira" },
        headers,
      });

      // Place valid entity node (Projection: CanvasNodePlaced appears in canvas nodes)
      const placeNodeRes = await server.inject({
        method: "POST",
        url: `/api/campaigns/${campId}/canvases/${canvasId}/nodes`,
        payload: {
          actorId: "usr_dm",
          node: { id: "cvn_mira", kind: "entity", entityId, x: 100, y: 100 },
        },
        headers,
      });
      expect(placeNodeRes.statusCode).toBe(201);

      // Place a note node
      await server.inject({
        method: "POST",
        url: `/api/campaigns/${campId}/canvases/${canvasId}/nodes`,
        payload: {
          actorId: "usr_dm",
          node: { id: "cvn_note", kind: "note", text: "Some rumors...", x: 200, y: 200, color: "yellow" },
        },
        headers,
      });

      // PlaceNodeOnCanvas rejects unknown canvas
      const badCanvasNodeRes = await server.inject({
        method: "POST",
        url: `/api/campaigns/${campId}/canvases/cvs_unknown/nodes`,
        payload: {
          actorId: "usr_dm",
          node: { id: "cvn_test", kind: "note", text: "Test", x: 10, y: 10 },
        },
        headers,
      });
      expect(badCanvasNodeRes.statusCode).toBe(500);

      // Security check: Player cannot place node
      const playerPlaceRes = await server.inject({
        method: "POST",
        url: `/api/campaigns/${campId}/canvases/${canvasId}/nodes`,
        payload: {
          actorId: "usr_player",
          node: { id: "cvn_player", kind: "note", text: "Player Note", x: 50, y: 50 },
        },
        headers: playerHeaders,
      });
      expect(playerPlaceRes.statusCode).toBe(403);

      // 5. UpdateCanvasNode persists position
      const updateNodeRes = await server.inject({
        method: "PATCH",
        url: `/api/campaigns/${campId}/canvases/${canvasId}/nodes/cvn_mira`,
        payload: {
          actorId: "usr_dm",
          updates: { x: 150, y: 160 },
        },
        headers,
      });
      expect(updateNodeRes.statusCode).toBe(200);

      // Security check: Player cannot update node
      const playerUpdateRes = await server.inject({
        method: "PATCH",
        url: `/api/campaigns/${campId}/canvases/${canvasId}/nodes/cvn_mira`,
        payload: { actorId: "usr_player", updates: { x: 500, y: 500 } },
        headers: playerHeaders,
      });
      expect(playerUpdateRes.statusCode).toBe(403);

      // 6. CanvasNodesLayoutUpdated updates multiple nodes in bulk
      const bulkLayoutRes = await server.inject({
        method: "PATCH",
        url: `/api/campaigns/${campId}/canvases/${canvasId}/layout`,
        payload: {
          actorId: "usr_dm",
          nodeUpdates: [
            { nodeId: "cvn_mira", x: 180, y: 190 },
            { nodeId: "cvn_note", x: 280, y: 290 },
          ],
        },
        headers,
      });
      expect(bulkLayoutRes.statusCode).toBe(200);

      // Verify bulk update (Projection: CanvasNodesLayoutUpdated updates coordinates)
      let currentCanvasRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${campId}/canvases/${canvasId}`,
        headers,
      });
      let currentCanvas = currentCanvasRes.json();
      const nodeMira = currentCanvas.nodes.find((n: any) => n.id === "cvn_mira");
      const nodeNote = currentCanvas.nodes.find((n: any) => n.id === "cvn_note");
      expect(nodeMira.x).toBe(180);
      expect(nodeMira.y).toBe(190);
      expect(nodeNote.x).toBe(280);
      expect(nodeNote.y).toBe(290);

      // 7. AddEdgeToCanvas rejects unknown source/target nodes
      const badEdgeRes = await server.inject({
        method: "POST",
        url: `/api/campaigns/${campId}/canvases/${canvasId}/edges`,
        payload: {
          actorId: "usr_dm",
          edge: { id: "cve_bad", sourceNodeId: "cvn_mira", targetNodeId: "cvn_unknown", status: "draft" },
        },
        headers,
      });
      expect(badEdgeRes.statusCode).toBe(500);

      // Add valid edge (Projection: CanvasEdgeAdded appears in edges)
      const addEdgeRes = await server.inject({
        method: "POST",
        url: `/api/campaigns/${campId}/canvases/${canvasId}/edges`,
        payload: {
          actorId: "usr_dm",
          edge: { id: "cve_valid", sourceNodeId: "cvn_mira", targetNodeId: "cvn_note", status: "draft", style: "solid" },
        },
        headers,
      });
      expect(addEdgeRes.statusCode).toBe(201);

      // Security check: Player cannot remove edge
      const playerRemoveEdgeRes = await server.inject({
        method: "DELETE",
        url: `/api/campaigns/${campId}/canvases/${canvasId}/edges/cve_valid`,
        headers: playerHeaders,
      });
      expect(playerRemoveEdgeRes.statusCode).toBe(403);

      // 8. ConvertCanvasNoteToEntity creates entity and updates node
      const convertRes = await server.inject({
        method: "POST",
        url: `/api/campaigns/${campId}/canvases/${canvasId}/nodes/cvn_note/convert`,
        payload: {
          actorId: "usr_dm",
          entityType: "npc",
          title: "Rumor Monger",
          status: "alive",
          importance: "high",
        },
        headers,
      });
      expect(convertRes.statusCode).toBe(200);

      // Verify node is converted (kind becomes entity, text is removed)
      currentCanvasRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${campId}/canvases/${canvasId}`,
        headers,
      });
      currentCanvas = currentCanvasRes.json();
      const nodeConverted = currentCanvas.nodes.find((n: any) => n.id === "cvn_note");
      expect(nodeConverted.kind).toBe("entity");
      expect(nodeConverted.entityId).toBeDefined();
      expect(nodeConverted.text).toBeUndefined();

      // Verify the new entity is created in the campaign state
      const campaignStateRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${campId}`,
        headers,
      });
      const campaignState = campaignStateRes.json();
      const createdEntity = campaignState.entities.find((e: any) => e.entityId === nodeConverted.entityId);
      expect(createdEntity).toBeDefined();
      expect(createdEntity.title).toBe("Rumor Monger");
      expect(createdEntity.importance).toBe("high");

      // 9. RemoveNodeFromCanvas removes node and marks connected visual edges removed
      const removeNodeRes = await server.inject({
        method: "DELETE",
        url: `/api/campaigns/${campId}/canvases/${canvasId}/nodes/cvn_mira`,
        headers,
      });
      expect(removeNodeRes.statusCode).toBe(200);

      // Verify node cvn_mira and edge cve_valid are removed from canvas
      currentCanvasRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${campId}/canvases/${canvasId}`,
        headers,
      });
      currentCanvas = currentCanvasRes.json();
      expect(currentCanvas.nodes.some((n: any) => n.id === "cvn_mira")).toBe(false);
      expect(currentCanvas.edges.some((e: any) => e.id === "cve_valid")).toBe(false);

      // 10. CanvasArchived hides canvas from active list
      const archiveCanvasRes = await server.inject({
        method: "DELETE",
        url: `/api/campaigns/${campId}/canvases/${customCanvasId}`,
        headers,
      });
      expect(archiveCanvasRes.statusCode).toBe(200);

      // GET canvases: custom canvas should not be in the active list anymore
      canvasesRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${campId}/canvases`,
        headers,
      });
      canvases = canvasesRes.json();
      expect(canvases.some((c: any) => c.id === customCanvasId)).toBe(false);
    });
  });
});
