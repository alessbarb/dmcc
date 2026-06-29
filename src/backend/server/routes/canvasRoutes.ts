import type { FastifyInstance } from "fastify";
import type { EntityType, EntityImportance } from "@core/domain/entity/types.js";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";
import {
  assertDM,
  getValidatedVaultId,
  getValidatedCampaignId,
} from "../auth.js";

type CanvasKind = "world" | "session" | "mystery" | "location" | "characters" | "custom";

type CanvasNodeSpec = {
  id?: string;
  kind: "entity" | "note" | "group" | "image" | "fact";
  entityId?: string;
  factId?: string;
  text?: string;
  title?: string;
  color?: string;
  groupId?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  collapsed?: boolean;
  zIndex?: number;
  status?: "draft" | "ready" | "revealed" | "resolved";
  visibility?: "dm" | "public";
  metadata?: Record<string, unknown>;
};

type NodeUpdates = {
  text?: string;
  title?: string;
  color?: "yellow" | "blue" | "green" | "pink" | "purple";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  collapsed?: boolean;
  zIndex?: number;
  status?: "draft" | "ready" | "revealed" | "resolved";
  visibility?: "dm" | "public";
  metadata?: Record<string, unknown>;
};

type NodeLayoutUpdate = { nodeId: string; x: number; y: number; width?: number; height?: number; parentId?: string | null; groupId?: string | null };

type EdgeSpec = {
  id?: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipId?: string;
  label?: string;
  status: "draft" | "domain";
  visibility?: "dm" | "public";
  style?: "solid" | "dashed" | "secret" | "weak" | "strong";
  metadata?: Record<string, unknown>;
};

type EdgeUpdates = {
  label?: string;
  status?: "draft" | "domain";
  visibility?: "dm" | "public";
  style?: "solid" | "dashed" | "secret" | "weak" | "strong";
  metadata?: Record<string, unknown>;
};

type ConvertNodeBody = {
  actorId?: string;
  entityType: EntityType;
  title: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  status?: string;
  importance?: EntityImportance;
  visibility?: VisibilityRule;
  metadata?: Record<string, unknown>;
};

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
        const state = await repo.getCampaignState(campaignId);
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
        const state = await repo.getCampaignState(campaignId);
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
  server.post<{ Params: { campaignId: string }; Body: { actorId?: string; canvasId?: string; title: string; kind: CanvasKind; description?: string; template?: boolean } }>(
    "/api/campaigns/:campaignId/canvases",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, canvasId, title, kind, description, template } = request.body;

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
        await repo.executeCommand(campaignId, {
          type: "CreateCanvas",
          campaignId: campaignId,
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
  server.patch<{ Params: { campaignId: string; canvasId: string }; Body: { actorId?: string; title?: string; viewport?: { x: number; y: number; zoom: number }; description?: string } }>(
    "/api/campaigns/:campaignId/canvases/:canvasId",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, title, viewport, description } = request.body;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId, {
          type: "UpdateCanvas",
          campaignId: campaignId,
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
  server.delete<{ Params: { campaignId: string; canvasId: string }; Body: { actorId?: string } }>(
    "/api/campaigns/:campaignId/canvases/:canvasId",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const actorId = request.body?.actorId;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId, {
          type: "ArchiveCanvas",
          campaignId: campaignId,
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
  server.post<{ Params: { campaignId: string; canvasId: string }; Body: { actorId?: string; node: CanvasNodeSpec } }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/nodes",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, node } = request.body;

      if (!node || !node.kind) {
        reply.code(400);
        return { error: "Node specification with kind is required" };
      }

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId, {
          type: "PlaceNodeOnCanvas",
          campaignId: campaignId,
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
  server.patch<{ Params: { campaignId: string; canvasId: string; nodeId: string }; Body: { actorId?: string; updates: NodeUpdates } }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/nodes/:nodeId",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, updates } = request.body;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId, {
          type: "UpdateCanvasNode",
          campaignId: campaignId,
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
  server.patch<{ Params: { campaignId: string; canvasId: string }; Body: { actorId?: string; nodeUpdates: NodeLayoutUpdate[] } }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/layout",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, nodeUpdates } = request.body;

      if (!Array.isArray(nodeUpdates)) {
        reply.code(400);
        return { error: "nodeUpdates array is required" };
      }

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId, {
          type: "UpdateCanvasNodesLayout",
          campaignId: campaignId,
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
  server.delete<{ Params: { campaignId: string; canvasId: string; nodeId: string }; Body: { actorId?: string } }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/nodes/:nodeId",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const actorId = request.body?.actorId;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId, {
          type: "RemoveNodeFromCanvas",
          campaignId: campaignId,
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
  server.post<{ Params: { campaignId: string; canvasId: string }; Body: { actorId?: string; edge: EdgeSpec } }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/edges",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, edge } = request.body;

      if (!edge || !edge.sourceNodeId || !edge.targetNodeId) {
        reply.code(400);
        return { error: "Edge source and target nodes are required" };
      }

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId, {
          type: "AddEdgeToCanvas",
          campaignId: campaignId,
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
  server.patch<{ Params: { campaignId: string; canvasId: string; edgeId: string }; Body: { actorId?: string; updates: EdgeUpdates } }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/edges/:edgeId",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, updates } = request.body;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId, {
          type: "UpdateCanvasEdge",
          campaignId: campaignId,
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
  server.delete<{ Params: { campaignId: string; canvasId: string; edgeId: string }; Body: { actorId?: string } }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/edges/:edgeId",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const actorId = request.body?.actorId;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId, {
          type: "RemoveEdgeFromCanvas",
          campaignId: campaignId,
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
  server.post<{ Params: { campaignId: string; canvasId: string; nodeId: string }; Body: ConvertNodeBody }>(
    "/api/campaigns/:campaignId/canvases/:canvasId/nodes/:nodeId/convert",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
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
      } = request.body;

      if (!entityType || !title) {
        reply.code(400);
        return { error: "Entity type and title are required for conversion" };
      }

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId, {
          type: "ConvertCanvasNoteToEntity",
          campaignId: campaignId,
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
