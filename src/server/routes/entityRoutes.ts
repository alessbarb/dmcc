import type { FastifyInstance } from "fastify";
import { EventStore } from "../../persistence/eventStore/eventStore.js";
import { SnapshotStore } from "../../persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "../../persistence/repositories/campaignRepository.js";
import {
  assertCampaignAccess,
  getValidatedVaultId,
  getValidatedCampaignId,
} from "../auth.js";
import { getCharacterEntityIdForPlayer } from "../helpers.js";

const VALID_ENTITY_TYPES = [
  "player_character", "npc", "location", "faction", "quest", "clue", "secret",
  "item", "creature", "encounter", "scene", "front", "clock", "decision",
  "consequence", "rumor", "rule_reference", "handout", "note",
];

export async function registerEntityRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  server.post<{ Params: { campaignId: string }; Body: any }>(
    "/api/campaigns/:campaignId/entities",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const body = request.body as any;
      const { actorId, entityId, entityType, title, subtitle, summary, content,
        status, importance, visibility, metadata, tagIds, createdInSessionId } = body;
      const playerId = request.headers["x-player-id"] as string;

      if (!title || title.trim() === "") {
        reply.code(400);
        return { error: "Entity title is required" };
      }
      if (!entityType || !VALID_ENTITY_TYPES.includes(entityType)) {
        reply.code(400);
        return { error: `Invalid entityType '${entityType}'. Must be one of: ${VALID_ENTITY_TYPES.join(", ")}` };
      }
      if (entityId && !entityId.startsWith("ent_")) {
        reply.code(400);
        return { error: "entityId must start with 'ent_'" };
      }

      const repo = getRepository(vaultId);
      let state;
      try {
        state = await repo.getCampaignState(campaignId as any);
      } catch {
        reply.code(404);
        return { error: "Campaign not found" };
      }

      const role = assertCampaignAccess(request, state, campaignId, (server as any).dmSessionToken);

      if (role !== "dm") {
        if (!playerId) {
          reply.code(401);
          return { error: "Unauthorized: Player id is required" };
        }
        if (entityType !== "note") {
          reply.code(403);
          return { error: "Forbidden: Players can only create notes" };
        }
      }

      try {
        // For DM-created player_character entities without a playerId, mark as premade
        // so they can serve as pre-built characters available for player selection.
        let resolvedMetadata = metadata;
        if (role !== "player" && entityType === "player_character" && !metadata?.playerId) {
          resolvedMetadata = { ...metadata, isPremade: true };
        }

        const projection = await repo.executeCommand(campaignId as any, {
          type: "CreateEntity",
          campaignId: campaignId as any,
          actorId: role === "player" ? playerId : (actorId || "usr_dm"),
          entityId: entityId as any,
          entityType,
          title,
          summary,
          content,
          status: status || "",
          importance: importance || "normal",
          visibility: role === "player"
            ? { kind: "players" as const, playerIds: [playerId] }
            : (visibility || { kind: "dm_only" as const }),
          subtitle,
          tagIds: tagIds || [],
          createdInSessionId,
          metadata: resolvedMetadata,
        });
        const created = Array.from(projection.entities.values()).find(
          (e: any) => e.title === title && !e.archived
        );
        reply.code(201);
        return created || { campaignId, entityType, title };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  const handleEditEntity = async (request: any, reply: any) => {
    const vaultId = getValidatedVaultId(request);
    const campaignId = getValidatedCampaignId(request.params.campaignId);
    const entityId = request.params.entityId;
    const updates = request.body as any;
    const playerId = request.headers["x-player-id"] as string;

    const repo = getRepository(vaultId);

    try {
      const state = await repo.getCampaignState(campaignId as any);
      const existing = state.entities.get(entityId);
      if (!existing) {
        reply.code(404);
        return { error: "Entity not found" };
      }

      const role = assertCampaignAccess(request, state, campaignId, (server as any).dmSessionToken);

      if (role !== "dm") {
        const rawEntities = Array.from(state.entities.values());
        const characterEntityId = playerId ? getCharacterEntityIdForPlayer(rawEntities, playerId) : undefined;
        const isCharacter = entityId === characterEntityId;
        const isPlayerNote = (existing as any).entityType === "note"
          && (existing as any).visibility?.kind === "players"
          && (existing as any).visibility?.playerIds?.includes(playerId);
        if (!isCharacter && !isPlayerNote) {
          reply.code(403);
          return { error: "Forbidden: Players can only edit their own character or notes" };
        }
      }

      const allowedUpdates = role === "dm"
        ? updates
        : {
            ...(updates.title !== undefined && { title: updates.title }),
            ...(updates.summary !== undefined && { summary: updates.summary }),
            ...(updates.content !== undefined && { content: updates.content }),
            ...(updates.metadata !== undefined && { metadata: updates.metadata }),
          };

      await repo.executeCommand(campaignId as any, {
        type: "UpdateEntity",
        campaignId: campaignId as any,
        actorId: role === "player" ? playerId : "usr_dm",
        entityId: entityId as any,
        ...(allowedUpdates.title !== undefined && { title: allowedUpdates.title }),
        ...(allowedUpdates.subtitle !== undefined && { subtitle: allowedUpdates.subtitle }),
        ...(allowedUpdates.tagIds !== undefined && { tagIds: allowedUpdates.tagIds }),
        ...(allowedUpdates.summary !== undefined && { summary: allowedUpdates.summary }),
        ...(allowedUpdates.content !== undefined && { content: allowedUpdates.content }),
        ...(allowedUpdates.status !== undefined && { status: allowedUpdates.status }),
        ...(allowedUpdates.importance !== undefined && { importance: allowedUpdates.importance }),
        ...(allowedUpdates.visibility !== undefined && { visibility: allowedUpdates.visibility }),
        ...(allowedUpdates.metadata !== undefined && { metadata: allowedUpdates.metadata }),
      });
      return { ...existing, ...allowedUpdates, entityId, updatedAt: new Date().toISOString() };
    } catch (err: any) {
      if (err.statusCode) {
        reply.code(err.statusCode);
        return { error: err.message };
      }
      reply.code(500);
      return { error: err.message };
    }
  };

  server.put<{ Params: { campaignId: string; entityId: string }; Body: any }>(
    "/api/campaigns/:campaignId/entities/:entityId",
    handleEditEntity
  );
  server.patch<{ Params: { campaignId: string; entityId: string }; Body: any }>(
    "/api/campaigns/:campaignId/entities/:entityId",
    handleEditEntity
  );

  server.delete<{ Params: { campaignId: string; entityId: string } }>(
    "/api/campaigns/:campaignId/entities/:entityId",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const entityId = request.params.entityId;
      const playerId = request.headers["x-player-id"] as string;

      const repo = getRepository(vaultId);

      try {
        const state = await repo.getCampaignState(campaignId as any);
        const existing = state.entities.get(entityId);
        if (!existing) {
          reply.code(404);
          return { error: "Entity not found" };
        }

        const role = assertCampaignAccess(request, state, campaignId, (server as any).dmSessionToken);

        if (role !== "dm") {
          const isPlayerNote = (existing as any).entityType === "note"
            && (existing as any).visibility?.kind === "players"
            && (existing as any).visibility?.playerIds?.includes(playerId);
          if (!isPlayerNote) {
            reply.code(403);
            return { error: "Forbidden: Players can only archive their own notes" };
          }
        }

        await repo.executeCommand(campaignId as any, {
          type: "ArchiveEntity",
          campaignId: campaignId as any,
          actorId: role === "player" ? playerId : "usr_dm",
          entityId: entityId as any,
        });
        return { ok: true };
      } catch (err: any) {
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );
}
