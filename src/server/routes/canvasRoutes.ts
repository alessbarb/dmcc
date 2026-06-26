import type { FastifyInstance } from "fastify";
import { EventStore } from "../../persistence/eventStore/eventStore.js";
import { SnapshotStore } from "../../persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "../../persistence/repositories/campaignRepository.js";
import {
  assertDM,
  getValidatedVaultId,
  getValidatedCampaignId,
} from "../auth.js";

export async function registerCanvasRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  // GET all canvases for campaign
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/canvases",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId as any);
        // Only return non-archived canvases
        const canvases = Array.from(state.canvases?.values() || []).filter((c: any) => !c.archived);
        return canvases;
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // GET single canvas details
  server.get<{ Params: { campaignId: string; canvasId: string } }>(
    "/api/campaigns/:campaignId/canvases/:canvasId",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId as any);
        const canvas = state.canvases?.get(request.params.canvasId);
        if (!canvas || canvas.archived) {
          reply.code(404);
          return { error: "Canvas not found" };
        }
        return canvas;
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // POST create a new canvas
  server.post<{ Params: { campaignId: string }; Body: any }>(
    "/api/campaigns/:campaignId/canvases",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, canvasId, title, kind, description, template } = request.body as any;

      if (!title || title.trim() === "") {
        reply.code(400);
        return { error: "Canvas title is required" };
      }
      if (!kind) {
        reply.code(400);
        return { error: "Canvas kind is required" };
      }

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "CreateCanvas",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          canvasId,
          title,
          kind,
          description,
          template: template ?? true,
        });
        reply.code(201);
        return { campaignId, title, kind };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // PATCH update canvas details or viewport
  server.patch<{ Params: { campaignId: string; canvasId: string }; Body: any }>(
    "/api/campaigns/:campaignId/canvases/:canvasId",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, title, viewport, description } = request.body as any;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "UpdateCanvas",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          canvasId: request.params.canvasId,
          title,
          viewport,
          description,
        });
        return { success: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // DELETE archive canvas
  server.delete<{ Params: { campaignId: string; canvasId: string }; Body: any }>(
    "/api/campaigns/:campaignId/canvases/:canvasId",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const actorId = (request.body as any)?.actorId;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "ArchiveCanvas",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          canvasId: request.params.canvasId,
        });
        return { success: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // POST place a node
  server.post<{ Params: { campaignId: string; canvasId: string }; Body: any }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/nodes",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, node } = request.body as any;

      if (!node || !node.kind) {
        reply.code(400);
        return { error: "Node specification with kind is required" };
      }

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "PlaceNodeOnCanvas",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          canvasId: request.params.canvasId,
          node,
        });
        reply.code(201);
        return { success: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // PATCH update canvas node
  server.patch<{ Params: { campaignId: string; canvasId: string; nodeId: string }; Body: any }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/nodes/:nodeId",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, updates } = request.body as any;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "UpdateCanvasNode",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          canvasId: request.params.canvasId,
          nodeId: request.params.nodeId,
          updates,
        });
        return { success: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // PATCH bulk update nodes positions/sizes layout
  server.patch<{ Params: { campaignId: string; canvasId: string }; Body: any }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/layout",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, nodeUpdates } = request.body as any;

      if (!Array.isArray(nodeUpdates)) {
        reply.code(400);
        return { error: "nodeUpdates array is required" };
      }

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "UpdateCanvasNodesLayout",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          canvasId: request.params.canvasId,
          nodeUpdates,
        });
        return { success: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // DELETE remove node
  server.delete<{ Params: { campaignId: string; canvasId: string; nodeId: string }; Body: any }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/nodes/:nodeId",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const actorId = (request.body as any)?.actorId;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "RemoveNodeFromCanvas",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          canvasId: request.params.canvasId,
          nodeId: request.params.nodeId,
        });
        return { success: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // POST add edge
  server.post<{ Params: { campaignId: string; canvasId: string }; Body: any }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/edges",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, edge } = request.body as any;

      if (!edge || !edge.sourceNodeId || !edge.targetNodeId) {
        reply.code(400);
        return { error: "Edge source and target nodes are required" };
      }

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "AddEdgeToCanvas",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          canvasId: request.params.canvasId,
          edge,
        });
        reply.code(201);
        return { success: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // PATCH update edge
  server.patch<{ Params: { campaignId: string; canvasId: string; edgeId: string }; Body: any }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/edges/:edgeId",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, updates } = request.body as any;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "UpdateCanvasEdge",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          canvasId: request.params.canvasId,
          edgeId: request.params.edgeId,
          updates,
        });
        return { success: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // DELETE remove edge
  server.delete<{ Params: { campaignId: string; canvasId: string; edgeId: string }; Body: any }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/edges/:edgeId",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const actorId = (request.body as any)?.actorId;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "RemoveEdgeFromCanvas",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          canvasId: request.params.canvasId,
          edgeId: request.params.edgeId,
        });
        return { success: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // POST convert note to entity
  server.post<{ Params: { campaignId: string; canvasId: string; nodeId: string }; Body: any }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/nodes/:nodeId/convert",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const {
        actorId,
        entityType,
        title,
        subtitle,
        summary,
        content,
        status,
        importance,
        visibility,
        metadata
      } = request.body as any;

      if (!entityType || !title) {
        reply.code(400);
        return { error: "Entity type and title are required for conversion" };
      }

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "ConvertCanvasNoteToEntity",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          canvasId: request.params.canvasId,
          nodeId: request.params.nodeId,
          entityType,
          title,
          subtitle,
          summary,
          content,
          status,
          importance,
          visibility,
          metadata,
        });
        return { success: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );
}
